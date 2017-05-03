from django.contrib import admin

from .models import Clue


class ClueAdmin(admin.ModelAdmin):
    list_display = ('player', 'event', 'game', 'challenge', 'status', 'main')
    search_fields = ('player__user__username', 'player__user__email')

    def game(self, obj):
        return obj.event.game


admin.site.register(Clue, ClueAdmin)
