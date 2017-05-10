from django.contrib.auth.models import User
from django.contrib.gis.geos import GEOSGeometry
from rest_framework.test import APITestCase

from clue.models import Clue
from clue.serializers import ClueSerializer
from player.test_client import JClient
from player.models import Meeting
from player.models import Player


class ProductTestCase(APITestCase):
    fixtures = ['products.json']

    def setUp(self):
        self.client = JClient()

    def tearDown(self):
        self.client = None

    def test_get_products(self):
        response = self.client.get('/api/store/products/', {})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(),
                [
                    {'product_id': 'coin_100'},
                    {'product_id': 'coin_200'},
                    {'product_id': 'coin_500'},
                    {'product_id': 'coin_1000'},
                    {'product_id': 'coin_2000'},
                    {'product_id': 'coin_5000'}
                ]
        )
