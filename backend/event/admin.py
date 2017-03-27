from django.contrib.gis import admin
from django.contrib.gis.geos import Point

from .models import Event
from .models import Membership
from .models import PlayingEvent


class EventAdmin(admin.OSMGeoAdmin):
    list_display = ('name', 'game', 'status', 'price', 'start_date', 'end_date')
    # Center in Spain
    default_zoom = 6
    pnt = Point(-4, 40, srid=4326)
    pnt.transform(3857)  # tranform to google SRID
    default_lon, default_lat = pnt.coords
    # Map size
    map_width = 800
    map_height = 600


class MembershipAdmin(admin.ModelAdmin):
    list_display = ('player', 'event', 'status')


class PlayingEventAdmin(admin.ModelAdmin):
    list_display = ('player', 'event')


admin.site.register(Event, EventAdmin)
admin.site.register(Membership, MembershipAdmin)
admin.site.register(PlayingEvent, PlayingEventAdmin)
