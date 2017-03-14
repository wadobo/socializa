from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Event
from .models import Membership
from .models import PlayingEvent
from player.models import Player
from player.test_client import JClient
from event.utils import manage_ais


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

    def setUp(self):
        self.c = JClient()
        event_pk = 2
        self.event = Event.objects.get(pk=event_pk)

    def tearDown(self):
        self.c = None
        self.event.players.clear()

    def authenticate(self, username, pwd='qweqweqwe'):
        response = self.c.authenticate(username, pwd)
        self.assertEqual(response.status_code, 200)

    @classmethod
    def get_username_by_player(cls, pk):
        return Player.objects.get(pk=pk).user.username

    def test_join_an_event_unauthorized(self):
        event_pk = 2
        response = self.c.post('/api/event/join/{0}/'.format(event_pk), {})
        self.assertEqual(response.status_code, 401)

    def test_join_an_event_not_exist(self):
        self.authenticate('test1')
        response = self.c.post('/api/event/join/{0}/'.format(999), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'Event not exist')

    def test_join_an_event(self):
        event_pk = 2
        self.authenticate('test1')
        response = self.c.post('/api/event/join/{0}/'.format(event_pk), {})
        self.assertEqual(response.status_code, 201)

    def test_join_an_event_repeat(self):
        event_pk = 2
        self.authenticate('test1')
        response = self.c.post('/api/event/join/{0}/'.format(event_pk), {})
        self.assertEqual(response.status_code, 201)
        response = self.c.post('/api/event/join/{0}/'.format(event_pk), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'This player already is join at this event')

    def test_join_an_event_max(self):
        event_pk = 2
        repeat = 1
        max_player_ev2 = Event.objects.get(pk=2).max_players
        while repeat <= max_player_ev2:
            username = 'test{0}'.format(repeat)
            self.authenticate(username)
            response = self.c.post('/api/event/join/{0}/'.format(event_pk), {})
            self.assertEqual(response.status_code, 201)
            repeat += 1
        response = self.c.post('/api/event/join/{0}/'.format(event_pk), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'Maximum number of player in this event')

    def test_unjoin_event_anonymous(self):
        event_pk = 3
        response = self.c.delete('/api/event/unjoin/{0}/'.format(event_pk), {})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), 'Anonymous user')

    def test_unjoin_event(self):
        event_pk = 3
        self.authenticate('test3')
        response = self.c.delete('/api/event/unjoin/{0}/'.format(event_pk), {})
        self.assertEqual(response.status_code, 200)

    def test_unjoin_event_no_join(self):
        event_pk = 3
        self.authenticate('test1')
        response = self.c.delete('/api/event/unjoin/{0}/'.format(event_pk), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'You not join in this event.')

    def test_unjoin_event_no_exist(self):
        event_pk = 5
        self.authenticate('test1')
        response = self.c.delete('/api/event/unjoin/{0}/'.format(event_pk), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'Event not exist')

    def test_get_my_events_unauth(self):
        response = self.c.get('/api/event/my-events/', {})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), 'Anonymous user')

    def test_get_my_events(self):
        player5_joined_event = Player.objects.get(pk=5).membership_set.count()
        self.authenticate('test5')
        response = self.c.get('/api/event/my-events/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), player5_joined_event)

    def test_get_all_events_unauth(self):
        response = self.c.get('/api/event/all/', {})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), 'Anonymous user')

    def test_get_all_events(self):
        self.authenticate('test5')
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

    def test_get_all_events_paginated(self):
        self.authenticate('test5')
        response = self.c.get('/api/event/all/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

        # Adding a lot of events
        evs = []
        for i in range(35):
            ev = Event(name="test-%s" % i, game=self.event.game)
            ev.start_date = timezone.now() + timezone.timedelta(days=1+i)
            ev.end_date = timezone.now() + timezone.timedelta(days=2+i)
            ev.save()
            evs.append(ev.pk)

        response = self.c.get('/api/event/all/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 20)
        self.assertEqual(response.json()[0]['name'], 'test-34')

        response = self.c.get('/api/event/all/?page=1', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 15)
        self.assertEqual(response.json()[0]['name'], 'test-14')

        response = self.c.get('/api/event/all/?q=test-0', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()[0]['name'], 'test-0')

        response = self.c.get('/api/event/all/?q=test-38', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

    def test_get_event_detail(self):
        self.authenticate('test5')
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
        self.authenticate(self.get_username_by_player(player))
        response = self.c.post('/api/event/solve/{0}/'.format(event_id), data)
        self.assertEqual(response.status_code, 401)

    def test_solve_event_no_data(self):
        """ Event's solution is incorrect. """
        event_id = 3
        player = 3
        data = {}
        self.authenticate(self.get_username_by_player(player))
        response = self.c.post('/api/event/solve/{0}/'.format(event_id), data)
        self.assertEqual(response.status_code, 400)

    def test_solve_event_empty(self):
        """ Event's solution is incorrect. """
        event_id = 3
        player = 3
        data = {'solution': ''}
        self.authenticate(self.get_username_by_player(player))
        response = self.c.post('/api/event/solve/{0}/'.format(event_id), data)
        self.assertEqual(response.status_code, 400)

    def test_solve_event_incorrect(self):
        """ Event's solution is incorrect. """
        event_id = 3
        player = 3
        data = {'solution': 'solution'}
        self.authenticate(self.get_username_by_player(player))
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
        self.authenticate(self.get_username_by_player(player))
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

    def setUp(self):
        self.c = JClient()

    def tearDown(self):
        self.c = None

    def authenticate(self, username, pwd='qweqweqwe'):
        response = self.c.authenticate(username, pwd)
        self.assertEqual(response.status_code, 200)

    def test_players_near_in_event2(self):
        event_pk = 4
        near_player4_ev4 = 0
        self.authenticate('test4')
        response = self.c.get('/api/player/near/{0}/'.format(event_pk), {})
        self.assertEqual(response.status_code, 200)
        players = [d for d in response.json() if not d.get('ptype') is 'ai']
        self.assertEqual(len(players), near_player4_ev4)

    def test_players_near_in_event3(self):
        event_pk = 4
        self.authenticate('test5')
        response = self.c.get('/api/player/near/{0}/'.format(event_pk), {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), 'Your player is outside of place.')

    def test_players_near_in_unauth_event(self):
        event_pk = 2
        self.authenticate('test5')
        response = self.c.get('/api/player/near/{0}/'.format(event_pk), {})
        self.assertEqual(response.status_code, 401)

    def test_players_meeting_in_event(self):
        event_pk = 4
        player_pk = 2
        self.authenticate('test1')
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(player_pk, event_pk), {})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), {'status': 'step1'})

    def test_players_meeting_in_event_unauth_event(self):
        event_pk = 2
        player_pk = 3
        self.authenticate('test5')
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(player_pk, event_pk), {})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json(), 'Unauthorized event')

    def test_players_meeting_in_event_with_player2_outside_event(self):
        event_pk = 1
        player_pk = 3
        self.authenticate('test5')
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(player_pk, event_pk), {})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), 'Other player not join at this event')

    def test_players_meeting_in_event_with_himself(self):
        event_pk = 3
        player_pk = 5
        self.authenticate('test5')
        response = self.c.post('/api/player/meeting/{0}/{1}/'.format(player_pk, event_pk), {})
        self.assertEqual(response.json(), 'narcissistic: you cannot connect with yourself')
        self.assertEqual(response.status_code, 400)


