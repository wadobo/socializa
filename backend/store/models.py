from django.db import models


class Product(models.Model):
    product_id = models.CharField(max_length=32)
    coins = models.PositiveIntegerField(default=0)
