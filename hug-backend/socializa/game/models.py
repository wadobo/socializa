from datetime import datetime

from geoalchemy2 import Geometry
from passlib.hash import bcrypt
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import relationship
from sqlalchemy_utils import ChoiceType

from socializa.base_db import Base
from socializa.config import config
from socializa.player.models import Player


class Game(Base):
    TYPES = [
        ('public', 'public'),
        ('private', 'private'),
    ]

    __tablename__ = 'game'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True)
    name = Column(String(300), nullable=False)
    desc = Column(String(2048))
    place = Column(Geometry(geometry_type='MULTIPOLYGON', srid=4326))
    start = Column(DateTime, default=datetime.utcnow)
    end = Column(DateTime, default=None)
    type = Column(ChoiceType(TYPES), default='public')

    owners = relationship('Owner', backref='games') # Una tabla nueva de Owners: many2many
    # clues: backref in Clue model
    # preference: backref in Preference model
    # meetings

    def __init__(self, name, desc, place, start=datetime.utcnow, end=None, type='public'):
        self.name = name
        self.desc = desc
        self.place = place
        if isinstance(start, datetime):
            self.start = start
        else:
            self.start = datetime.strptime(start, config.DT_FORMAT)
        if isinstance(end, datetime):
            self.end = end
        else:
            self.end = datetime.strptime(end, config.DT_FORMAT)
        self.type = type


class Owner(Base):
    __tablename__ = 'owner'
    id_game = Column(Integer, ForeignKey(Game.id), primary_key=True)
    id_player = Column(String, ForeignKey(Player.email), primary_key=True)

