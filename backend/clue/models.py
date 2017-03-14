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
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="clues")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="clues", default=None)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name="clues")
    main = models.BooleanField(default=False)
    status = models.CharField(max_length=16, choices=CLUE_STATUS, default='acquired')
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return '<%s - %s - %s>' % (self.player, self.event, self.challenge)
