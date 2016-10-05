from django.contrib.gis import admin
from django.contrib.gis.geos import Point

from .models import Meeting
from .models import Player


class MeetingAdmin(admin.ModelAdmin):
    pass


class PlayerAdmin(admin.OSMGeoAdmin):
    # Center in Spain
    default_zoom = 6
    pnt = Point(-4, 40, srid=4326)
    pnt.transform(3857) # tranform to google SRID
    default_lon, default_lat = pnt.coords
    # Map size
    map_width = 800
    map_height = 600


admin.site.register(Meeting, MeetingAdmin)
admin.site.register(Player, PlayerAdmin)
