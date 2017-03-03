# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-03 02:24
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0010_playingevent'),
    ]

    operations = [
        migrations.AlterField(
            model_name='playingevent',
            name='event',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='playing_event', to='event.Event'),
        ),
    ]
