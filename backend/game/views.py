import unidecode

from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission
from rest_framework.permissions import IsAuthenticated

from .models import Game
from .models import Challenge
from .serializers import FullGameSerializer


class HasGamePermission(BasePermission):
    def __init__(self):
        self.message = "Game doesn't exists"

    def has_permission(self, request, view):
        gameid = view.kwargs.get('game_id', '')
        if not Game.objects.filter(pk=gameid).exists():
            return False
        return True


class IsGameAuthorPermission(HasGamePermission):
    def has_permission(self, request, view):
        super().has_permission(request, view)
        gameid = view.kwargs.get('game_id', '')
        return Game.objects.filter(pk=gameid, author=request.user).exists()


class GameView(APIView):

    permission_classes = [IsAuthenticated, IsGameAuthorPermission]

    @classmethod
    def get(cls, request, game_id):
        game = get_object_or_404(Game, pk=game_id)
        serializer = FullGameSerializer(game)
        data = serializer.data
        return Response(data)

game = GameView.as_view()
