import hug
import os

from socializa.config import config
from socializa.base_db import Base, db
from socializa.player import api as player_api
from socializa.player.models import Player


app = hug.API(__name__)
# TODO: get args for run dev or pro
db.init_app(app, config.SQLALCHEMY_DATABASE_URI)


# DATABASE
#Base.metadata.drop_all(db.engine)
#Base.metadata.create_all(db.engine)

#from faker import Faker
#from random import choice
#fake = Faker()
#
#PTYPES = list(dict(Player.TYPES).keys())
#db.connect()
#for x in range(10):
#    position = {'lat': fake.latitude(), 'lon': fake.longitude()}
#    player = Player(email=fake.email(), password=fake.password(), position=position,
#            type=choice(PTYPES))
#    db.session.add(player)
#db.close()


@hug.extend_api('/api/player')
def extend_api():
    return [player_api]
