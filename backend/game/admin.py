from django.contrib import admin

from .models import Challenge
from .models import Game


class GameInline(admin.TabularInline):
    model = Challenge.games.through


class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('name', 'desc', 'solution', 'childs', 'type', 'depend')
    filter_horizontal = ('depends', 'child_challenges')

    list_filter = ('ctype', 'games')
    inlines = [GameInline]

    search_fields = ('name', 'desc')

    def depend(self, obj):
        return ', '.join(i.name for i in obj.depends.all())

    def childs(self, obj):
        return ', '.join(i.name for i in obj.child_challenges.all())

    def type(self, obj):
        return obj.ctype

class GameAdmin(admin.ModelAdmin):
    list_display = ('name', 'desc', 'solution', 'author',
                    'auto_assign_clue', 'visible_players')
    filter_horizontal = ('challenges', )

    search_fields = ('name', 'desc')


admin.site.register(Challenge, ChallengeAdmin)
admin.site.register(Game, GameAdmin)
