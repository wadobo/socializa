# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-15 08:05
from __future__ import unicode_literals

from django.db import migrations

DROP_WORLD_TABLES = """\
    DROP TABLE IF EXISTS world_worldborder CASCADE;
"""

class Migration(migrations.Migration):

    dependencies = [
        ('event', '0011_auto_20170303_0224'),
    ]

    operations = [
        migrations.RunSQL(DROP_WORLD_TABLES)
    ]
