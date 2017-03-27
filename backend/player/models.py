from random import SystemRandom
from string import ascii_uppercase, digits

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry
from django.core.exceptions import ValidationError


PLAYER_TYPE = (
    ('ai', 'AI'),
    ('actor', 'actor'),
    ('player', 'player'),
)


class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="player")
    pos = models.PointField(null=True, blank=True)
    ptype = models.CharField(max_length=16, choices=PLAYER_TYPE, default='player')
    about = models.TextField(blank=True, null=True)
    extra = models.TextField(max_length=1024, blank=True, null=True)

    def set_position(self, lon, lat):
        self.pos = GEOSGeometry('POINT({0} {1})'.format(lon, lat))
        self.save()

    def delete_position(self):
        self.pos = None
        self.save()

    def get_coords(self):
        return self.pos.coords if self.pos else "(None, None)"

    def visible(self, p):
        from player.views import distance

        try:
            ev = self.playing_event.event
            max_distance = ev.get_meeting_distance()
        except:
            max_distance = settings.DEFAULT_MEETING_DISTANCE

        return distance(self.pos, p.pos, unit='m') <= max_distance

    def __str__(self):
        return self.user.username


class PlayerInterests(models.Model):
    user = models.ForeignKey(Player, related_name="interests")
    text = models.CharField(max_length=100)

    def __str__(self):
        return "%s - %s" % (self.user, self.text)


MEETING_STATUS = (
    ('connected', 'connected'),
    ('step1', 'step1'),
    ('step2', 'step2'),
    ('waiting', 'waiting'),
)


class Meeting(models.Model):
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="player1")
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="player2")
    event_id = models.IntegerField(null=True, blank=True, default=None)
    status = models.CharField(max_length=16, choices=MEETING_STATUS, default='connected')
    secret = models.CharField(max_length=settings.QR_LENGTH, null=True, blank=True, default=None)

    def clean_fields(self, *args, **kwargs):
        super(Meeting, self).clean_fields(*args, **kwargs)
        if self.player1 == self.player2:
            raise ValidationError({'player2': ["narcissistic: you cannot connect with yourself"]})

    def generate_secret(self):
        """ generate a secret for convert in QR and change to status 'step2' """
        chars = ascii_uppercase + digits
        length = settings.QR_LENGTH
        self.secret = ''.join([SystemRandom().choice(chars) for i in range(length)])
        self.status = 'step2'
        self.save()

    def __str__(self):
        return "{0} - {1}".format(self.player1, self.player2)
