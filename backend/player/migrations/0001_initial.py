# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-03-14 13:45
from __future__ import unicode_literals

from django.conf import settings
import django.contrib.gis.db.models.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Meeting',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_id', models.IntegerField(blank=True, default=None, null=True)),
                ('status', models.CharField(choices=[('connected', 'connected'), ('step1', 'step1'), ('step2', 'step2'), ('waiting', 'waiting')], default='connected', max_length=16)),
                ('secret', models.CharField(blank=True, default=None, max_length=16, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pos', django.contrib.gis.db.models.fields.PointField(blank=True, null=True, srid=4326)),
                ('ptype', models.CharField(choices=[('ai', 'AI'), ('actor', 'actor'), ('player', 'player')], default='player', max_length=16)),
                ('about', models.TextField(blank=True, null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='player', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='PlayerInterests',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=100)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interests', to='player.Player')),
            ],
        ),
        migrations.AddField(
            model_name='meeting',
            name='player1',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player1', to='player.Player'),
        ),
        migrations.AddField(
            model_name='meeting',
            name='player2',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player2', to='player.Player'),
        ),
    ]
