from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry


class Player(models.Model):
    TYPES = (
        ('ai', 'AI'),
        ('actor', 'actor'),
        ('human', 'human'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='player')
    position = models.PointField(null=True, blank=True)
    type = models.CharField(max_length=16, choices=TYPES, default='human')
    created = models.DateTimeField(auto_now_add=True)

    @classmethod
    def create(cls, email, password, type='human'):
        user = User.objects.create_user(email, email, password)
        user.save()
        player = cls(user=user, type=type)
        return player

    def set_position(self, lon=None, lat=None):
        if lon is None and lat is None:
            self.position = None
        else:
            self.position = GEOSGeometry('POINT({0} {1})'.format(lon, lat))
        self.save()

    def get_coords(self):
        return self.position.coords if self.pos else '(None, None)'

    def __str__(self):
        return self.user.username

