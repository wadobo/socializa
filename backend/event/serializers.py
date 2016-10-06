from rest_framework import serializers

from event.models import Event


class EventSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    start_date = serializers.DateTimeField()
    end_date = serializers.DateTimeField()
    max_players = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=5, decimal_places=2)
