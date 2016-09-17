from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.measure import D


class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user")
    pos = models.PointField(null=True, blank=True)

    def set_position(self, lat, lon):
        self.pos = GEOSGeometry('POINT(%d %d)' % (lat, lon))
        self.save()

    def __str__(self):
        return "%s %s" % (self.user.username, self.pos.coords)

    def serialize(self):
        return {
            'username': self.user.username,
            'pos': self.pos.coords
        }
