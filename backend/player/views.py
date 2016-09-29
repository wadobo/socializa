from django.contrib.gis.measure import D
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Player
from .serializers import PlayerSerializer


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


class Meeting(APIView):

    MEETING_DISTANCE = 10 # m

    def post(self, request, pk):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)
        player1 = request.user.player
        is_near = Player.objects.filter(pk=pk, pos__distance_lte=(player.pos, D(m=self.MEETING_DISTANCE)))
        if is_near:
            meeting = Meeting(player1=player1, player2=is_near.first())
            meeting.save()
            return Response("Meeting created", status=status.HTTP_201_CREATED)
        else:
            return Response("User is far for meeting", status=status.HTTP_200_OK)

meeting_create = PlayersNear.as_view()
