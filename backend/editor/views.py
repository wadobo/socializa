import json
import datetime
from django.utils.timezone import make_aware
from django.utils.dateparse import parse_datetime
from django.utils.translation import ugettext as _
from django.views.generic.base import TemplateView, View
from django.contrib.auth.decorators import user_passes_test
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.gis.geos import Polygon, MultiPolygon
from django.shortcuts import get_object_or_404
from django.shortcuts import render, redirect
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission
from rest_framework.permissions import IsAuthenticated

from game.models import Game, Challenge
from game.serializers import FullGameSerializer

from event.models import Event
from event.serializers import FullEventSerializer

from player.serializers import PlayerSerializer
from player.models import Player, User

from clue.models import Clue


def is_editor(user):
    return not user.is_anonymous() and (belong_editor_group(user) or user.is_superuser)


is_editor = user_passes_test(is_editor, login_url='/admin/login/')


def belong_editor_group(user):
    return user.groups.filter(name='editor').exists()


def parse_request_challenges(request):
    data = request.POST
    challenges = [(k, v) for k, v in data.items() if k.startswith("challenge_")]

    datas = {}
    for key, value in challenges:
        attr, num = key.rsplit("_", 1)
        if num not in datas:
            datas[num] = {}
        datas[num].update({attr: value})
    return datas


class EditGame(TemplateView):
    template_name = 'editor/edit_game.html'

    def get_context_data(self, gameid=None, **kwargs):
        ctx = super().get_context_data(gameid=gameid)
        if gameid:
            game = get_object_or_404(Game, pk=gameid)
            ctx['game'] = game
            ctx['n'] = game.challenges.count()
        else:
            ctx['n'] = 0
        return ctx

edit_game = is_editor(EditGame.as_view())


class EditEvent(TemplateView):
    template_name = 'editor/edit_event.html'

    def get_context_data(self, evid=None):
        ctx = super().get_context_data(evid=evid)
        if evid:
            event = get_object_or_404(Event, pk=evid)
            ctx['ev'] = event
        return ctx

edit_event = is_editor(EditEvent.as_view())


class AjaxPlayerSearch(View):
    def post(self, request):
        query = request.POST.get('q', '')
        if not query or len(query) < 3:
            return JsonResponse([], safe=False)

        players = Player.objects.filter(user__username__startswith=query)
        serializer = PlayerSerializer(players, many=True)
        data = serializer.data
        return JsonResponse(data, safe=False)

ajax_player_search = csrf_exempt(is_editor(AjaxPlayerSearch.as_view()))


class Editor(TemplateView):
    template_name = 'editor/editor.html'

    def get_context_data(self):
        ctx = super().get_context_data()
        ctx['games'] = self.request.user.games.all()
        ctx['events'] = self.request.user.events.all()
        return ctx

editor = is_editor(Editor.as_view())


# new editor views

class IsGameAuthorPermission(BasePermission):
    def has_permission(self, request, view):
        super().has_permission(request, view)
        gameid = view.kwargs.get('game_id', '')
        if not gameid:
            return True
        return Game.objects.filter(pk=gameid, author=request.user).exists()


class IsEventAuthorPermission(BasePermission):
    def has_permission(self, request, view):
        super().has_permission(request, view)
        evid = view.kwargs.get('ev_id', '')
        if not evid:
            return True
        return Event.objects.filter(pk=evid, owners=request.user).exists()


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

gameview = GameView.as_view()


class GameList(APIView):

    permission_classes = [IsAuthenticated, IsEventAuthorPermission]

    @classmethod
    def get(cls, request):
        games = request.user.games.all()
        serializer = FullGameSerializer(games, many=True)
        data = serializer.data
        return Response(data)

gamelist = GameList.as_view()


class EventView(APIView):

    permission_classes = [IsAuthenticated, IsEventAuthorPermission]

    @classmethod
    def get(cls, request, ev_id):
        ev = get_object_or_404(Event, pk=ev_id)
        serializer = FullEventSerializer(ev)
        data = serializer.data
        return Response(data)

    @classmethod
    def create_player(cls, ep):
        username = ep.get('username', '')
        username += '_ai_' + User.objects.make_random_password(length=8)
        newu = User(username=username)
        newu.save()
        p = Player(user=newu, ptype=ep['ptype'])
        p.save()

        return p

    @classmethod
    def post(cls, request, ev_id):
        ev = request.data

        if ev_id:
            e = get_object_or_404(Event, pk=ev_id)
        else:
            e = Event()

        for k, v in ev.items():
            if k in ['pk', 'players', 'owners', 'task_id', 'place', 'game']:
                continue
            if 'date' in k:
                try:
                    v = datetime.datetime.strptime(v, '%Y-%m-%d %H:%M %z')
                except:
                    v = parse_datetime(v)
            setattr(e, k, v)

        # setting the place
        place = ev.get('place', None)
        if place:
            if type(place) == str:
                place = GEOSGeometry(place)
            else:
                place = GEOSGeometry(str(place['geometry']))
            if isinstance(place, Polygon):
                place = MultiPolygon(place)
            e.place = place

        # setting the game
        g = ev.get('game', None)
        if g:
            g = get_object_or_404(Game, pk=g['pk'])
            e.game = g

        e.save()
        e.owners.add(request.user)

        players_ids = []
        for ep in ev.get('players', []):
            pk = ep['pk']
            if pk < 0:
                # negative pk will create the player
                p = Player()
                p = cls.create_player(ep)
            else:
                p = Player.objects.get(pk=pk)

            p.about = ep['username']

            p.set_position(*ep['pos'])
            players_ids.append(p.pk)
            e.set_playing(p)

            Clue.objects.filter(player=p, event=e).delete()

            for ch in ep.get('challenges', []):
                c = Challenge.objects.get(pk=ch['pk'], games=e.game)
                clue = Clue(player=p, event=e, challenge=c, main=True)
                clue.save()

        players = e.players.exclude(membership__player__pk__in=players_ids)
        for p in players:
            p.user.delete()

        return Response({'status': 'ok'})

evview = EventView.as_view()
