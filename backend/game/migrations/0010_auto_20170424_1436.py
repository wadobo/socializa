# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-04-24 12:36
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0009_auto_20170424_1436'),
    ]

    operations = [
        migrations.AlterField(
            model_name='challenge',
            name='depends',
            field=models.ManyToManyField(blank=True, related_name='requiedby', to='game.Challenge'),
        ),
    ]