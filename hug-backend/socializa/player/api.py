import hug

from socializa.base_db import db
from socializa.player.models import Player
from socializa.player.serializers import serializer_player


player = hug.http()

@player.post('/')
def create_players(body, response):
    """ Create player """
    player = Player(**body)
    db.session.add(player)
    response.status = hug.HTTP_201
    return {}

@player.get('/{pk_email}/')
def retrieve_player(pk_email, response):
    """ Retrieve email player """
    player = db.session.query(Player).get(pk_email)
    if not player:
        response.status = hug.HTTP_404
    return serializer_player.dump(player).data


@player.put('/{pk_email}/')
def update_player(pk_email, body, response):
    """ Update email player """
    player = db.session.query(Player).get(pk_email)
    if player:
        for param, value in body.items():
            setattr(player, param, value)
    else:
        response.status = hug.HTTP_404
    return


@player.delete('/{pk_email}/', status=hug.HTTP_204)
def delete_player(pk_email):
    """ Delete email player """
    player = db.session.query(Player).get(pk_email)
    db.session.delete(player)
    return {}


@player.get('/')
def get_players(request):
    """ List player """
    if request.params:
        players = db.session.query(Player).filter_by(**request.params)
    else:
        players = db.session.query(Player).all()

    return serializer_player.dump(players, many=True).data
