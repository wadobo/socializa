from django.contrib.auth.models import User
from drf_extra_fields.geo_fields import PointField
from rest_framework import serializers


class PlayerSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    pos = PointField(required=False)
    ia = serializers.BooleanField()

    class Meta:
        model = User
        fields = ('username', 'email')
