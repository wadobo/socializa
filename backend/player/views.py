from django.db.models import Q
from django.conf import settings
from django.contrib.gis.measure import D
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status as rf_status
from rest_framework.response import Response
from rest_framework.views import APIView

from clue.models import Clue
from game.serializers import ChallengeSerializer
from .models import Meeting
from .models import Player
from .models import PlayerInterests
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
    m_status = 'connected' if player2.ia else 'step1'
    meeting = Meeting(player1=player1, player2=player2, event_id=event_id, status=m_status)
    meeting.save()
    return meeting


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
            q &= Q(ia=False)
        q &= Q(pos__distance_lte=(self.player.pos, D(m=_vision)))
        near_players = Player.objects.filter(q).exclude(pk=self.player.pk)
        if event and event.place:
            near_players = list(filter(lambda x: event.place.contains(x.pos), near_players))
        serializer = PlayerSerializer(near_players, many=True)
        data = serializer.data
        return Response(data)

near = PlayersNear.as_view()


class MeetingCreate(APIView):

    def create_clue(self, challenge):
        clue = Clue(player=self.player1, event=self.event, challenge=challenge)
        clue.save()

    @classmethod
    def get_challenge(cls, player, event):
        clue = Clue.objects.filter(event=event, player=player, main=True).first()
        return clue.challenge if clue else None

    def validate_players(self, request, player_id):
        response = {}
        status = None
        if request.user.is_anonymous():
            response = "Anonymous user"
            status = rf_status.HTTP_401_UNAUTHORIZED
        else:
            self.player1 = request.user.player
            self.player2 = get_object_or_404(Player, pk=player_id)
            if self.player1 == self.player2:
                response = "narcissistic: you cannot connect with yourself"
                status = rf_status.HTTP_400_BAD_REQUEST
        return response, status

    def validate_event(self, event_id):
        response = {}
        status = None
        self.event = self.player1.event_set.filter(pk=event_id).first() if event_id else None
        if event_id and self.event is None:
            response = "Unauthorized event"
            status = rf_status.HTTP_401_UNAUTHORIZED
        elif event_id and self.event and not self.player2.event_set.filter(pk=event_id).first():
            response = "Other player not join at this event"
            status = rf_status.HTTP_400_BAD_REQUEST
        return response, status

    def validate_distance(self):
        response = {}
        status = None
        max_distance = self.event.get_meeting_distance() if self.event else settings.DEFAULT_MEETING_DISTANCE
        if not distance(self.player1.pos, self.player2.pos, unit='m') <= max_distance:
            response = "User is far for meeting"
            status = rf_status.HTTP_200_OK
        return response, status

    def all_validates(self, request, player_id, event_id):
        response, status = self.validate_players(request, player_id)
        if response:
            return response, status

        response, status = self.validate_event(event_id)
        if response:
            return response, status

        response, status = self.validate_distance()
        if response:
            return response, status

        return {}, None

    def post(self, request, player_id, event_id=None, secret=None):
        """ For create a meeting there are 4 steps:
            1: player1 try to connect with player2 (create meeting with status step1)
               - Exception (if player2 is ia, return clue)
            2: player2 try to connect with player1 (change meeting to status step2 and generate secret)
            3: player1 check the secret of meeting (if correct, status connected and return clue)
            4: player2 make polling for check status (if correct, return clue)
        """
        response = {}
        status = rf_status.HTTP_200_OK
        self.player1 = None
        self.player2 = None
        self.event = None

        # Validate players, event and distance
        response, status = self.all_validates(request, player_id, event_id)
        if response:
            return Response(response, status=status)

        if not secret:
            # Check step
            query = Q(event_id__isnull=True) if event_id is None else Q(event_id=event_id)
            query1 = query & Q(player1=self.player1, player2=self.player2)
            query2 = query & Q(player1=self.player2, player2=self.player1)
            meeting1 = Meeting.objects.filter(query1).first()
            meeting2 = Meeting.objects.filter(query2).first()

            if self.player2.ia:  # STEP1: exception player2 is ia
                meeting = create_meeting(self.player1, self.player2, event_id)
                status = rf_status.HTTP_201_CREATED
                challenge = self.get_challenge(self.player2, self.event)
                self.create_clue(challenge)
                response['status'] = meeting.status
                response['clue'] = ChallengeSerializer(challenge).data
            elif not meeting1 and not meeting2:  # STEP1: player1 not connect with player2 or vice versa
                meeting = create_meeting(self.player1, self.player2, event_id)
                response['status'] = 'step1'
                status = rf_status.HTTP_201_CREATED
            elif meeting1:
                response['status'] = 'step1'
            elif meeting2:  # STEP2: player1 has created meeting with status step1
                meeting2.generate_secret()
                response['status'] = 'step2'
                response['secret'] = meeting2.secret
            else:
                response['status'] = 'already connected'
        else: # STEP 3
            query = Q(event_id__isnull=True) if event_id is None else Q(event_id=event_id)
            query &= Q(player1=self.player1, player2=self.player2, status='step2', secret=secret)
            meeting = Meeting.objects.filter(query).first()
            if meeting:
                meeting.status = 'connected'
                meeting.save()
                status = rf_status.HTTP_200_OK
                challenge = self.get_challenge(self.player2, self.event)
                self.create_clue(challenge)
                response['status'] = meeting.status
                response['clue'] = ChallengeSerializer(challenge).data
            else:
                response = "Invalid secret"
                status = rf_status.HTTP_400_BAD_REQUEST

        return Response(response, status=status)

    def get(self, request, player_id, event_id=None):
        # STEP 4
        response = {}
        status = rf_status.HTTP_200_OK
        self.player1 = None
        self.player2 = None
        self.event = None

        # Validate players, event and distance
        response, status = self.all_validates(request, player_id, event_id)
        if response:
            return Response(response, status=status)

        query = Q(event_id__isnull=True) if event_id is None else Q(event_id=event_id)
        query &= Q(player1=self.player2, player2=self.player1)
        meeting = Meeting.objects.filter(query).first()
        if not meeting:
            response = "Meeting not exist"
            status = rf_status.HTTP_400_BAD_REQUEST
        elif meeting.status == 'connected':
            challenge = self.get_challenge(self.player2, self.event)
            self.create_clue(challenge)
            response['status'] = meeting.status
            response['clue'] = ChallengeSerializer(challenge).data
        elif meeting.status == 'step2':
            response['status'] = 'waiting'

        return Response(response, status=status)

meeting_create = MeetingCreate.as_view()


class SetPosition(APIView):

    @classmethod
    def post(cls, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        lat = request.data.get('lat', None)
        lon = request.data.get('lon', None)
        try:
            player.set_position(lon, lat)
        except:
            return Response("Invalid position", status=rf_status.HTTP_400_BAD_REQUEST)
        return Response("Position changed", status=rf_status.HTTP_200_OK)

    @classmethod
    def delete(cls, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        player = request.user.player
        player.delete_position()
        return Response("Position deleted", status=rf_status.HTTP_200_OK)

set_position = SetPosition.as_view()


class Profile(APIView):

    def get(self, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)

        p = request.user.player
        serializer = PlayerSerializer(p, many=False)
        return Response(serializer.data)

    def post(self, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        data = request.data
        p = request.user.player

        if 'about' in data:
            p.about = data['about']
        if 'interests' in data:
            PlayerInterests.objects.filter(user=p).delete()
            newints = []
            if hasattr(data, 'getlist'):
                newints = data.getlist('interests')
            else:
                newints = data.get('interests')
            for i in newints:
                p.interests.create(text=i)

        p.save()

        return Response({'status': 'ok'})

profile = Profile.as_view()
