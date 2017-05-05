from decimal import Decimal
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.gis.geos import Point
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from game.models import Game
from player.models import Player
from socializa.celery import app


class Event(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    place = models.MultiPolygonField(blank=True, null=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    max_players = models.PositiveIntegerField(default=10)
    price = models.PositiveIntegerField(default=0)
    game = models.ForeignKey(Game, related_name="events", null=True)
    players = models.ManyToManyField(Player, through="Membership")
    vision_distance = models.PositiveIntegerField(default=settings.DEFAULT_VISION_DISTANCE,
                                                  null=True, blank=True,
                                                  help_text='max vision ditance in m')
    meeting_distance = models.PositiveIntegerField(default=settings.DEFAULT_MEETING_DISTANCE,
                                                   null=True,
                                                   blank=True,
                                                   help_text='max meeting ditance in m')
    owners = models.ManyToManyField(User, related_name="events")
    task_id = models.CharField(max_length=512, blank=True, null=True)

    def status(self):
        return "[{0}/{1}]".format(self.players.count(), self.max_players)

    def get_max_ratio(self):
        """ Get the bigger distance between center of poly and vertices of poly.
        This distance will be used for create a circle for obtain random coords.
        You should check previously if place is not None. """
        if self.place is None:
            assert "It can't obtain max ratio if place not exist."
        _transform2meter = 100 * 1000
        _center = self.place.centroid
        max_distance = 0
        for _coord in self.place.coords[0][0]:
            _distance = _center.distance(Point(_coord))
            if _distance > max_distance:
                max_distance = _distance
        return max_distance * _transform2meter

    def get_meeting_distance(self):
        return self.meeting_distance or settings.DEFAULT_MEETING_DISTANCE

    def set_playing(self, player):
        m, new = Membership.objects.get_or_create(player=player, event=self)
        m.save()
        p, new = PlayingEvent.objects.get_or_create(player=player, event=self)
        p.save()

    def __str__(self):
        return self.name


MEMBERSHIP_STATUS = (
    ('registered', 'registered'),
    ('paying', 'paying'),
    ('payed', 'payed'),
    ('cancelled', 'cancelled'),
    ('solved', 'solved'),
)


class Membership(models.Model):
    player = models.ForeignKey(Player)
    event = models.ForeignKey(Event)
    status = models.CharField(max_length=16, choices=MEMBERSHIP_STATUS, default='registered')

    def __str__(self):
        return "{0} ∈ {1}".format(self.player.user.username, self.event.name)


class PlayingEvent(models.Model):
    player = models.OneToOneField(Player, related_name="playing_event")
    event = models.ForeignKey(Event, blank=True, null=True, related_name="playing_event")


@receiver(post_save, sender=Event, dispatch_uid="update_event_task")
def update_event_task(sender, instance, **kwargs):
    from .tasks import manage_ais_task
    if instance.task_id:
        app.control.revoke(instance.task_id)
    if not instance.start_date or instance.start_date < timezone.now():
        return
    task = manage_ais_task.apply_async((instance, ), eta=instance.start_date)
    # for avoid recursion, save with update instead save()
    Event.objects.filter(pk=instance.pk).update(task_id=task.id)
