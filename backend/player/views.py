from django.db.models import Q
from django.conf import settings
from django.contrib.gis.measure import D
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status as rf_status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Meeting
from .models import Player
from .serializers import PlayerSerializer


def distance(pos1, pos2, unit='m'):
    dis = pos1.distance(pos2) * 100
    if unit == 'km':
        return dis
    else:
        return dis * 1000


def current_event(player):
    now = timezone.now()
    return player.event_set.filter(start_date__lt=now, end_date__gt=now).first()


def create_meeting(player1, player2, event_id=None):
    meeting = None
    if player1 == player2:
        msg = "narcissistic: you cannot connect with yourself"
        status = rf_status.HTTP_400_BAD_REQUEST
    else:
        meeting, created = Meeting.objects.get_or_create(player1=player1,
                                                         player2=player2,
                                                         event_id=event_id)
        if not created:
            msg = "Meeting already exist"
            status = rf_status.HTTP_200_OK
        else:
            msg = "Meeting created"
            status = rf_status.HTTP_201_CREATED
    return meeting, msg, status


class PlayersNear(APIView):

    def get(self, request, event_id=None):
        """
        Get near player. If general event, obtain all players near; if not
        general event, obtain near player inside event if you inside event.
        """
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        self.player = request.user.player

        # Check player position
        if not self.player.pos:
            return Response("Your position is not defined. Check your GPS.")

        # Check if player inside event or if event is general (event or event.place is None)
        event = None
        if event_id:
            event = self.player.event_set.filter(pk=event_id).first()
            if event is None:
                return Response("Unauthorized event", status=rf_status.HTTP_401_UNAUTHORIZED)

        if event and event.place and not event.place.contains(self.player.pos):
            return Response("Your player is outside of place.")

        # Check near players
        q = Q()
        if event:
            _vision = event.vision_distance
            q &= Q(pk__in=event.players.values_list('pk', flat=True))
        else:
            _vision = settings.DEFAULT_VISION_DISTANCE
        q &= Q(pos__distance_lte=(self.player.pos, D(m=_vision)))
        near_players = Player.objects.filter(q).exclude(pk=self.player.pk)
        if event and event.place:
            near_players = list(filter(lambda x: event.place.contains(x.pos), near_players))
        serializer = PlayerSerializer(near_players, many=True)
        data = serializer.data
        return Response(data)

near = PlayersNear.as_view()


class MeetingCreate(APIView):

    def post(self, request, player_id, event_id=None):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        player1 = request.user.player
        player2 = get_object_or_404(Player, pk=player_id)
        event = None
        if event_id:
            event = player1.event_set.filter(pk=event_id).first()
            if event is None:
                return Response("Unauthorized event", status=rf_status.HTTP_401_UNAUTHORIZED)
            else:
                if not player2.event_set.filter(pk=event_id).first():
                    return Response("Other player not join at this event",
                                    status=rf_status.HTTP_400_BAD_REQUEST)

        max_distance = event.get_meeting_distance() if event else settings.DEFAULT_MEETING_DISTANCE
        if distance(player1.pos, player2.pos, unit='m') <= max_distance:
            meeting, msg, status = create_meeting(player1, player2, event_id)
            return Response(msg, status=status)
        else:
            return Response("User is far for meeting", status=rf_status.HTTP_200_OK)

meeting_create = MeetingCreate.as_view()


class SetPosition(APIView):

    def post(self, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        lat = request.POST.get('lat', None) or request.data.get('lat', None)
        lon = request.POST.get('lon', None) or request.data.get('lon', None)
        try:
            player.set_position(lon, lat)
        except:
            return Response("Invalid position", status=rf_status.HTTP_400_BAD_REQUEST)
        return Response("Position changed", status=rf_status.HTTP_200_OK)

    def delete(self, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        player.delete_position()
        return Response("Position deleted", status=rf_status.HTTP_200_OK)

set_position = SetPosition.as_view()
