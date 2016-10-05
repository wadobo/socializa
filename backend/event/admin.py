from django.contrib import admin

from .models import Event
from .models import Membership


class EventAdmin(admin.ModelAdmin):
    pass


class MembershipAdmin(admin.ModelAdmin):
    pass


admin.site.register(Event, EventAdmin)
admin.site.register(Membership, MembershipAdmin)
