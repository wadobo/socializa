from decimal import Decimal
from django.conf import settings
from django.contrib.gis.db import models

from game.models import Game
from player.models import Player
from world.models import WorldBorder


class Event(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    world = models.ForeignKey(WorldBorder, on_delete=models.CASCADE, related_name="world",
            blank=True, null=True)
    place = models.MultiPolygonField(blank=True, null=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    max_players = models.PositiveIntegerField(default=10)
    price = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    game = models.ForeignKey(Game, related_name="events", null=True)
    players = models.ManyToManyField(Player, through="Membership")
    max_ratio_km = models.PositiveIntegerField(default=settings.DEFAULT_MAX_RATIO,
            null=True, blank=True, help_text='max ratio in km')
    meeting_distance = models.PositiveIntegerField(default=settings.DEFAULT_MEETING_DISTANCE,
            null=True, blank=True, help_text='max meeting ditance in m')

    def status(self):
        return "[{0}/{1}]".format(self.players.count(), self.max_players)

    def get_max_ratio(self):
        return self.max_ratio_km if self.max_ratio_km else settings.DEFAULT_MAX_RATIO

    def get_meeting_distance(self):
        return self.meeting_distance if self.meeting_distance else settings.DEFAULT_MEETING_DISTANCE

    def __str__(self):
        return self.name


MEMBERSHIP_STATUS = (
        ('registered', 'registered'),
        ('paying', 'paying'),
        ('payed', 'payed'),
        ('cancelled', 'cancelled'),
)

class Membership(models.Model):
    player = models.ForeignKey(Player)
    event = models.ForeignKey(Event)
    status = models.CharField(max_length=16, choices=MEMBERSHIP_STATUS, default='registered')

    def __str__(self):
        return "{0} ∈ {1}".format(self.player.user.username, self.event.name)
