from random import choice

from faker import Faker

from socializa.config import config
from socializa.clue.models import Clue
from socializa.game.models import Game
from socializa.meeting.models import Meeting
from socializa.player.models import Player


GTYPES = list(dict(Game.TYPES).keys())
PTYPES = list(dict(Player.TYPES).keys())

fake = Faker()


def gen_position():
    return {
        'lat': fake.latitude(),
        'lon': fake.longitude()
    }


def gen_place():
    return None


def gen_date_prev(start='-30d', end='today'):
    return fake.date_time_between(start_date=start, end_date=end).strftime(config.DT_FORMAT)


def gen_date_next(start='+1d', end='+30d'):
    return fake.date_time_between(start_date=start, end_date=end).strftime(config.DT_FORMAT)


def gen_data_game():
    return {
        'name': fake.name(),
        'desc': fake.sentence(20),
        'place': None,
        'start': gen_date_prev(),
        'end': gen_date_next(),
        'type': choice(GTYPES)
    }


def gen_players(amount=5):
    for x in range(amount):
        yield Player(email=fake.email(),
                     password=fake.password(),
                     position=gen_position(),
                     type=choice(PTYPES))


def gen_clues(amount=5):
    for x in range(amount):
        yield Clue()


def gen_games(amount=5):
    for x in range(amount):
        data = gen_data_game()
        game = Game(**data)
        yield game


def gen_meetings(amount=5):
    for x in range(amount):
        yield Meeting()
