from django.conf import settings
from rest_framework.test import APITestCase

from base.client import BaseClient
from .models import Player
from .serializers import PlayerSerializer


class PlayerTestCase(APITestCase):

    fixtures = ['applications.json', 'players.json']

    def setUp(self):
        self.client = BaseClient(version=settings.VERSION)  # Check last version
        self.player = Player.objects.first()

    def tearDown(self):
        self.client = None

    def authenticate(self, username='me@socializa.com', pwd='qweqweqwe'):
        response = self.client.authenticate(username, pwd)
        self.assertEqual(response.status_code, 200)

    def test_players_register(self):
        self.assertEqual(Player.objects.count(), 1)
        data = {
            'email': 'test@socializa.com',
            'password': 'qweqweqwe'
        }
        response = self.client.post('/player/', data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Player.objects.count(), 2)
        response = self.client.post('/player/', data)
        self.assertEqual(response.status_code, 409)

    def test_players_login(self):
        self.authenticate()

    def test_player_update(self):
        data = {'type': 'ai'}
        response = self.client.put('/player/{0}/'.format(self.player.pk), data)
        self.assertEqual(response.status_code, 200)

    def test_player_delete(self):
        response = self.client.delete('/player/{0}/'.format(self.player.pk))
        self.assertEqual(response.status_code, 204)

    def test_players_logout(self):
        self.client.logout()

    def test_players_list(self):
        response = self.client.get('/player/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()[0], PlayerSerializer(self.player).data)

