from django.shortcuts import get_object_or_404
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Clue
from .serializers import ClueSerializer
from game.models import Game


def attachClue(player, game, main=False):
    challenges = game.challenges.all()
    challenges_attach = Clue.objects.filter(challenge__in=challenges, main=True).values_list('pk', flat=True)
    challenges = game.challenges.exclude(pk__in=challenges_attach)
    avail_challenges = challenges.exclude(pk__in=challenges_attach)

    if avail_challenges:
        clue = Clue(player=player, challenge=avail_challenges[0], main=True)
        clue.save()


def detachClue(player, game, main=False):
    challenges = game.challenges.all()
    clue = Clue.objects.filter(player=player, challenge__in=challenges, main=True)
    if clue:
        clue.delete()


class MyClues(APIView):

    def get(self, request, game_id):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)

        player = request.user.player
        game = get_object_or_404(Game, pk=game_id)
        clues = Clue.objects.filter(player=player, challenge__in=game.challenges.all())
        serializer = ClueSerializer(clues, many=True)
        data = serializer.data
        return Response(data)

my_clues = MyClues.as_view()
