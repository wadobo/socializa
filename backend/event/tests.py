from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Event
from .models import Membership
from player.models import Player
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
    EVENT_PK_5 = 5
    MAX_PLAYER_EVENT_2 = 3
    PLAYER5_JOINED_EVENT = 3

    def setUp(self):
        self.username = 'test1'
        self.pwd = 'qweqweqwe'
        self.c = JClient()
        self.event = Event.objects.get(pk=self.EVENT_PK_2)

    def tearDown(self):
        self.c = None
        self.event.players.clear()

    @classmethod
    def get_username_by_player(cls, pk):
        return Player.objects.get(pk=pk).user.username

    def test_join_an_event_unauthorized(self):
        response = self.c.post('/api/event/join/{0}/'.format(self.EVENT_PK_2), {})
        self.assertEqual(response.status_code, 401)

    def test_join_an_event_not_exist(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event/join/{0}/'.format(999), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'Event not exist')

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
        response = self.c.post('/api/event/join/{0}/'.format(self.EVENT_PK_2), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'This player already is join at this event')

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

    def test_unjoin_event_anonymous(self):
        response = self.c.delete('/api/event/unjoin/{0}/'.format(self.EVENT_PK_3), {})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), 'Anonymous user')

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
        response = self.c.delete('/api/event/unjoin/{0}/'.format(self.EVENT_PK_5), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'Event not exist')

    def test_get_my_events_unauth(self):
        response = self.c.get('/api/event/my-events/', {})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), 'Anonymous user')

    def test_get_my_events(self):
        response = self.c.authenticate('test5', self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.get('/api/event/my-events/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), self.PLAYER5_JOINED_EVENT)

    def test_get_all_events_unauth(self):
        response = self.c.get('/api/event/all/', {})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), 'Anonymous user')

    def test_get_all_events(self):
        response = self.c.authenticate('test5', self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.get('/api/event/all/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)
        # Edit an event for tomorrow
        self.event.start_date = timezone.now() + timezone.timedelta(days=1)
        self.event.end_date = timezone.now() + timezone.timedelta(days=2)
        self.event.save()
        response = self.c.get('/api/event/all/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_get_event_detail(self):
        response = self.c.authenticate('test5', self.pwd)
        self.assertEqual(response.status_code, 200)
        # Edit an event for tomorrow
        self.event.start_date = timezone.now() + timezone.timedelta(days=1)
        self.event.end_date = timezone.now() + timezone.timedelta(days=2)
        self.event.save()

        pk = self.event.pk
        response = self.c.get('/api/event/%s/' % pk, {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['pk'], pk)

        # event that doesn't exist
        response = self.c.get('/api/event/523/', {})
        self.assertEqual(response.status_code, 400)

    def test_solve_event_unauthorized(self):
        """ User try solve event with event_id unauthorized. """
        event_id = 1
        player = 3
        data = {'solution': 'solution'}
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event/solve/{0}/'.format(event_id), data)
        self.assertEqual(response.status_code, 401)

    def test_solve_event_no_data(self):
        """ Event's solution is incorrect. """
        event_id = 3
        player = 3
        data = {}
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event/solve/{0}/'.format(event_id), data)
        self.assertEqual(response.status_code, 400)

    def test_solve_event_empty(self):
        """ Event's solution is incorrect. """
        event_id = 3
        player = 3
        data = {'solution': ''}
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event/solve/{0}/'.format(event_id), data)
        self.assertEqual(response.status_code, 400)

    def test_solve_event_incorrect(self):
        """ Event's solution is incorrect. """
        event_id = 3
        player = 3
        data = {'solution': 'solution'}
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event/solve/{0}/'.format(event_id), data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': "incorrect"})

    def test_solve_event_correct(self):
        """ Event's solution is correct. """
        event_id = 3
        player = 3
        event = Event.objects.get(pk=event_id)
        solution = event.game.solution
        data = {'solution': solution}
        response = self.c.authenticate(self.get_username_by_player(player), self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event/solve/{0}/'.format(event_id), data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': "correct"})
        player = Player.objects.get(pk=player)
        membership_status = Membership.objects.filter(event=event, player=player).first().status
        self.assertEqual(membership_status, 'solved')


class PlayerEventTestCase(APITestCase):
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
        all player are in event 4: 4 inside and 1 outside place
        In event 3:
            player 1 is near to player 2 and player 3
            player 1 is near to player 5 but player 5 is outside place
            player 1 is far player 4
    """
    fixtures = ['player-test.json', 'event.json']
    EVENT_PK_1 = 1
    EVENT_PK_2 = 2
    EVENT_PK_3 = 3
    EVENT_PK_4 = 4
    PLAYER_PK_2 = 2
    PLAYER_PK_3 = 3
    PLAYER_PK_5 = 5
    NEAR_PLAYER_1_EVENT_4 = 2
    NEAR_PLAYER_4_EVENT_4 = 0
    NEAR_PLAYER_5_EVENT_4 = 0 # outside event

    def setUp(self):
        self.username1 = 'test1'
        self.username4 = 'test4'
        self.username = 'test5'
        self.pwd = 'qweqweqwe'
        self.c = JClient()

    def tearDown(self):
        self.c = None

    def test_players_near_in_event(self):
        response = self.c.authenticate(self.username1, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.get('/api/player/near/{0}/'.format(self.EVENT_PK_4), {})
        self.assertEqual(response.status_code, 200)
        players = [d for d in response.json() if d.get('ia') is False]
        self.assertEqual(len(players), self.NEAR_PLAYER_1_EVENT_4)

    def test_players_near_in_event2(self):
        response = self.c.authenticate(self.username4, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.get('/api/player/near/{0}/'.format(self.EVENT_PK_4), {})
        self.assertEqual(response.status_code, 200)
        players = [d for d in response.json() if d.get('ia') is False]
        self.assertEqual(len(players), self.NEAR_PLAYER_4_EVENT_4)

    def test_players_near_in_event3(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.get('/api/player/near/{0}/'.format(self.EVENT_PK_4), {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), 'Your player is outside of place.')

    def test_players_near_in_unauth_event(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.get('/api/player/near/{0}/'.format(self.EVENT_PK_2), {})
        self.assertEqual(response.status_code, 401)

    def test_players_meeting_in_event(self):
        response = self.c.authenticate(self.username1, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(self.PLAYER_PK_2, self.EVENT_PK_4), {})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), {'status': 'step1'})

    def test_players_meeting_in_event_unauth_event(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(self.PLAYER_PK_3, self.EVENT_PK_2), {})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), 'Unauthorized event')

    def test_players_meeting_in_event_with_player2_outside_event(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(self.PLAYER_PK_3, self.EVENT_PK_1), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'Other player not join at this event')

    def test_players_meeting_in_event_with_himself(self):
        response = self.c.authenticate(self.username, self.pwd)
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(self.PLAYER_PK_5, self.EVENT_PK_3), {})
        self.assertEqual(response.json(), 'narcissistic: you cannot connect with yourself')
        self.assertEqual(response.status_code, 400)
