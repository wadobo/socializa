# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-23 07:30
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0008_auto_20161006_1610'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='ia',
            field=models.BooleanField(default=False),
        ),
    ]
