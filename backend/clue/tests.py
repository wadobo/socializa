from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Clue
from event.models import Event
from player.models import Player
from player.test_client import JClient


class ClueTestCase(APITestCase):
    """
    EVENT_PK = 1 with GAME_PK and 4 challenge.
    USER_1 have 2 clues in GAME_PK
    """
    fixtures = ['player-test.json', 'clue.json']
    EVENT_PK = 1
    GAME_PK = 1
    USER_CLUES = 2

    def setUp(self):
        self.username = 'test1' # USER_1
        self.pwd = 'qweqweqwe' # USER_1
        self.username2 = 'test2' # USER_2
        self.pwd2 = 'qweqweqwe' # USER_2
        self.c = JClient()
        self.event = Event.objects.get(pk=self.EVENT_PK)

    def tearDown(self):
        self.c = None
        self.event.players.clear()

    def test_get_my_clues(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.get('/api/clue/my-clues/{0}/'.format(self.GAME_PK), {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), self.USER_CLUES)

    def test_join_event_create_clue(self):
        start_clues = Clue.objects.count()
        response = self.c.authenticate(self.username2, self.pwd2)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event/join/{0}/'.format(self.EVENT_PK), {})
        self.assertEqual(response.status_code, 201)
        end_clues = Clue.objects.count()
        self.assertEqual(start_clues + 1, end_clues)

    def test_unjoin_event_delete_clue(self):
        start_clues = Clue.objects.count()
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.delete('/api/event/unjoin/{0}/'.format(self.EVENT_PK), {})
        self.assertEqual(response.status_code, 200)
        end_clues = Clue.objects.count()
        self.assertEqual(start_clues - 1, end_clues)

