import json
from rest_framework.test import APITestCase

from player.test_client import JClient


class PlayerTestCase(APITestCase):
    """
    Inside fixture have 5 players:
    - admin -> pk=1; playerX -> pk=X+1
    - player1 and player2: distance < 10 m
    - player1 and player3: distance < 1 km
    - player1 and player4: distance < 5 km
    - player1 and player5: distance > 5 km
    - applications: facebook, twitter
    """
    fixtures = ['player-test.json']
    PLAYER2_PK = 2
    PLAYER5_PK = 5
    PLAYERS_NEAR_PLAYER1 = 2

    def setUp(self):
        self.username = 'test1'
        self.pwd = 'qweqweqwe'
        self.c = JClient()

    def tearDown(self):
        self.c = None

    def test_players_near_without_login(self):
        response = self.c.get('/api/player/near/', {})
        self.assertEqual(response.status_code, 401)

    def test_players_near_with_login(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.get('/api/player/near/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), self.PLAYERS_NEAR_PLAYER1)

    def test_meeting_without_login(self):
        response = self.c.post('/api/player/meeting/{0}/'.format(self.PLAYER2_PK), {})
        self.assertEqual(response.status_code, 401)

    def test_meeting_with_login_far(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/player/meeting/{0}/'.format(self.PLAYER5_PK), {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), 'User is far for meeting')

    def test_meeting_with_login_near(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/player/meeting/{0}/'.format(self.PLAYER2_PK), {})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), 'Meeting created')

    def test_change_position_unauthorized(self):
        response = self.c.post('/api/player/set-pos/', {'lat': '-6', 'lon': '37'})
        self.assertEqual(response.status_code, 401)

    def test_change_position(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/player/set-pos/', {'lat': '-6', 'lon': '37'})
        self.assertEqual(response.status_code, 200)

    def test_change_position_invalid(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/player/set-pos/', {'lat': 'bad', 'lon': '37'})
        self.assertEqual(response.status_code, 400)
        response = self.c.post('/api/player/set-pos/', {'lat': '', 'lon': ''})
        self.assertEqual(response.status_code, 400)
        response = self.c.post('/api/player/set-pos/', {'lat': '', 'lon': '37'})
        self.assertEqual(response.status_code, 400)
