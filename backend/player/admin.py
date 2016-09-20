from django.contrib import admin

from .models import Meeting
from .models import Player


class MeetingAdmin(admin.ModelAdmin):
    pass


class PlayerAdmin(admin.ModelAdmin):
    pass


admin.site.register(Meeting, MeetingAdmin)
admin.site.register(Player, PlayerAdmin)
