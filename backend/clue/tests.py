from rest_framework.test import APITestCase

from event.models import Event
from player.models import Player
from player.test_client import JClient
from .models import Clue


class ClueTestCase(APITestCase):
    """
    There are 2 events:
    - 1: Einstein Game: with 4 challenge (without solution in challenge)
    - 2: Easy Game: with 1 challeng (with solution in challenge)
    Players:
    - 1: belong to event 1 and 2. have 2 clue in event 1 with pk 1 and 2
    - 1: belong to event 2. have 1 clue in event 2 with pk 3

    """
    fixtures = ['player-test.json', 'clue.json']
    EVENT_PK = 1
    GAME_PK = 1
    USER_CLUES = 2
    EVENT3_PK = 3

    def setUp(self):
        self.pwd = 'qweqweqwe'  # USER_1
        self.c = JClient()
        self.event = Event.objects.get(pk=self.EVENT_PK)

    def tearDown(self):
        self.c = None
        self.event.players.clear()

    @classmethod
    def get_username_by_player(cls, pk):
        return Player.objects.get(pk=pk).user.username

    def test_get_my_clues(self):
        player = 1
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.get('/api/clue/my-clues/{0}/'.format(self.GAME_PK), {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), self.USER_CLUES)

    def test_join_event_create_clue(self):
        player = 2
        start_clues = Clue.objects.count()
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event/join/{0}/'.format(self.EVENT_PK), {})
        self.assertEqual(response.status_code, 201)
        end_clues = Clue.objects.count()
        self.assertEqual(start_clues + 1, end_clues)


    def test_join_event_create_clue_two_players(self):
        player1 = 1
        player2 = 2

        response = self.c.authenticate(self.get_username_by_player(player1), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event/join/{0}/'.format(self.EVENT3_PK), {})
        self.assertEqual(response.status_code, 201)

        response = self.c.authenticate(self.get_username_by_player(player2), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event/join/{0}/'.format(self.EVENT3_PK), {})
        self.assertEqual(response.status_code, 201)

        event = Event.objects.get(pk=self.EVENT3_PK)
        clue1 = Clue.objects.filter(player=player1, main=True, event=event).first()
        clue2 = Clue.objects.filter(player=player2, main=True, event=event).first()
        self.assertNotEqual(clue1.challenge, clue2.challenge)


    def test_unjoin_event_delete_clue(self):
        player = 1
        start_clues = Clue.objects.count()
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.delete('/api/event/unjoin/{0}/'.format(self.EVENT_PK), {})
        self.assertEqual(response.status_code, 200)
        end_clues = Clue.objects.count()
        self.assertEqual(start_clues - 1, end_clues)

    def test_solve_clue_not_exist(self):
        """ User try solve clue with clue_id not exist. """
        player = 1
        clue_id = 4
        data = {'solution': 'solution'}
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/clue/solve/{0}/'.format(clue_id), data)
        self.assertEqual(response.status_code, 401)

    def test_solve_clue_unauthorized2(self):
        """ User try solve clue with clue_id unauthorized. """
        player = 1
        clue_id = 3
        data = {'solution': 'solution'}
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/clue/solve/{0}/'.format(clue_id), data)
        self.assertEqual(response.status_code, 401)

    def test_solve_clue_invalid(self):
        """ Clue can't solve because clue haven't solution. """
        player = 1
        clue_id = 1
        data = {'solution': 'solution'}
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/clue/solve/{0}/'.format(clue_id), data)
        self.assertEqual(response.status_code, 400)

    def test_solve_clue_no_data(self):
        """ Clue's solution not in data. """
        player = 2
        clue_id = 3
        data = {}
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/clue/solve/{0}/'.format(clue_id), data)
        self.assertEqual(response.status_code, 400)

    def test_solve_clue_empty(self):
        """ Clue's solution is empty. """
        player = 2
        clue_id = 3
        data = {'solution': ''}
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/clue/solve/{0}/'.format(clue_id), data)
        self.assertEqual(response.status_code, 400)

    def test_solve_clue_incorrect(self):
        """ Clue's solution is incorrect. """
        player = 2
        clue_id = 3
        data = {'solution': 'no solution'}
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/clue/solve/{0}/'.format(clue_id), data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': "incorrect"})

    def test_solve_clue_correct(self):
        """ Clue's solution is correct. """
        player = 2
        clue_id = 3
        data = {'solution': 'solution'}
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/clue/solve/{0}/'.format(clue_id), data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': "correct"})
        clue_status = Clue.objects.get(pk=clue_id).status
        self.assertEqual(clue_status, 'solved')
