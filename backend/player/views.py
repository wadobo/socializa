from django.contrib.gis.measure import D
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Meeting
from .models import Player
from .serializers import PlayerSerializer


def distance(pos1, pos2, unit='km'):
    dis = pos1.distance(pos2) * 100
    if unit == 'm':
        return dis * 1000
    else:
        return dis


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


class PlayersNear(APIView):

    NEAR_DISTANCE = 5 # km

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
            q &= Q(pos__distance_lte=(player.pos, D(km=self.NEAR_DISTANCE)))
            if event:
                q &= Q(pk__in=event.players.values_list('pk', flat=True))
            near_players = Player.objects.filter(q).exclude(pk=player.pk)
            serializer = PlayerSerializer(near_players, many=True)
            data = serializer.data
        else:
            data = []
        return Response(data)

near = PlayersNear.as_view()


class MeetingCreate(APIView):

    MEETING_DISTANCE = 10 # m

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
        if distance(player1.pos, player2.pos, unit='m') <= self.MEETING_DISTANCE:

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

set_position = SetPosition.as_view()
