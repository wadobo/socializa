from faker import Faker
from random import choice
from socializa.player.models import Player

fake = Faker()


def gen_position():
    return {
        'lat': fake.latitude(),
        'lon': fake.longitude()
    }


def gen_players(amount=5):
    PTYPES = list(dict(Player.TYPES).keys())
    for x in range(amount):
        yield Player(email=fake.email(),
                          password=fake.password(),
                          position=gen_position(),
                          type=choice(PTYPES))
