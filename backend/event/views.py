import unidecode

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status as rf_status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission
from rest_framework.permissions import IsAuthenticated

from clue.utils import attach_clue
from clue.utils import detach_clues
from clue.utils import transfer_clues
from .models import Event
from .models import Membership
from .models import PlayingEvent
from .serializers import EventSerializer
from .serializers import AdminChallengeSerializer


def normalize(txt):
    return unidecode.unidecode(txt).strip().lower()


class HasEventPermission(BasePermission):
    def __init__(self):
        self.message = "Event doesn't exists"

    def has_permission(self, request, view):
        evid = view.kwargs.get('event_id', None)
        if not Event.objects.filter(pk=evid).exists():
            return False
        return True


class IsEventMemberPermission(HasEventPermission):
    def has_permission(self, request, view):
        super().has_permission(request, view)
        evid = view.kwargs.get('event_id', None)
        player = request.user.player
        if not Membership.objects.filter(event=evid, player=player).exists():
            self.message = "Unauthorized event"
            return False
        return True


class IsEventAdminPermission(HasEventPermission):
    def has_permission(self, request, view):
        super().has_permission(request, view)
        evid = view.kwargs.get('event_id', None)
        event = get_object_or_404(Event, pk=evid)
        if not event.owners.filter(pk=request.user.pk).exists():
            self.message = "Non admin user"
            return False
        return True


def create_member(player, event):
    member = None
    ai_exist = event.clues.filter(main=True, player__ptype='ai')
    if event.max_players != 0 and event.players.count() >= event.max_players and not ai_exist:
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

    permission_classes = [IsAuthenticated, HasEventPermission]

    @classmethod
    def post(cls, request, event_id):
        """ Player join {event_id}. """
        player = request.user.player
        event = Event.objects.get(pk=event_id)
        _, msg, status = create_member(player, event)
        if event.game.auto_assign_clue:
            attach_clue(player, event)
        return Response(msg, status=status)


class UnjoinEvent(APIView):

    permission_classes = [IsAuthenticated, HasEventPermission]

    @classmethod
    def delete(cls, request, event_id):
        """ Player unjoin {event_id}. """
        player = request.user.player
        event = Event.objects.get(pk=event_id)
        try:
            Membership.objects.get(player=player, event=event).delete()
        except ObjectDoesNotExist:
            return Response("You aren't joined to this event.", status=rf_status.HTTP_400_BAD_REQUEST)
        detach_clues(player, event, main='all')
        return Response("Unjoined correctly.", status=rf_status.HTTP_200_OK)


class MyEvents(APIView):

    permission_classes = [IsAuthenticated]

    @classmethod
    def get(cls, request):
        """ Player get his joined events. """
        events = request.user.player.event_set.all()
        serializer = EventSerializer(events, many=True)
        data = serializer.data
        return Response(data)


class AllEvents(APIView):

    permission_classes = [IsAuthenticated]

    @classmethod
    def get(cls, request):
        """ Get all new event from now to infinite. """
        events = Event.objects.filter(end_date__gt=timezone.now())

        query = Q()

        player = request.user.player
        filtrate = request.GET.get('filter', 'all')
        if filtrate == 'mine':
            query &= Q(membership__player=player)
        elif filtrate == 'admin':
            query &= Q(owners__player=player)

        search = request.GET.get('q', '')
        if search:
            query &= (Q(name__icontains=search) | Q(place__icontains=search) |
                      Q(game__name__icontains=search) | Q(game__desc__icontains=search))

        events = events.filter(query)

        events = events.order_by('-start_date', '-pk')

        try:
            page = int(request.GET.get('page', 0))
        except ValueError:
            page = 0
        pagination = settings.DEFAULT_PAGINATION
        offset = pagination * page
        events = events[offset:offset + pagination]

        serializer = EventSerializer(events, many=True, context={'player': player})
        data = serializer.data
        return Response(data)


class EventDetail(APIView):

    permission_classes = [IsAuthenticated, HasEventPermission]

    @classmethod
    def get(cls, request, event_id):
        """ Get the event by id. """
        event = Event.objects.get(pk=event_id)
        serializer = EventSerializer(event, many=False, context={'player': request.user.player})
        data = serializer.data
        return Response(data)


class CurrentEvent(APIView):

    permission_classes = [IsAuthenticated]

    @classmethod
    def post(cls, request, event_id=None):
        """ Set current event for player. """
        player = request.user.player
        event = get_object_or_404(Event, pk=event_id) if event_id else None

        pe, created = PlayingEvent.objects.get_or_create(player=player)
        if pe.event != event:
            transfer_clues(player=player, old_event=pe.event, new_event=event)
        pe.event = event
        pe.save()

        if created:
            status = rf_status.HTTP_201_CREATED
        else:
            status = rf_status.HTTP_200_OK

        serializer = EventSerializer(event, many=False, context={'player': request.user.player})
        data = serializer.data
        return Response(data, status=status)


class SolveEvent(APIView):

    permission_classes = [IsAuthenticated, IsEventMemberPermission]

    @classmethod
    def post(cls, request, event_id):
        """ Try solve event_id with solution. """
        event = Event.objects.get(pk=event_id)
        player = request.user.player

        solution = normalize(request.data.get('solution', ''))
        correct_solution = normalize(event.game.solution)

        if not solution or not correct_solution:
            return Response("Bad request", status=rf_status.HTTP_400_BAD_REQUEST)

        response = {'status': 'incorrect'}
        if correct_solution == solution:
            response = {'status': 'correct'}
            membership = Membership.objects.filter(event=event, player=player).first()
            membership.status = 'solved'
            membership.save()
        return Response(response, rf_status.HTTP_200_OK)


class AdminEventChallenges(APIView):

    permission_classes = [IsAuthenticated, IsEventAdminPermission]

    @classmethod
    def get(cls, request, event_id):
        """ Get the event challenges by id. """
        event = Event.objects.get(pk=event_id)
        serializer = AdminChallengeSerializer(event.game.challenges.all(), many=True)
        data = serializer.data
        return Response(data)


class AdminEventUpdate(APIView):

    permission_classes = [IsAuthenticated, IsEventAdminPermission]

    @classmethod
    def post(cls, request, event_id):
        """ Update {event_id}. You need event admin permissions. """
        event = Event.objects.get(pk=event_id)
        vision_distance = request.data.get('vision_distance', None)
        meeting_distance = request.data.get('meeting_distance', None)

        if vision_distance:
            event.vision_distance = vision_distance
        if meeting_distance:
            event.meeting_distance = meeting_distance
        event.save()

        return Response("Updated correctly.", status=rf_status.HTTP_200_OK)


join_event = JoinEvent.as_view()
unjoin_event = UnjoinEvent.as_view()
my_events = MyEvents.as_view()
all_events = AllEvents.as_view()
event_detail = EventDetail.as_view()
current_event = CurrentEvent.as_view()
solve_event = SolveEvent.as_view()
admin_event_challenges = AdminEventChallenges.as_view()
admin_event_update = AdminEventUpdate.as_view()
