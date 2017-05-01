from oauth2_provider.models import AccessToken

from django.db.models import Q
from django.conf import settings
from django.contrib.gis.measure import D
from django.contrib.gis.geos import GEOSException
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.generic.base import TemplateView
from django.shortcuts import redirect, reverse
from django.utils.translation import ugettext as _
from django.core.validators import validate_email
from django.core.mail import EmailMultiAlternatives
from rest_framework import status as rf_status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from clue.models import Clue
from clue.serializers import ClueSerializer
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


def create_meeting(player1, player2, event_id=None):
    m_status = 'connected' if player2.ptype in ['ai', 'pos'] else 'step1'
    meeting, created = Meeting.objects.get_or_create(
                                        player1=player1,
                                        player2=player2,
                                        event_id=event_id)
    meeting.status = m_status
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
            q &= Q(playing_event__event=event.pk)
            if not event.game.visible_players:
                q &= ~Q(ptype='player')
        else:
            _vision = settings.DEFAULT_VISION_DISTANCE
            q &= ~Q(ptype__in=['ai', 'pos'])  # ~ not equal not equal
            q &= Q(playing_event__event=None)
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
        clue, new = Clue.objects.get_or_create(player=self.player1, event=self.event, challenge=challenge)
        clue.save()
        return clue

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
        response = ""
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
        response = ""
        status = None
        if self.event:
            max_distance = self.event.get_meeting_distance()
        else:
            max_distance = settings.DEFAULT_MEETING_DISTANCE
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

    def give_clue(self, player, event):
        '''
        Gives all clues to the player and return the last one
        '''
        clues = Clue.objects.filter(event=event, player=player, main=True)

        rclue = None

        # multiple challenges
        for clue in clues:
            # challenge dependencies
            pclues = self.player1.clues
            should_give_the_clue = True
            for dep in clue.challenge.depends.all():
                if not pclues.filter(challenge=dep, event=self.event).exists():
                    should_give_the_clue = False
                    break
            # if doesn't have the dependencies clues, we shouldn't give the
            # clue
            if should_give_the_clue:
                rclue = self.create_clue(clue.challenge)

        return rclue

    def check_secret(self, event_id, secret):
        query = Q(event_id__isnull=True) if event_id is None else Q(event_id=event_id)
        query &= Q(player1=self.player1, player2=self.player2, status='step2', secret=secret)

        response = {"error": "Invalid secret"}
        status = rf_status.HTTP_400_BAD_REQUEST
        clue = None

        meeting = Meeting.objects.filter(query).first()
        if meeting:
            response = {}
            status = rf_status.HTTP_200_OK

            clue = self.give_clue(self.player2, self.event)
            response['clue'] = ClueSerializer(clue).data if clue else {}

            # always connected if the secret is ok
            meeting.status = 'connected'
            meeting.save()
            response['status'] = meeting.status

        return Response(response, status)

    def check_steps(self, event_id):
        response = {'status': 'already connected'}
        status = rf_status.HTTP_200_OK

        query = Q(event_id__isnull=True) if event_id is None else Q(event_id=event_id)
        query1 = query & Q(player1=self.player1, player2=self.player2)
        query2 = query & Q(player1=self.player2, player2=self.player1)
        meeting1 = Meeting.objects.filter(query1).first()
        meeting2 = Meeting.objects.filter(query2).first()

        new_meeting = None

        # STEP1: exception player2 is ai
        if self.player2.ptype in ['ai', 'pos']:
            new_meeting = create_meeting(self.player1, self.player2, event_id)
            status = rf_status.HTTP_201_CREATED
            clue = self.give_clue(self.player2, self.event)
            response['clue'] = ClueSerializer(clue).data if clue else {}

        # STEP1: player1 not connected with player2 or vice versa
        elif not meeting1 and not meeting2:
            new_meeting = create_meeting(self.player1, self.player2, event_id)
            status = rf_status.HTTP_201_CREATED

        elif meeting1:
            new_meeting = meeting1
            new_meeting.status = 'step1'
            new_meeting.save()

        # STEP2: player1 has created meeting with status step1
        elif meeting2:
            new_meeting = meeting2
            new_meeting.status = 'step2'
            new_meeting.generate_secret()
            new_meeting.save()
            response['secret'] = new_meeting.secret

        response['status'] = new_meeting.status if new_meeting else ""

        return Response(response, status)

    def post(self, request, player_id, event_id=None, secret=None):
        """ For create a meeting there are 4 steps:
            1: player1 try to connect with player2 (create meeting with status step1)
               - Exception (if player2 is ai, return clue)
            2: player2 try to connect with player1 (meeting to status step2 and generate secret)
            3: player1 check the secret of meeting (if correct, status connected and return clue)
            4: player2 make polling for check status (if correct, return clue)
        """
        # Validate players, event and distance
        response, status = self.all_validates(request, player_id, event_id)
        if response:
            return Response(response, status=status)

        if not secret:
            return self.check_steps(event_id)
        else:  # STEP 3
            return self.check_secret(event_id, secret)

        return Response(response, status=status)

    def get(self, request, player_id, event_id=None):
        # STEP 4
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
            clue = self.give_clue(self.player2, self.event)
            response['status'] = meeting.status
            response['clue'] = ClueSerializer(clue).data if clue else {}

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
        except (ValueError, GEOSException):
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

    def get(self, request, player_id=None):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)

        if not player_id:
            player = request.user.player
        else:
            player = Player.objects.get(pk=player_id)
            if not player.visible(request.user.player):
                return Response({})

        serializer = PlayerSerializer(player, many=False)
        return Response(serializer.data)

    def post(self, request):
        if request.user.is_anonymous():
            return Response("Anonymous user", status=rf_status.HTTP_401_UNAUTHORIZED)
        data = request.data
        player = request.user.player

        if 'about' in data:
            player.about = data['about']
        if 'interests' in data:
            PlayerInterests.objects.filter(user=player).delete()
            newints = []
            if hasattr(data, 'getlist'):
                newints = data.getlist('interests')
            else:
                newints = data.get('interests')
            for i in newints:
                player.interests.create(text=i)

        player.save()

        return Response({'status': 'ok'})

