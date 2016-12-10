from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from .models import Event
from .models import Membership
from .serializers import EventSerializer


def create_member(player, event):
    member = None
    if event.max_players != 0 and event.players.count() >= event.max_players:
        msg = "Maximum number of player in this event"
        st = status.HTTP_400_BAD_REQUEST
    else:
        member, created = Membership.objects.get_or_create(player=player, event=event)
        if not created:
            msg = "This player already is join at this event"
            st = status.HTTP_400_BAD_REQUEST
        else:
            if member.event.price == 0:
                member.status = 'payed'
                member.save()
            msg = "Joined correctly"
            st = status.HTTP_201_CREATED
    return member, msg, st


class JoinEvent(APIView):

    def post(self, request, event_id):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        try:
            event = Event.objects.get(pk=event_id)
        except:
            return Response("Event not exist", status=status.HTTP_400_BAD_REQUEST)
        member, msg, st = create_member(player, event)
        return Response(msg, status=st)

join_event = JoinEvent.as_view()


class UnjoinEvent(APIView):

    def delete(self, request, event_id):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        try:
            event = Event.objects.get(pk=event_id)
        except ObjectDoesNotExist:
            return Response("Event not exist", status=status.HTTP_400_BAD_REQUEST)
        try:
            member = Membership.objects.get(player=player, event=event).delete()
        except ObjectDoesNotExist:
            return Response("You not join in this event.", status=status.HTTP_400_BAD_REQUEST)
        return Response("Unjoined correctly.", status=status.HTTP_200_OK)

unjoin_event = UnjoinEvent.as_view()


class MyEvents(APIView):

    def get(self, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)
        events = request.user.player.event_set.all()
        serializer = EventSerializer(events, many=True)
        data = serializer.data
        return Response(data)

my_events = MyEvents.as_view()


class AllEvents(APIView):

    def get(self, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=status.HTTP_401_UNAUTHORIZED)
        events = Event.objects.filter(end_date__lt=timezone.now())
        events = events.order_by('-pk')
        serializer = EventSerializer(events, many=True)
        data = serializer.data
        return Response(data)

all_events = AllEvents.as_view()
