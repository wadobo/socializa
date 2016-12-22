from rest_framework import serializers

from game.serializers import ChallengeSerializer
from player.serializers import PlayerSerializer


class ClueSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    player = PlayerSerializer()
    challenge = ChallengeSerializer()
    status = serializers.CharField()
    main = serializers.BooleanField()
