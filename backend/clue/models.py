from django.db import models

from event.models import Event
from game.models import Challenge
from player.models import Player


CLUE_STATUS = (
        ('acquired', 'acquired'),
        ('solved', 'solved'),
        ('lost', 'lost'),
)


class Clue(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="player")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="event", default=None)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name="challenge")
    main = models.BooleanField(default=False)
    status = models.CharField(max_length=16, choices=CLUE_STATUS, default='acquired')
