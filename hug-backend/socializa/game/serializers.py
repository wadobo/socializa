from geoalchemy2 import Geometry
from marshmallow import fields
from marshmallow import pre_load
from marshmallow_sqlalchemy import ModelConverter
from marshmallow_sqlalchemy import ModelSchema
from marshmallow_sqlalchemy import field_for
from shapely import wkb

from socializa.config import config
from socializa.base_db import db
from socializa.game.models import Game


class GameSchema(ModelSchema):
    place = fields.Method("get_place")
    start = fields.Method("get_start")
    end = fields.Method("get_end")
    type = fields.Method("get_type")

    class Meta:
        model = Game
        fields = ('name', 'desc', 'place', 'start', 'end', 'type')

    def get_place(self, obj):
        """ Convert wkb in place coord: [(lat, lon), ] """
        res = None
        if obj.place:
            pos = wkb.loads(obj.position.desc, hex=True)
            res = (pos.x, pos.y)
        return res

    def get_start(self, obj):
        return obj.start.strftime(config.DT_FORMAT)

    def get_end(self, obj):
        return obj.end.strftime(config.DT_FORMAT)

    def get_type(self, obj):
        return obj.type.value


serializer_game = GameSchema()
