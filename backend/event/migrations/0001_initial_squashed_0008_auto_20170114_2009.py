# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-15 08:03
from __future__ import unicode_literals

from decimal import Decimal
import django.contrib.gis.db.models.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    replaces = [('event', '0001_initial'), ('event', '0002_event_game'), ('event', '0003_auto_20161005_2231'), ('event', '0004_event_max_ratio_km'), ('event', '0005_auto_20161223_0730'), ('event', '0006_event_pos'), ('event', '0007_auto_20161223_1138'), ('event', '0008_auto_20170114_2009')]

    dependencies = [
        ('player', '0006_remove_player_events'),
        ('game', '0002_auto_20161005_0750'),
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=200, null=True)),
                ('start_date', models.DateTimeField(blank=True, null=True)),
                ('end_date', models.DateTimeField(blank=True, null=True)),
                ('max_players', models.PositiveIntegerField(default=10)),
                ('price', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=5)),
                ('game', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='events', to='game.Game')),
            ],
        ),
        migrations.CreateModel(
            name='Membership',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('registered', 'registered'), ('paying', 'paying'), ('payed', 'payed'), ('cancelled', 'cancelled')], default='registered', max_length=16)),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='event.Event')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='player.Player')),
            ],
        ),
        migrations.AddField(
            model_name='event',
            name='players',
            field=models.ManyToManyField(through='event.Membership', to='player.Player'),
        ),
        migrations.AddField(
            model_name='event',
            name='meeting_distance',
            field=models.PositiveIntegerField(blank=True, default=10, help_text='max meeting ditance in m', null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='place',
            field=django.contrib.gis.db.models.fields.MultiPolygonField(blank=True, null=True, srid=4326),
        ),
        migrations.AddField(
            model_name='event',
            name='vision_distance',
            field=models.PositiveIntegerField(blank=True, default=1000, help_text='max vision ditance in m', null=True),
        ),
    ]