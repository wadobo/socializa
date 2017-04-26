from rest_framework import serializers

from game.serializers import ChallengeSerializer
from player.serializers import PlayerSerializer


class ClueSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    player = PlayerSerializer()
    challenge = ChallengeSerializer()
    status = serializers.CharField()
    main = serializers.BooleanField()
    solution = serializers.SerializerMethodField('clue_has_solution')

    def clue_has_solution(self, clue):
        if clue.status == 'solved':
            return clue.challenge.solution

        return bool(clue.challenge.solution)
