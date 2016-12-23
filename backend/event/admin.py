from django.contrib import admin

from .models import Event
from .models import Membership


class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'game', 'status', 'price', 'start_date', 'end_date')


class MembershipAdmin(admin.ModelAdmin):
    list_display = ('player', 'event', 'status')


admin.site.register(Event, EventAdmin)
admin.site.register(Membership, MembershipAdmin)
