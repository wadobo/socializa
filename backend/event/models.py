from decimal import Decimal
from django.db import models

from world.models import WorldBorder


class Event(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    world = models.ForeignKey(WorldBorder, on_delete=models.CASCADE, related_name="world",
            blank=True, null=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    max_players = models.PositiveIntegerField(default=10)
    price = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))

    def __str__(self):
        return self.name
