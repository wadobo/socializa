from rest_framework import serializers

from game.serializers import GameSerializer


class EventSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    game = GameSerializer()
    start_date = serializers.DateTimeField()
    end_date = serializers.DateTimeField()
    max_players = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=5, decimal_places=2)
    joined = serializers.SerializerMethodField('is_player_joined')
    solved = serializers.SerializerMethodField('solution')

    def is_player_joined(self, event):
        player = self.context.get("player")
        if player in event.players.all():
            return True
        else:
            return False

    def solution(self, event):
        player = self.context.get("player")
        if player in event.players.all():
            try:
                membership = event.membership_set.get(player=player)
                if membership.status == 'solved':
                    return event.game.solution
            except:
                return None
        else:
            return None
