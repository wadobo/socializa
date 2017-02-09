from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from rest_framework import status as rf_status
from rest_framework.response import Response
from rest_framework.views import APIView

from clue.views import attach_clue
from clue.views import detach_clue
from .models import Event
from .models import Membership
from .serializers import EventSerializer


def create_member(player, event):
    member = None
    if event.max_players != 0 and event.players.count() >= event.max_players:
        msg = "Maximum number of player in this event"
        status = rf_status.HTTP_400_BAD_REQUEST
    else:
        member, created = Membership.objects.get_or_create(player=player, event=event)
        if not created:
            msg = "This player already is join at this event"
            status = rf_status.HTTP_400_BAD_REQUEST
        else:
            if member.event.price == 0:
                member.status = 'payed'
                member.save()
            msg = "Joined correctly"
            status = rf_status.HTTP_201_CREATED
    return member, msg, status


class JoinEvent(APIView):

    @classmethod
    def post(cls, request, event_id):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        try:
            event = Event.objects.get(pk=event_id)
        except:
            return Response("Event not exist", status=rf_status.HTTP_400_BAD_REQUEST)
        member, msg, status = create_member(player, event)
        attach_clue(player, event)
        return Response(msg, status=status)


class UnjoinEvent(APIView):

    @classmethod
    def delete(cls, request, event_id):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        try:
            event = Event.objects.get(pk=event_id)
        except ObjectDoesNotExist:
            return Response("Event not exist", status=rf_status.HTTP_400_BAD_REQUEST)
        try:
            Membership.objects.get(player=player, event=event).delete()
        except ObjectDoesNotExist:
            return Response("You not join in this event.", status=rf_status.HTTP_400_BAD_REQUEST)
        detach_clue(player, event)
        return Response("Unjoined correctly.", status=rf_status.HTTP_200_OK)


class MyEvents(APIView):

    @classmethod
    def get(cls, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        events = request.user.player.event_set.all()
        serializer = EventSerializer(events, many=True)
        data = serializer.data
        return Response(data)


class AllEvents(APIView):

    def get(self, request):
        """ Get all new event from now to infinite. """
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)

        events = Event.objects.filter(end_date__gt=timezone.now())
        events = events.order_by('-start_date', '-pk')

        try:
            page = int(request.GET.get('page', 0))
        except ValueError:
            page = 0
        pagination = settings.DEFAULT_PAGINATION
        offset = pagination * page
        events = events[offset:offset + pagination]

        serializer = EventSerializer(events, many=True, context={'player': request.user.player})
        data = serializer.data
        return Response(data)


class EventDetail(APIView):

    @classmethod
    def get(cls, request, event_id):
        """ Get the event by id. """
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        try:
            event = Event.objects.get(pk=event_id)
        except:
            return Response("Event not exist", status=rf_status.HTTP_400_BAD_REQUEST)
        serializer = EventSerializer(event, many=False, context={'player': request.user.player})
        data = serializer.data
        return Response(data)


class SolveEvent(APIView):

    def post(self, request, event_id):
        """ Try solve event_id with solution. """
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        try:
            event = Event.objects.get(pk=event_id)
        except:
            return Response("Event not exist", status=rf_status.HTTP_400_BAD_REQUEST)

        player = request.user.player
        membership = Membership.objects.filter(event=event, player=player).first()
        if not membership:
            return Response("Unauthorized event", status=rf_status.HTTP_401_UNAUTHORIZED)

        solution = request.data.get('solution', None)
        correct_solution = event.game.solution
        if not solution or not correct_solution:
            return Response("Bad request", status=rf_status.HTTP_400_BAD_REQUEST)

        status = rf_status.HTTP_200_OK
        if correct_solution != solution:
            response = {'status': 'incorrect'}
        else:
            response = {'status': 'correct'}
            membership.status = 'solved'
            membership.save()
        return Response(response, status)


join_event = JoinEvent.as_view()
unjoin_event = UnjoinEvent.as_view()
my_events = MyEvents.as_view()
all_events = AllEvents.as_view()
event_detail = EventDetail.as_view()
solve_event = SolveEvent.as_view()
