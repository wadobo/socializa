# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-07-13 11:21
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0015_auto_20170505_2000'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='price',
            field=models.FloatField(default=0),
        ),
    ]
