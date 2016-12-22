from django.contrib import admin

from .models import Clue


class ClueAdmin(admin.ModelAdmin):
    list_display = ('player', 'challenge', 'status', 'main')


admin.site.register(Clue, ClueAdmin)
