from decimal import Decimal
from django.db import models

from game.models import Game
from player.models import Player
from world.models import WorldBorder


class Event(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    world = models.ForeignKey(WorldBorder, on_delete=models.CASCADE, related_name="world",
            blank=True, null=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    max_players = models.PositiveIntegerField(default=10)
    price = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    game = models.ForeignKey(Game, related_name="events", null=True)
    players = models.ManyToManyField(Player, through="Membership")

    def __str__(self):
        return "{0} [{1}/{2}]".format(self.name, self.players.count(), self.max_players)


MEMBERSHIP_STATUS = (
        ('registered', 'registered'),
        ('paying', 'paying'),
        ('payed', 'payed'),
        ('cancelled', 'cancelled'),
)

class Membership(models.Model):
    player = models.ForeignKey(Player)
    event = models.ForeignKey(Event)
    status = models.CharField(max_length=16, choices=MEMBERSHIP_STATUS, default='registered')
