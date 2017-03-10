from django.contrib.auth.models import User
from django.db import models

CHALLENGES_TYPE = (
    ('pj', 'player jugable'),
    ('pnj', 'player no jugable'),
)

class Challenge(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    desc = models.TextField(max_length=1024, blank=True, null=True)
    solution = models.TextField(max_length=1024, blank=True, null=True)
    ctype = models.CharField(max_length=8, choices=CHALLENGES_TYPE, default='pj')
    extra = models.TextField(max_length=1024, blank=True, null=True)

    def __str__(self):
        return self.name


class Game(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    desc = models.TextField(max_length=1024, blank=True, null=True)
    solution = models.TextField(max_length=1024, blank=True, null=True)
    challenges = models.ManyToManyField(Challenge, related_name="games")
    author = models.ForeignKey(User, related_name="games", blank=True, null=True)

    def __str__(self):
        return self.name
