from django.contrib import admin

from .models import WorldBorder


class WorldBorderAdmin(admin.ModelAdmin):
    pass


admin.site.register(WorldBorder, WorldBorderAdmin)
