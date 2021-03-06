from django.contrib.auth.models import User
from drf_extra_fields.geo_fields import PointField
from rest_framework import serializers


class PlayerSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    pos = PointField(required=False)
    ptype = serializers.CharField()
    about = serializers.CharField()
    interests = serializers.SerializerMethodField('player_interests')
    username = serializers.SerializerMethodField('player_username')

    def player_interests(self, player):
        interests = [i.text for i in player.interests.all()]
        return interests

    def player_username(self, player):
        return player.user.username

    class Meta:
        model = User
        fields = ('username', 'email')
