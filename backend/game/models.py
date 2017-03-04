from django.db import models


class Challenge(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    desc = models.TextField(max_length=1024, blank=True, null=True)
    solution = models.TextField(max_length=1024, blank=True, null=True)

    def __str__(self):
        return self.name


class Game(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    desc = models.TextField(max_length=1024, blank=True, null=True)
    solution = models.TextField(max_length=1024, blank=True, null=True)
    challenges = models.ManyToManyField(Challenge, related_name="games") 

    def __str__(self):
        return self.name
