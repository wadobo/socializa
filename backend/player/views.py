from django.db.utils import IntegrityError
from django.conf import settings
from rest_framework import generics
from rest_framework import status as drf_status
from rest_framework.response import Response

from .models import Player
from .serializers import PlayerSerializer


class PlayerListCreate(generics.ListCreateAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

    def create(self, request, version=settings.VERSION, *args, **kwargs):
        try:
            player = Player.create(**request.data)
            player.save()
        except IntegrityError:
            return Response('Error try to create player', status=drf_status.HTTP_409_CONFLICT)

        return Response('Player created', status=drf_status.HTTP_201_CREATED)


class PlayerDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
