import json
from rest_framework.test import APITestCase

from .models import Event
from player.test_client import JClient


class EventTestCase(APITestCase):
    """
    Inside event.json fixture have:
    - 3 event, 3 game and 17 challenges:
      - general event (pk=1) with general game (pk=1) with general challenge (pk=1). Max_player = 0
      - event 2 (pk=2) with game 2 (pk=2) with challenges (pk=[2,3,4,5,6,7,8]). Event have solution,
            and Challenges no have solutions. Max_player = 3
      - event 3 (pk=3) with game 3 (pk=3) with general challenge (pk=[9,10,11,12,13]). Event and
            Challenges have solution. Max_player = 10
    - membership:
        player 3 ('test3') in event 3
        player 5 ('test5') in event 1 and 3
    """
    fixtures = ['player-test.json', 'event.json']
    EVENT_PK_2 = 2
    EVENT_PK_3 = 3
    EVENT_PK_4 = 4
    MAX_PLAYER_EVENT_2 = 3
    PLAYER5_JOINED_EVENT = 2

    def setUp(self):
        self.username = 'test1'
        self.pwd = 'qweqweqwe'
        self.c = JClient()

    def tearDown(self):
        self.c = None
        event = Event.objects.get(pk=self.EVENT_PK_2)
        event.players.clear()

    def test_join_an_event_unauthorized(self):
        response = self.c.post('/api/event/join/{0}/'.format(self.EVENT_PK_2), {})
        self.assertEqual(response.status_code, 401)

    def test_join_an_event(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event/join/{0}/'.format(self.EVENT_PK_2), {})
        self.assertEqual(response.status_code, 201)

    def test_join_an_event_repeat(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event/join/{0}/'.format(self.EVENT_PK_2), {})
        self.assertEqual(response.status_code, 201)

    def test_join_an_event_max(self):
        repeat = 1
        while repeat <= self.MAX_PLAYER_EVENT_2:
            username = 'test{0}'.format(repeat)
            response = self.c.authenticate(username, self.pwd)
            self.assertEqual(response.status_code, 200)
            response = self.c.post('/api/event/join/{0}/'.format(self.EVENT_PK_2), {})
            self.assertEqual(response.status_code, 201)
            repeat += 1
        response = self.c.post('/api/event/join/{0}/'.format(self.EVENT_PK_2), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'Maximum number of player in this event')

    def test_unjoin_event(self):
        response = self.c.authenticate('test3', self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.delete('/api/event/unjoin/{0}/'.format(self.EVENT_PK_3), {})
        self.assertEqual(response.status_code, 200)

    def test_unjoin_event_no_join(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.delete('/api/event/unjoin/{0}/'.format(self.EVENT_PK_3), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'You not join in this event.')

    def test_unjoin_event_no_exist(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.delete('/api/event/unjoin/{0}/'.format(self.EVENT_PK_4), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'Event not exist')

    def test_get_my_events(self):
        response = self.c.authenticate('test5', self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.get('/api/event/my-events/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), self.PLAYER5_JOINED_EVENT)
