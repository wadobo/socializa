from rest_framework import serializers

from game.serializers import GameSerializer
from game.serializers import ChallengeSerializer
from player.serializers import PlayerSerializer


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
    admin = serializers.SerializerMethodField('is_admin')

    vision_distance = serializers.IntegerField()
    meeting_distance = serializers.IntegerField()

    def is_player_joined(self, event):
        player = self.context.get("player")
        return player in event.players.all()

    def is_event_solved(self, event):
        player = self.context.get("player")
        return event.membership_set.filter(player=player, status='solved').exists()

    def solution(self, event):
        if self.is_player_joined(event) and self.is_event_solved(event):
            return event.game.solution
        else:
            return None

        return None

    def is_admin(self, event):
        player = self.context.get("player")
        if not player:
            return False
        return bool(event.owners.filter(pk=player.user.pk).exists())


class AdminChallengeSerializer(ChallengeSerializer):
    player = serializers.SerializerMethodField('challenge_player')

    def challenge_player(self, challenge):
        p = None
        clue = challenge.mainclues().first()
        if clue and clue.player:
            p = PlayerSerializer(clue.player).data
        return p
