from django.contrib.auth.models import User
from django.contrib.gis.geos import GEOSGeometry
from rest_framework.test import APITestCase

from clue.models import Clue
from game.serializers import ChallengeSerializer
from player.test_client import JClient
from player.models import Meeting
from player.models import Player


class PlayerTestCase(APITestCase):
    """
    Inside fixture have 5 players:
    - admin -> pk=1; playerX -> pk=X+1
    - player1 and player2: distance < 10 m. IS NEAR
    - player1 and player3: distance < 1 km. IS NEAR
    - player1 and player4: distance < 5 km. IS FAR
    - player5: distance < 1 km, but outside event.place. IS NEAR
    - applications: facebook, twitter
    """
    fixtures = ['player-test.json']
    PLAYER2_PK = 2
    PLAYER5_PK = 5
    PLAYERS_NEAR_PLAYER1 = 3

    def setUp(self):
        self.username = 'test1'
        self.pwd = 'qweqweqwe'
        self.c = JClient()

    def tearDown(self):
        self.c = None

    def authenticate(self, username='test1', pwd='qweqweqwe'):
        response = self.c.authenticate(username, pwd)
        self.assertEqual(response.status_code, 200)

    def test_players_near_without_login(self):
        response = self.c.get('/api/player/near/', {})
        self.assertEqual(response.status_code, 401)

    def test_meeting_without_login(self):
        response = self.c.post('/api/player/meeting/{0}/'.format(self.PLAYER2_PK), {})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), 'Anonymous user')

    def test_meeting_with_login_far(self):
        self.authenticate()
        response = self.c.post('/api/player/meeting/{0}/'.format(self.PLAYER5_PK), {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), 'User is far for meeting')

    def test_change_position_unauthorized(self):
        response = self.c.post('/api/player/set-pos/', {'lat': '-6', 'lon': '37'})
        self.assertEqual(response.status_code, 401)

    def test_change_position(self):
        self.authenticate()
        response = self.c.post('/api/player/set-pos/', {'lat': '-6', 'lon': '37'})
        self.assertEqual(response.status_code, 200)

    def test_delete_position_unauthorized(self):
        response = self.c.delete('/api/player/set-pos/', {})
        self.assertEqual(response.status_code, 401)

    def test_delete_position(self):
        self.authenticate()
        response = self.c.delete('/api/player/set-pos/', {})
        self.assertEqual(response.status_code, 200)

    def test_change_position_invalid(self):
        self.authenticate()
        response = self.c.post('/api/player/set-pos/', {'lat': 'bad', 'lon': '37'})
        self.assertEqual(response.status_code, 400)
        response = self.c.post('/api/player/set-pos/', {'lat': '', 'lon': ''})
        self.assertEqual(response.status_code, 400)
        response = self.c.post('/api/player/set-pos/', {'lat': '', 'lon': '37'})
        self.assertEqual(response.status_code, 400)

    def test_profile(self):
        self.authenticate()

        interests = ['sports', 'books', 'music']
        interests2 = ['music']
        response = self.c.post('/api/player/profile/',
            {'about': 'about me', 'interests': interests})
        self.assertEqual(response.status_code, 200)

        response = self.c.get('/api/player/profile/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['about'], 'about me')
        self.assertEqual(response.json()['interests'], interests)

        response = self.c.post('/api/player/profile/',
            {'interests': interests2})
        self.assertEqual(response.status_code, 200)

        response = self.c.get('/api/player/profile/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['about'], 'about me')
        self.assertEqual(response.json()['interests'], interests2)


class MeetingTestCase(APITestCase):
    fixtures = ['meeting-test.json']
    PLAYER2_PK = 2

    def setUp(self):
        self.pwd = 'qweqweqwe'
        self.c = JClient()

    def tearDown(self):
        self.c = None

    def authenticate(self, username, pwd='qweqweqwe'):
        response = self.c.authenticate(username, pwd)
        self.assertEqual(response.status_code, 200)

    @classmethod
    def get_username(cls, pk):
        return Player.objects.get(pk=pk).user.username

    @classmethod
    def get_challenge_from_player(cls, pk, event=1):
        clue = Clue.objects.get(player=pk, main=True, event=event)
        return ChallengeSerializer(clue.challenge).data

    def test_meeting_player1_not_in_event(self):
        """ player1 not in event """
        player1 = 6
        player2 = 1
        event = 1
        response = self.c.authenticate(self.get_username(player1), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(player2, event), {})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), "Unauthorized event")

    def test_meeting_player2_not_in_event(self):
        """ player2 not in event """
        player1 = 1
        player2 = 6
        event = 1
        self.authenticate(self.get_username(player1), self.pwd)
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(player2, event), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), "Other player not join at this event")

    def test_meeting_near_step1_ai(self):
        """ player1 near player2 (AI) """
        player1 = 1
        player2 = 2
        event = 1
        self.authenticate(self.get_username(player1), self.pwd)
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(player2, event), {})
        self.assertEqual(response.status_code, 201)
        res = {'clue': self.get_challenge_from_player(player2)}
        res.update({'status': 'connected'})
        self.assertEqual(response.json(), res)

    def test_meeting_near_step1_no_ai(self):
        """ no meeting between player1 and player3. player1 near player3. """
        player1 = 1
        player2 = 3
        event = 1
        self.authenticate(self.get_username(player1), self.pwd)
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(player2, event), {})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), {'status': 'step1'})

    def test_meeting_near_step2(self):
        """ meeting between player3 and player4 with status step1. player3 near player4. """
        player1 = 4
        player2 = 3
        event = 1
        self.authenticate(self.get_username(player1), self.pwd)
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(player2, event), {})
        self.assertEqual(response.status_code, 200)
        secret = Meeting.objects.get(player1=player2, player2=player1, event_id=event).secret
        self.assertEqual(response.json(), {'status': 'step2', 'secret': secret})

    def test_meeting_near_invalid_code(self):
        """ meeting between player5 and player4 with status step2. player4 near player5. """
        player1 = 4
        player2 = 5
        event = 1
        secret = 'INCORRECT'
        self.authenticate(self.get_username(player1), self.pwd)
        response = self.c.post('/api/player/meeting/{0}/{1}/captured/{2}/'.format(player2, event, secret), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), "Invalid secret")

    def test_meeting_near_valid_code(self):
        """ meeting between player5 and player4 with status step2. player4 near player5. """
        player1 = 4
        player2 = 5
        event = 1
        secret = '0123456789ABCDEF'
        self.authenticate(self.get_username(player1), self.pwd)
        response = self.c.post('/api/player/meeting/{0}/{1}/captured/{2}/'.format(player2, event, secret), {})
        self.assertEqual(response.status_code, 200)
        res = {'clue': self.get_challenge_from_player(player2)}
        res.update({'status': 'connected'})
        self.assertEqual(response.json(), res)

    def test_meeting_near_polling_waiting(self):
        """ meeting between player4 and player5 with status step2. player4 near player5. """
        player1 = 5
        player2 = 4
        event = 1
        self.authenticate(self.get_username(player1), self.pwd)
        response = self.c.get('/api/player/meeting/{0}/{1}/qrclue/'.format(player2, event), {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': 'waiting'})

    def test_meeting_near_polling_correct(self):
        """ meeting between player4 and player5 with status step2. player4 near player5. """
        player1 = 5
        player2 = 4
        event = 1
        meeting = Meeting.objects.filter(player1=player2, player2=player1, event_id=event).first()
        prev_status = meeting.status
        meeting.status = 'connected'
        meeting.save()
        self.authenticate(self.get_username(player1), self.pwd)
        response = self.c.get('/api/player/meeting/{0}/{1}/qrclue/'.format(player2, event), {})
        self.assertEqual(response.status_code, 200)
        res = {'clue': self.get_challenge_from_player(player2)}
        res.update({'status': 'connected'})
        self.assertEqual(response.json(), res)
        meeting.status = prev_status
        meeting.save()

    def test_meeting_between_players_without_challenge(self):
        user_1 = User.objects.create_user('user_1', 'user_1@test.com', 'qweqweqwe')
        user_2 = User.objects.create_user('user_2', 'user_2@test.com', 'qweqweqwe')
        pos = GEOSGeometry('POINT(37.00000 -5.00000)')
        player_1 = Player(user=user_1, pos=pos)
        player_1.save()
        player_2 = Player(user=user_2, pos=pos)
        player_2.save()

        self.authenticate(self.get_username(player_1.pk), self.pwd)
        # step 1
        response = self.c.post('/api/player/meeting/{0}/'.format(player_2.pk), {})
        self.assertEqual(response.status_code, 201)

        self.authenticate(self.get_username(player_2.pk), self.pwd)
        # step 2
        response = self.c.post('/api/player/meeting/{0}/'.format(player_1.pk), {})
        self.assertEqual(response.status_code, 200)

        secret = Meeting.objects.get(player1=player_1, player2=player_2).secret
        self.authenticate(self.get_username(player_1.pk), self.pwd)
        # step 3
        response = self.c.post('/api/player/meeting/{0}/captured/{1}/'.format(player_2.pk, secret), {})
        self.assertEqual(response.status_code, 200)

        self.authenticate(self.get_username(player_2.pk), self.pwd)
        # step 4
        response = self.c.get('/api/player/meeting/{0}/qrclue/'.format(player_1.pk), {})
        self.assertEqual(response.status_code, 200)
