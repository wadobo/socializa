import json
from django.test import Client
from requests.auth import _basic_auth_str
from rest_framework.test import APITestCase

from oauth2_provider.models import Application


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
    def setUp(self):
        username, pwd = 'test2', 'qweqweqwe'
        self.c = Client()

    def get_access_token_with_user_password(self):
        """ login with player1 """
        app = Application.objects.get(name='Twitter')
        data = {
                "grant_type": "password",
                "username": "test1",
                "password": "qweqweqwe"
        }
        auth_headers = _basic_auth_str(app.client_id, app.client_secret)
        response = self.c.post('/api/social/token/', data, HTTP_AUTHORIZATION=auth_headers)
        self.assertEqual(response.status_code, 200)
        json_res = response.json()
        token_type = json_res.get('token_type')
        access_token = json_res.get('access_token')
        return "%s %s" % (token_type, access_token)

    def test_players_near_without_login(self):
        response = self.c.get('/api/player/near/', {})
        self.assertEqual(response.status_code, 401)

    def test_players_near_with_login(self):
        auth = self.get_access_token_with_user_password()
        response = self.c.get('/api/player/near/', {}, HTTP_AUTHORIZATION=auth)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)

    def test_meeting_without_login(self):
        pk = 3
        response = self.c.post('/api/player/meeting/{0}/'.format(pk), {})
        self.assertEqual(response.status_code, 401)

    def test_meeting_with_login_far(self):
        auth = self.get_access_token_with_user_password()
        pk = 6
        response = self.c.post('/api/player/meeting/{0}/'.format(pk), {}, HTTP_AUTHORIZATION=auth)
        self.assertEqual(response.status_code, 200)

    def test_meeting_with_login_near(self):
        auth = self.get_access_token_with_user_password()
        pk = 3
        response = self.c.post('/api/player/meeting/{0}/'.format(pk), {}, HTTP_AUTHORIZATION=auth)
        self.assertEqual(response.status_code, 201)
