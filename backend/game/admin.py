from django.contrib import admin

from .models import Challenge
from .models import Game


class ChallengeAdmin(admin.ModelAdmin):
    pass


class GameAdmin(admin.ModelAdmin):
    filter_horizontal = ('challenges', )


admin.site.register(Challenge, ChallengeAdmin)
admin.site.register(Game, GameAdmin)
