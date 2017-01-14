from math import cos, pi, sin, sqrt
from random import choice, random
from string import ascii_lowercase, digits

from django.db.models import Q
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.gis.measure import D
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from clue.views import attachClue
from .models import Meeting
from .models import Player
from .serializers import PlayerSerializer


def distance(pos1, pos2, unit='km'):
    dis = pos1.distance(pos2) * 100
    if unit == 'm':
        return dis * 1000
    else:
        return dis


def current_event(player):
    now = timezone.now()
    return player.event_set.filter(start_date__lt=now, end_date__gt=now).first()


def create_meeting(player1, player2, event_id=None):
    meeting = None
    if player1 == player2:
        msg = "narcissistic: you cannot connect with yourself"
        st = status.HTTP_400_BAD_REQUEST
    else:
        meeting, created = Meeting.objects.get_or_create(player1=player1, player2=player2, event_id=event_id)
        if not created:
            msg = "Meeting already exist"
            st = status.HTTP_200_OK
        else:
            msg = "Meeting created"
            st = status.HTTP_201_CREATED
    return meeting, msg, st


def get_random_pos(coords, distance):
    """
    Give a coords and a distance (in km). Generate random position nearer
    that distance from coords.
    """
    CONVERT_RADIUS_IN_DEGREES = 111300
    KM2M = 1000
    # divide by 2 because the conversion is not exact and the position could be outside of ratio
    r = (distance * KM2M / 2) / CONVERT_RADIUS_IN_DEGREES
    u = random()
    v = random()
    w = r * sqrt(u)
    t = 2 * pi * v
    x = w * cos(t)
    x1 = x / cos(coords[1])
    y1 = w * sin(t)
    return coords[0] + x1, coords[1] + y1


def get_random_string(length=32, chars=ascii_lowercase+digits):
    return ''.join([choice(chars) for i in range(length)])


def get_random_username(length=32, chars=ascii_lowercase+digits):
    username = get_random_string(length=length, chars=chars)
    try:
        User.objects.get(username=username)
        return get_random_username(length=length, chars=chars)
    except User.DoesNotExist:
        return username


class PlayersNear(APIView):

    def managePlayersIA(self, event, coords, near_players):
        from event.models import Membership
        total_need_players = event.game.challenges.count()
        current_players = len(near_players)
        need_player = total_need_players - current_players - 1 # me
        if need_player < 0: # Removed some IAs
            while need_player < 0:
                need_player += 1

        elif need_player > 0: # Add some IAs
            while need_player >= 0:
                coords = get_random_pos(coords, event.get_max_ratio())
                user = User.objects.create_user(
                        username=get_random_username(),
                        password=get_random_string())
                player = Player(user=user, ia=True)
                player.set_position(coords[0], coords[1])
                player.save()
                member = Membership(player=player, event=event)
                member.save()
                attachClue(player=player, game=event.game, main=True)
                need_player -= 1


    def get(self, request, event_id=None):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        event = None
        if event_id:
            event = player.event_set.filter(pk=event_id).first()
            if event is None:
                return Response("Unauthorized event", status=status.HTTP_401_UNAUTHORIZED)

        if player.pos:
            q = Q()
            max_ratio_km = event.get_max_ratio() if event else settings.DEFAULT_MAX_RATIO
            q &= Q(pos__distance_lte=(player.pos, D(km=max_ratio_km)))
            if event:
                q &= Q(pk__in=event.players.values_list('pk', flat=True))
            near_players = Player.objects.filter(q).exclude(pk=player.pk)
            if event:
                self.managePlayersIA(event, player.pos.coords, near_players)
                near_players = Player.objects.filter(q).exclude(pk=player.pk)
            serializer = PlayerSerializer(near_players, many=True)
            data = serializer.data

        else:
            data = []
        return Response(data)

near = PlayersNear.as_view()


class MeetingCreate(APIView):

    def post(self, request, player_id, event_id=None):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)
        player1 = request.user.player
        player2 = get_object_or_404(Player, pk=player_id)
        event = None
        if event_id:
            event = player1.event_set.filter(pk=event_id).first()
            if event is None:
                return Response("Unauthorized event", status=status.HTTP_401_UNAUTHORIZED)
            else:
                if not player2.event_set.filter(pk=event_id).first():
                    return Response("Other player not join at this event", status=status.HTTP_400_BAD_REQUEST)

        max_distance = event.get_meeting_distance() if event else settings.DEFAULT_MEETING_DISTANCE
        if distance(player1.pos, player2.pos, unit='m') <= max_distance:
            meeting, msg, st = create_meeting(player1, player2, event_id)
            return Response(msg, status=st)
        else:
            return Response("User is far for meeting", status=status.HTTP_200_OK)

meeting_create = MeetingCreate.as_view()


class SetPosition(APIView):

    def post(self, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        lat = request.POST.get('lat', None) or request.data.get('lat', None)
        lon = request.POST.get('lon', None) or request.data.get('lon', None)
        try:
            player.set_position(lon, lat)
        except:
            return Response("Invalid position", status=status.HTTP_400_BAD_REQUEST)
        return Response("Position changed", status=status.HTTP_200_OK)

    def delete(self, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        player.delete_position()
        return Response("Position deleted", status=status.HTTP_200_OK)

set_position = SetPosition.as_view()
