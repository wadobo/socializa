from rest_framework import serializers


class GameSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    desc = serializers.CharField()
