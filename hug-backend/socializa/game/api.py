from datetime import datetime

import hug

from socializa.base_db import db
from socializa.config import config
from socializa.game.models import Game
from socializa.game.serializers import serializer_game


game = hug.http()

@game.post('/')
def create_game(body, response):
    """ Create game """
    game = Game(**body)
    db.session.add(game)
    response.status = hug.HTTP_201
    return {}

@game.get('/{id_game}/')
def retrieve_game(id_game, response):
    """ Retrieve id game """
    game = db.session.query(Game).get(id_game)
    if not game:
        response.status = hug.HTTP_404
    return serializer_game.dump(game).data


@game.put('/{id_game}/')
def update_game(id_game, body, response):
    """ Update id game """
    game = db.session.query(Game).get(id_game)
    if game:
        for param, value in body.items():
            if param in ['start', 'end']:
                value = datetime.strptime(value, config.DT_FORMAT)
            setattr(game, param, value)
    else:
        response.status = hug.HTTP_404
    return


@game.delete('/{id_game}/', status=hug.HTTP_204)
def delete_game(id_game):
    """ Delete id game """
    game = db.session.query(Game).get(id_game)
    db.session.delete(game)
    return {}


@game.get('/')
def get_games(request):
    """ List game """
    if request.params:
        games = db.session.query(Game).filter_by(**request.params)
    else:
        games = db.session.query(Game).all()

    return serializer_game.dump(games, many=True).data
