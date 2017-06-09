import unidecode

from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission
from rest_framework.permissions import IsAuthenticated

from .models import Game
from .models import Challenge
from .serializers import FullGameSerializer


class IsGameAuthorPermission(BasePermission):
    def has_permission(self, request, view):
        super().has_permission(request, view)
        gameid = view.kwargs.get('game_id', '')

        if not gameid:
            return True

        return Game.objects.filter(pk=gameid, author=request.user).exists()


class GameView(APIView):

    permission_classes = [IsAuthenticated, IsGameAuthorPermission]

    @classmethod
    def get(cls, request, game_id):
        game = get_object_or_404(Game, pk=game_id)
        serializer = FullGameSerializer(game)
        data = serializer.data
        return Response(data)

    @classmethod
    def post(cls, request, game_id):
        game = request.data;
        challenges = request.data['challenges']
        return Response({'status': 'ok'})


game = GameView.as_view()
