from django.contrib.auth.models import User
from django.db import models

CHALLENGES_TYPE = (
    ('p', 'playable player'),
    ('np', 'not playable player'),
)

class Challenge(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    desc = models.TextField(max_length=1024, blank=True, null=True)
    solution = models.TextField(max_length=1024, blank=True, null=True)
    ctype = models.CharField(max_length=8, choices=CHALLENGES_TYPE, default='p')
    extra = models.TextField(max_length=1024, blank=True, null=True)

    depends = models.ManyToManyField('Challenge', related_name="requiedby")

    def mainclues(self):
        return self.clues.filter(main=True)

    def depends_on(self):
        return ", ".join(i.name for i in self.depends.all())

    def __str__(self):
        return self.name


class Game(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    desc = models.TextField(max_length=1024, blank=True, null=True)
    solution = models.TextField(max_length=1024, blank=True, null=True)
    challenges = models.ManyToManyField(Challenge, related_name="games")
    author = models.ForeignKey(User, related_name="games", blank=True, null=True)
    auto_assign_clue = models.BooleanField(default=True)
    visible_players = models.BooleanField(default=True)

    def __str__(self):
        return self.name