profile = Profile.as_view()


class Register(APIView):
    def post(self, request):
        email = request.data.get('email', '')
        password = request.data.get('password', '')

        if not email or not password:
            return Response("Invalid email or password",
                            status=rf_status.HTTP_400_BAD_REQUEST)

        try:
            validate_email(email)
        except Exception as e:
            return Response({'status': 'nok', 'msg': 'invalid email'})

        try:
            user = User.objects.create_user(username=email,
                                            email=email,
                                            password=password, is_active=False)
            p = Player(user=user)
            p.regen_confirm_code()
            p.save()
        except Exception as e:
            return Response({'status': 'nok', 'msg': 'invalid email'})

        url = settings.BASE_URL + reverse('confirm', kwargs={'code':p.confirm_code})
        msg = EmailMultiAlternatives(
            _('Socializa account validation'),
            _('Validate your socializa account: %s') % url,
            to=[email],
        )
        html_message = _('Validate your socializa account: '
                         '<a href="%s">%s</a>') % (url, p.confirm_code)
        msg.attach_alternative(html_message, "text/html")
        msg.send()

        return Response({'status': 'ok'})
register = Register.as_view()


class RegisterConfirm(TemplateView):
    template_name = 'register/confirmed.html'

    def get_context_data(self, *args, **kwargs):
        ctx = super().get_context_data(*args, **kwargs)

        p = get_object_or_404(Player, confirm_code=kwargs.get('code', ''))
        p.user.is_active = True
        p.user.save()

        ctx['player'] = p
        ctx['base_url'] = settings.BASE_URL

        return ctx
confirm = RegisterConfirm.as_view()


class ChangePasswd(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        current = request.data.get('current', '')
        newpwd = request.data.get('new', '')
        u = request.user

        if not current or not newpwd or not u.check_password(current):
            return Response("Invalid password",
                            status=rf_status.HTTP_400_BAD_REQUEST)

        u.set_password(newpwd)
        u.save()

        AccessToken.objects.filter(user=u).delete()

        return Response({'status': 'ok'})
passwd = ChangePasswd.as_view()
