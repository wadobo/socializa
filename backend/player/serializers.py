from django.contrib.auth.models import User
from drf_extra_fields.geo_fields import PointField
from rest_framework import serializers

from player.models import Player


class PlayerSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    pos = PointField(required=False)

    class Meta:
        model = User
        fields = ('username', 'email')
