from django.contrib.auth.models import User
from django.test import Client
from rest_framework.test import APITestCase

from game.models import Challenge
from game.models import Game


class GameTestCase(APITestCase):

    fixtures = ['player-test.json', 'event.json', 'editor.json']

    def setUp(self):
        self.c = Client()
        self.game_data = {
            # Game
            'game_title': 'title game',
            'game_desc': 'desc game',
            'game_solution': 'solution game',

            # Challenge 1: player
            'challenge_title_1': 'title challenge 1',
            'challenge_desc_1': 'desc challenge 1',
            'challenge_solution_1': 'solution challenge 1',
            'challenge_type_1': 'pj',
            'challenge_extra_1': 'description of player',

            # Challenge 1: actor
            'challenge_title_2': 'title challenge 2',
            'challenge_desc_2': 'desc challenge 2',
            'challenge_solution_2': 'solution challenge 2',
            'challenge_type_2': 'pnj',
            'challenge_extra_2': 'description of actor',

            # Challenge 1: ia
            'challenge_title_3': 'title challenge 3',
            'challenge_desc_3': 'desc challenge 3',
            'challenge_solution_3': 'solution challenge 3',
            'challenge_type_3': 'pnj',
            'challenge_extra_3': '37.5435, -5.1234',
        }

    def tearDown(self):
        pass

    def test_authentication(self):
        # TODO: change in the futuro when group editor exist
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
        response = self.c.post('/editor/game/', self.game_data)
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
        response = self.c.post('/editor/game/{0}/'.format(gameid), self.game_data)
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

