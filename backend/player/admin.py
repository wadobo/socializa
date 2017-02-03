from django.contrib.gis import admin
from django.contrib.gis.geos import Point

from .models import Meeting
from .models import Player
from .models import PlayerInterests


class MeetingAdmin(admin.ModelAdmin):
    list_display = ('player1', 'player2', 'event_id')


class InterestsInline(admin.TabularInline):
    model = PlayerInterests


class PlayerAdmin(admin.OSMGeoAdmin):
    inlines = [InterestsInline]

    list_display = ('user', 'get_coords')
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
