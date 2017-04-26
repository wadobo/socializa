import unidecode

from django.shortcuts import get_object_or_404
from rest_framework import status as rf_status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import BasePermission

from game.models import Game
from .models import Clue
from .serializers import ClueSerializer


def normalize(txt):
    return unidecode.unidecode(txt).strip().lower()


class HasCluePermission(BasePermission):
    def __init__(self):
        self.message = "Clue doesn't exists"

    def has_permission(self, request, view):
        clueid = view.kwargs.get('clue_id', '')
        player = request.user.player
        if not Clue.objects.filter(pk=clueid, player=player).exists():
            return False
        return True


def attach_clue(player, event, main=False):
    game = event.game
    challenges = game.challenges.all()
    challenges_attach = Clue.objects.filter(challenge__in=challenges, main=True).\
            values_list('challenge__pk', flat=True)
    challenges = game.challenges.exclude(pk__in=challenges_attach)
    avail_challenges = challenges.exclude(pk__in=challenges_attach)

    if avail_challenges:
        clue = Clue(player=player, challenge=avail_challenges[0], main=True, event=event)
        clue.save()


def detach_clue(player, event, main=False):
    game = event.game
    challenges = game.challenges.all()
    clue = Clue.objects.filter(player=player, challenge__in=challenges, main=True, event=event)
    if clue:
        clue.delete()


class MyClues(APIView):

    @classmethod
    def get(cls, request, game_id):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)

        player = request.user.player
        game = get_object_or_404(Game, pk=game_id)
        challenges = game.challenges.all()
        clues = Clue.objects.filter(player=player, challenge__in=challenges).order_by('created')
        serializer = ClueSerializer(clues, many=True)
        data = serializer.data
        return Response(data)


class SolveClue(APIView):

    permission_classes = [IsAuthenticated, HasCluePermission]

    @classmethod
    def post(cls, request, clue_id):
        """ Try solve clue_id with solution. """

        player = request.user.player
        clue = get_object_or_404(Clue, pk=clue_id, player=player)
        event = clue.event

        solution = normalize(request.data.get('solution', ''))
        correct_solution = normalize(clue.challenge.solution)

        if not solution or not correct_solution:
            return Response("Bad request", status=rf_status.HTTP_400_BAD_REQUEST)

        status = rf_status.HTTP_200_OK
        if correct_solution != solution:
            response = {'status': 'incorrect'}
        else:
            response = {'status': 'correct'}
            clue.status = 'solved'
            clue.save()

            challenges = clue.challenge.child_challenges.all()
            for ch in challenges:
                clue, new = Clue.objects.get_or_create(player=player,
                                                       event=event, challenge=ch)
                clue.save()
                # returning the last clue given
                response['clue'] = ClueSerializer(clue).data if clue else {}
        return Response(response, status)


my_clues = MyClues.as_view()
solve_clue = SolveClue.as_view()
