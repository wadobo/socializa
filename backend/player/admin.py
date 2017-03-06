from django import forms

from django.contrib.gis import admin
from django.contrib.gis.geos import Point

from .models import Meeting
from .models import Player
from .models import PlayerInterests


class MeetingAdmin(admin.ModelAdmin):
    list_display = ('player1', 'player2', 'event_id')


class InterestsInline(admin.TabularInline):
    model = PlayerInterests


class PlayerAdminForm(forms.ModelForm):
    lonlat = forms.CharField(required=False, help_text="-2.6147, 36.7642")

    def save(self, commit=True):
        lonlat = self.cleaned_data.get('lonlat', None)
        if lonlat:
            lon, lat = [float(i) for i in lonlat.split(',')]
            self.instance.pos = Point(lon, lat)
        return super().save(commit=commit)

    class Meta:
        model = Player
        exclude = []


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

    form = PlayerAdminForm


admin.site.register(Meeting, MeetingAdmin)
admin.site.register(Player, PlayerAdmin)
