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
        game = request.data
        challenges = request.data['challenges']

        if game_id:
            g = get_object_or_404(Game, pk=game_id)
        else:
            g = Game()

        for k, v in game.items():
            if k in ['pk', 'challenges', 'author', 'options']:
                continue
            setattr(g, k, v)

        g.author = request.user
        g.add_extra('options', game.get('options', []))
        g.save()

        pkch = {}
        for ch in challenges:
            pk = ch['pk']
            if pk < 0:
                # negative pk will create the challenge
                c = Challenge()
            else:
                c = Challenge.objects.get(pk=pk)

            for k, v in ch.items():
                if k in ['pk', 'game', 'options', 'child_challenges', 'depends']:
                    continue
                setattr(c, k, v)

            c.add_extra('options', ch.get('options', []))
            c.save()
            pkch[pk] = c

        for ch in challenges:
            c = pkch[ch['pk']]

            # child challenges
            c.child_challenges.clear()
            for cc in ch.get('child_challenges', []):
                c.child_challenges.add(pkch[cc['pk']])

            # depends
            c.depends.clear()
            for dep in ch.get('depends', []):
                c.depends.add(pkch[dep['pk']])

            c.save()

        return Response({'status': 'ok'})

game = GameView.as_view()
