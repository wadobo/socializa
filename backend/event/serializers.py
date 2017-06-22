from rest_framework import serializers

from clue.utils import possible_solutions
from game.serializers import GameSerializer
from game.serializers import FullGameSerializer
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
    solved = serializers.SerializerMethodField('is_solved')
    solution = serializers.SerializerMethodField()
    admin = serializers.SerializerMethodField('is_admin')

    vision_distance = serializers.IntegerField()
    meeting_distance = serializers.IntegerField()

    def is_player_joined(self, event):
        player = self.context.get("player")
        return player in event.players.all()

    def is_event_solved(self, event):
        player = self.context.get("player")
        return event.membership_set.filter(player=player, status='solved').exists()

    def is_solved(self, event):
        return True if (self.is_player_joined(event) and self.is_event_solved(event)) else False

    def get_solution(self, event):
        if self.is_solved(event):
            return event.game.solution
        elif event.game.get_extra('options'):
            return event.game.get_extra('options')

        player = self.context.get("player")
        return possible_solutions(player, event)

    def is_admin(self, event):
        player = self.context.get("player")
        if not player:
            return False
        return bool(event.owners.filter(pk=player.user.pk).exists())


class FullEventSerializer(EventSerializer):
    players = PlayerSerializer(many=True)
    game = FullGameSerializer()


class AdminChallengeSerializer(ChallengeSerializer):
    player = serializers.SerializerMethodField('challenge_player')

    def challenge_player(self, challenge):
        p = None
        clue = challenge.mainclues().first()
        if clue and clue.player:
            p = PlayerSerializer(clue.player).data
        return p
