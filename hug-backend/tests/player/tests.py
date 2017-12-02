import hug

from base import TestBase
from fakes import fake
from fakes import gen_players
from fakes import gen_position
from socializa.base_db import db
from socializa.player.models import Player


class PlayerTest(TestBase):

    def setUp(self):
        super().setUp()
        db.connect(expire_on_commit=False)  #expire False for use self.player later
        self.player = list(gen_players(1))[0]
        db.session.add(self.player)
        db.close()

    # TEST CRUD
    def test_create(self):
        data = {
            "email": fake.email(),
            "password": fake.password()
        }
        response = self.client.post('/player/', data)
        self.assertEqual(response.status, hug.HTTP_201)

    def test_retrieve(self):
        response = self.client.get('/player/{0}/'.format(self.player.email))
        self.assertEqual(response.status, hug.HTTP_200)

    def test_update(self):
        data = {
            "email": fake.email(),
            "password": fake.password()
        }
        response = self.client.put('/player/{0}/'.format(self.player.email), data)
        self.assertEqual(response.status, hug.HTTP_200)

    def test_delete(self):
        response = self.client.delete('/player/{0}/'.format(self.player.email))
        self.assertEqual(response.status, hug.HTTP_204)
        response = self.client.get('/player/{0}/'.format(self.player.email))
        self.assertEqual(response.status, hug.HTTP_404)

    def test_list_players(self):
        response = self.client.get('/player/')
        self.assertEqual(response.status, hug.HTTP_200)
        self.assertEqual(len(response.data), 1)
