from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry
from django.core.exceptions import ValidationError


class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="player")
    pos = models.PointField(null=True, blank=True)

    def set_position(self, lon, lat):
        self.pos = GEOSGeometry('POINT({0} {1})'.format(lon, lat))
        self.save()

    def __str__(self):
        if self.pos:
            coords = self.pos.coords
        else:
            coords = "(None, None)"
        return "%s %s" % (self.user.username, coords)


class Meeting(models.Model):
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="player1")
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="player2")
    event_id = models.IntegerField(null=True, blank=True, default=None)

    def clean_fields(self, *args, **kwargs):
        super(Meeting, self).clean_fields(*args, **kwargs)
        if self.player1 == self.player2:
            raise ValidationError({'player2': ["narcissistic: you cannot connect with yourself",]})

    def __str__(self):
        return "%s - %s" % (self.player1.user.username, self.player2.user.username)
