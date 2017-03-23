from rest_framework import serializers


class GameSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    desc = serializers.CharField()
    visible_players = serializers.BooleanField()


class ChallengeSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    desc = serializers.CharField()
    ctype = serializers.CharField()
