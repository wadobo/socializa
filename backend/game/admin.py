from django.contrib import admin

from .models import Challenge
from .models import Game


class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('name', 'desc')


class GameAdmin(admin.ModelAdmin):
    list_display = ('name', 'desc', 'num_challenges')
    filter_horizontal = ('challenges', )


admin.site.register(Challenge, ChallengeAdmin)
admin.site.register(Game, GameAdmin)