class PlayingEventTestCase(APITestCase):
    """
    Two events and general events
    player 1 and 2 in None event
    player 3 and 4 in event 1
    player 5 in event 2

    Players in the same current event, can be see it.
    Players in the different current event, can't be see it.
    """
    fixtures = ['player-test.json', 'event.json', 'playing_event.json']

    def setUp(self):
        self.event1 = 1
        self.event2 = 2
        self.c = JClient()

    def tearDown(self):
        self.c = None

    def authenticate(self, username, pwd='qweqweqwe'):
        response = self.c.authenticate(username, pwd)
        self.assertEqual(response.status_code, 200)

    def test_players_playing_event_with_event_none(self):
        """
        Player 1 and 2 in event None: visible
        Player 1 and 3 in event None: no visible
        """
        username = 'test2'
        self.authenticate('test1')
        response = self.c.get('/api/player/near/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0].get('username'), username)

    def test_players_playing_event_with_event_id(self):
        """
        Player 3 and 4 in event 1: visible. Player 3 is far to player 4
        Player 3 and 5 in event 1: no visible
        """
        event = Event.objects.get(pk=self.event1)
        prev_vd = event.vision_distance
        event.vision_distance = 9999
        event.save()

        self.authenticate('test3')
        response = self.c.get('/api/player/near/{0}/'.format(self.event1), {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        username = 'test4'
        self.assertEqual(response.json()[0].get('username'), username)

        event.vision_distance = prev_vd
        event.save()

    def test_playing_event_not_exits(self):
        self.authenticate('test1')
        response = self.c.post('/api/event/1/', {})
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event//', {})
        self.assertEqual(response.status_code, 200)

    def test_playing_event_exits(self):
        self.authenticate('test5')
        response = self.c.post('/api/event/{0}/'.format(self.event1), {})
        self.assertEqual(response.status_code, 200)
        response = self.c.post('/api/event//', {})
        self.assertEqual(response.status_code, 200)


class EventTasksTestCase(APITestCase):
    """ Test tasks for check taht work well """
    fixtures = ['player-test.json', 'event.json']

    def setUp(self):
        self.event2 = Event.objects.get(pk=2)
        self.event2.start_date = timezone.now() - timezone.timedelta(hours=2)
        self.event2.end_date = timezone.now() + timezone.timedelta(hours=2)
        self.ini_players = Player.objects.count()

    def get_member_players(self, event):
        return Membership.objects.filter(event=event).count()

    def get_playing_players(self, event):
        return PlayingEvent.objects.filter(event=event).count()

    def get_need_players(self, event):
        return event.max_players - event.players.count()

    def test_manage_ais_not_change(self):
        """ test manage_ais fails:
            * event is None
            * event have date out of current date
            * event haven't place
        """
        event1 = Event.objects.get(pk=1)
        ini_member_players = self.get_member_players(event1)
        ini_playing_players = self.get_playing_players(event1)

        manage_ais(None)
        manage_ais(event1)
        event1.start_date = timezone.now() - timezone.timedelta(hours=2)
        event1.end_date = timezone.now() + timezone.timedelta(hours=2)
        manage_ais(event1)

        end_players = Player.objects.count()
        end_member_players = self.get_member_players(event1)
        end_playing_players = self.get_playing_players(event1)

        self.assertEqual(self.ini_players, end_players)
        self.assertEqual(ini_member_players, end_member_players)
        self.assertEqual(ini_playing_players, end_playing_players)

    def test_manage_ais_fill_event(self):
        """ Check that add players and these are add like member and like playing in event """
        ini_member_players = self.get_member_players(self.event2)
        ini_playing_players = self.get_playing_players(self.event2)
        need_players = self.get_need_players(self.event2)

        manage_ais(self.event2)

        end_players = Player.objects.count()
        end_member_players = self.get_member_players(self.event2)
        end_playing_players = self.get_playing_players(self.event2)

        self.assertEqual(self.ini_players + need_players, end_players)
        self.assertEqual(ini_member_players + need_players, end_member_players)
        self.assertEqual(ini_playing_players + need_players, end_playing_players)

    def test_manage_ais_amount(self):
        """ Check that add players and these are add like member and like playing in event """
        ini_member_players = self.get_member_players(self.event2)
        ini_playing_players = self.get_playing_players(self.event2)
        need_players = 20

        manage_ais(self.event2, amount=need_players)

        end_players = Player.objects.count()
        end_member_players = self.get_member_players(self.event2)
        end_playing_players = self.get_playing_players(self.event2)

        self.assertEqual(self.ini_players + need_players, end_players)
        self.assertEqual(ini_member_players + need_players, end_member_players)
        self.assertEqual(ini_playing_players + need_players, end_playing_players)
