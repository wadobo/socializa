from django.contrib.gis.measure import D
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
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


class PlayersNear(APIView):

    NEAR_DISTANCE = 5 # km

    def get(self, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        if player.pos:
            near_players = Player.objects.filter(pos__distance_lte=(player.pos, D(km=self.NEAR_DISTANCE))).exclude(pk=player.pk)
            serializer = PlayerSerializer(near_players, many=True)
            data = serializer.data
        else:
            data = []
        return Response(data)

near = PlayersNear.as_view()


class MeetingCreate(APIView):

    MEETING_DISTANCE = 10 # m

    def post(self, request, pk):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)
        player1 = request.user.player
        player2 = get_object_or_404(Player, user__pk=pk)
        if distance(player1.pos, player2.pos, unit='m') <= self.MEETING_DISTANCE:
            meeting = Meeting(player1=player1, player2=player2)
            meeting.save()
            return Response("Meeting created", status=status.HTTP_201_CREATED)
        else:
            return Response("User is far for meeting", status=status.HTTP_200_OK)

meeting_create = MeetingCreate.as_view()


class SetPosition(APIView):

    def post(self, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        lat = request.POST.get('lat', None)
        lon = request.POST.get('lon', None)
        try:
            player.set_position(lat, lon)
        except:
            return Response("Invalid position", status=status.HTTP_400_BAD_REQUEST)
        return Response("Position changed", status=status.HTTP_200_OK)

set_position = SetPosition.as_view()
