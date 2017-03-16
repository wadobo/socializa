from django.contrib.auth.models import User
from django.test import Client
from rest_framework.test import APITestCase

from event.models import Event
from game.models import Challenge
from game.models import Game


class GameTestCase(APITestCase):

    fixtures = ['player-test.json', 'event.json', 'editor.json']

    def setUp(self):
        self.c = Client()
        self.game_data = {
            # Game
            'game_name': 'title game',
            'game_desc': 'desc game',
            'game_solution': 'solution game',

            # Challenge 1: player
            'challenge_name_1': 'title challenge 1',
            'challenge_desc_1': 'desc challenge 1',
            'challenge_solution_1': 'solution challenge 1',
            'challenge_type_1': 'p',
            'challenge_extra_1': 'description of player',

            # Challenge 1: actor
            'challenge_name_2': 'title challenge 2',
            'challenge_desc_2': 'desc challenge 2',
            'challenge_solution_2': 'solution challenge 2',
            'challenge_type_2': 'np',
            'challenge_extra_2': 'description of actor',

            # Challenge 1: ia
            'challenge_name_3': 'title challenge 3',
            'challenge_desc_3': 'desc challenge 3',
            'challenge_solution_3': 'solution challenge 3',
            'challenge_type_3': 'np',
            'challenge_extra_3': '37.5435, -5.1234',
        }

    def tearDown(self):
        pass

    def test_authentication(self):
        # TODO: change in the future when group editor exist
        self.c.login(username='test1', password='qweqweqwe')
        response = self.c.get('/editor/game/', {}, follow=True)
        self.assertEqual(response.request.get('PATH_INFO'), '/admin/login/')

        self.c.login(username='admin', password='qweqweqwe')
        response = self.c.get('/editor/game/', {})
        self.assertNotEqual(response.request.get('PATH_INFO'), '/admin/login/')

    def test_game_create(self):
        ini_games = Game.objects.count()
        ini_challenges = Challenge.objects.count()
        self.c.login(username='admin', password='qweqweqwe')
        response = self.c.post('/editor/game/', self.game_data, follow=True)
        self.assertEqual(response.status_code, 201)
        end_games = Game.objects.count()
        end_challenges = Challenge.objects.count()
        self.assertEqual(ini_games + 1, end_games)
        self.assertEqual(ini_challenges + 3, end_challenges)

    def test_game_update_unauthorized(self):
        """ test update game without authorization. editor try to edit an admin's game """
        gameid = 4
        self.c.login(username='editor', password='qweqweqwe')
        response = self.c.post('/editor/game/{0}/'.format(gameid), self.game_data)
        self.assertEqual(response.status_code, 401)

    def test_game_update(self):
        """ test update game: change a name of game and add two challenges """
        gameid = 4
        ini_games = Game.objects.count()
        ini_challenges = Challenge.objects.count()
        self.c.login(username='admin', password='qweqweqwe')
        response = self.c.post('/editor/game/{0}/'.format(gameid), self.game_data, follow=True)
        self.assertEqual(response.status_code, 200)
        end_games = Game.objects.count()
        end_challenges = Challenge.objects.count()
        self.assertEqual(ini_games, end_games)
        self.assertEqual(ini_challenges + 2, end_challenges)

    def test_game_delete_not_exists(self):
        gameid = 20
        self.c.login(username='editor', password='qweqweqwe')
        response = self.c.delete('/editor/game/{0}/'.format(gameid), {}, follow=True)
        self.assertEqual(response.status_code, 404)

    def test_game_delete_unauthorized(self):
        gameid = 4
        self.c.login(username='editor', password='qweqweqwe')
        response = self.c.delete('/editor/game/{0}/'.format(gameid), {}, follow=True)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(Game.objects.filter(pk=gameid).count(), 1)

    def test_game_delete(self):
        gameid = 4
        ini_challenges = Challenge.objects.count()
        self.c.login(username='admin', password='qweqweqwe')
        response = self.c.delete('/editor/game/{0}/'.format(gameid), {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Game.objects.filter(pk=gameid).count(), 0)
        end_challenges = Challenge.objects.count()
        self.assertEqual(ini_challenges, end_challenges + 1)


class EventTestCase(APITestCase):

    fixtures = ['player-test.json', 'event.json', 'editor.json']

    def setUp(self):
        self.c = Client()
        self.event_data = {
            # Event
            'ev_name': 'name event',
            'ev_price': '0',  # test 1
            'ev_max_players': '100',  # test 0
            'ev_vision_distance': '100',
            'ev_meeting_distance': '10',
            'ev_start_date': '2017/01/01 0:00',
            'ev_end_date': '2018/01/01 0:00',
            #'ev_place': {"type":"Polygon","coordinates":[[[-6.0012710323852545,37.362699763403995],[-6.003845953039551,37.35089693495779],[-5.9812724819702145,37.34994171159701],[-5.97257655313613,37.358470061397966],[-5.978498870641013,37.365360260265234],[-6.0012710323852545,37.362699763403995]]]},
            'ev_place': '{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[-5.9720590940040585,37.35286875003831],[-5.976350628427887,37.34945727183133],[-5.96776755958023,37.34850203015287],[-5.967510067514802,37.35655297237332],[-5.973432385019684,37.35628007321647],[-5.9720590940040585,37.35286875003831]]]},"properties":null}',
            'ev_game': '1'
        }

    def tearDown(self):
        self.c = None

    def test_authentication(self):
        # TODO: change in the future when group editor exist
        self.c.login(username='test1', password='qweqweqwe')
        response = self.c.get('/editor/event/', {}, follow=True)
        self.assertEqual(response.request.get('PATH_INFO'), '/admin/login/')

        self.c.login(username='admin', password='qweqweqwe')
        response = self.c.get('/editor/event/', {})
        self.assertNotEqual(response.request.get('PATH_INFO'), '/admin/login/')

    def test_event_create(self):
        username = 'editor'
        ini_events = Event.objects.count()
        ini_event_owners = User.objects.get(username=username).events.count()
        self.c.login(username=username, password='qweqweqwe')
        response = self.c.post('/editor/event/', self.event_data)
        self.assertEqual(response.status_code, 302)

        end_events = Event.objects.count()
        end_event_owners = User.objects.get(username=username).events.count()
        self.assertEqual(ini_events + 1, end_events)
        self.assertEqual(ini_event_owners + 1, end_event_owners)

    def test_event_modify_without_perms(self):
        event_pk = 5
        ini_event = Event.objects.get(pk=event_pk)
        self.c.login(username='admin', password='qweqweqwe')
        response = self.c.post('/editor/event/{0}/'.format(event_pk), self.event_data, follow=True)
        self.assertEqual(response.status_code, 401)

    def test_event_modify(self):
        event_pk = 5
        ini_event = Event.objects.get(pk=event_pk)
        self.c.login(username='editor', password='qweqweqwe')
        response = self.c.post('/editor/event/{0}/'.format(event_pk), self.event_data, follow=True)
        self.assertEqual(response.status_code, 200)
        end_event = Event.objects.get(pk=event_pk)
        self.assertNotEqual(ini_event.name, end_event.name)

    def test_event_delete_not_exists(self):
        event_pk = 20
        self.c.login(username='editor', password='qweqweqwe')
        response = self.c.delete('/editor/event/{0}/'.format(event_pk), {}, follow=True)
        self.assertEqual(response.status_code, 404)

    def test_event_delete_unauthorized(self):
        event_pk = 5
        self.c.login(username='admin', password='qweqweqwe')
        response = self.c.delete('/editor/event/{0}/'.format(event_pk), {}, follow=True)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(Event.objects.filter(pk=event_pk).count(), 1)

    def test_event_delete(self):
        event_pk = 5
        username = 'editor'
        ini_event_owners = User.objects.get(username=username).events.count()
        self.c.login(username=username, password='qweqweqwe')
        response = self.c.delete('/editor/event/{0}/'.format(event_pk), {})
        end_event_owners = User.objects.get(username=username).events.count()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Event.objects.filter(pk=event_pk).count(), 0)
        self.assertEqual(ini_event_owners - 1, end_event_owners)
