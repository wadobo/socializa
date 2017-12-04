import hug
from fakes import fake
from fakes import gen_games
from fakes import gen_data_game

from base import TestBase
from socializa.base_db import db
from socializa.game.models import Game


class GameTest(TestBase):

    def setUp(self):
        super().setUp()
        db.connect(expire_on_commit=False)  #expire False for use self.game later
        self.game = list(gen_games(1))[0]
        db.session.add(self.game)
        db.close()


    # TEST CRUD
    def test_create(self):
        data = gen_data_game()
        response = self.client.post('/game/', data)
        self.assertEqual(response.status, hug.HTTP_201)

    def test_retrieve(self):
        response = self.client.get('/game/{0}/'.format(self.game.id))
        self.assertEqual(response.status, hug.HTTP_200)

    def test_update(self):
        data = gen_data_game()
        response = self.client.put('/game/{0}/'.format(self.game.id), data)
        self.assertEqual(response.status, hug.HTTP_200)

    def test_delete(self):
        response = self.client.delete('/game/{0}/'.format(self.game.id))
        self.assertEqual(response.status, hug.HTTP_204)
        response = self.client.get('/game/{0}/'.format(self.game.id))
        self.assertEqual(response.status, hug.HTTP_404)

    def test_list(self):
        response = self.client.get('/game/')
        self.assertEqual(response.status, hug.HTTP_200)
        self.assertEqual(len(response.data), 1)
