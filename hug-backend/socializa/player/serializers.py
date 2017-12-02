from geoalchemy2 import Geometry
from marshmallow import fields
from marshmallow import pre_load
from marshmallow_sqlalchemy import ModelConverter
from marshmallow_sqlalchemy import ModelSchema
from marshmallow_sqlalchemy import field_for
from shapely import wkb

from socializa import config
from socializa.base_db import db
from socializa.player.models import Player


class PlayerSchema(ModelSchema):
    position = fields.Method("get_position")
    type = fields.Method("get_type")
    created = fields.Method("get_created")

    class Meta:
        model = Player
        fields = ('email', 'position', 'type', 'created')

    def get_position(self, obj):
        """ Convert wkb in (lat, lon). """
        pos = wkb.loads(obj.position.desc, hex=True)
        return (pos.x, pos.y)

    def get_type(self, obj):
        return obj.type.value

    def get_created(self, obj):
        return obj.created.strftime(config.DT_FORMAT)


serializer_player = PlayerSchema()
