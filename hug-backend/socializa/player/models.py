from datetime import datetime
from geoalchemy2 import Geometry
from passlib.hash import bcrypt
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy_utils import ChoiceType

from socializa.base_db import Base


class Player(Base):
    TYPES = [
        ('ai', 'ai'),
        ('actor', 'actor'),
        ('human', 'human'),
    ]

    __tablename__ = 'player'
    email = Column(String(128), primary_key=True)
    password = Column(String(300), nullable=False)
    position = Column(Geometry(geometry_type='POINT', srid=4326))
    type = Column(ChoiceType(TYPES), default='human')
    created = Column(DateTime, default=datetime.utcnow)

    def __init__(self, email, password, position=None, type='human'):
        self.email = email
        self.password = bcrypt.encrypt(password)
        self.position = self.convert_position(position)
        self.type = type

    @staticmethod
    def convert_position(position):
        """ Convert {lat: xx, lon: yy} in a valid str postition for save in db. """
        if position and isinstance(position, dict) and sorted(position.keys()) == ['lat', 'lon']:
            lat = position['lat']
            lon = position['lon']
            return 'SRID=4326;POINT({0} {1})'.format(lat, lon)
        else:
            return None

    def validate_password(self, password):
        return bcrypt.verify(self.password, password)
