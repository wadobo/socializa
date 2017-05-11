from math import cos, pi, sin, sqrt
from random import SystemRandom
from string import ascii_lowercase, digits

from django.contrib.auth.models import User
from django.contrib.gis.geos import Point

from .models import Player


def create_player(backend, user, *args, **kwargs):
    if backend.name in ["google-oauth2", "facebook"]:
        player, new = Player.objects.get_or_create(user=user)
        if new and player:
            player.save()


def get_random_string(length=32, chars=ascii_lowercase + digits):
    return ''.join([SystemRandom().choice(chars) for i in range(length)])


def get_random_username(length=32, chars=ascii_lowercase + digits):
    username = get_random_string(length=length, chars=chars)
    try:
        User.objects.get(username=username)
        return get_random_username(length=length, chars=chars)
    except User.DoesNotExist:
        return username


def get_random_pos(event):
    """
    Give a coords, a polygon and max_ratio, Generate random position inside
    a polygon or inside circle generated by center and max_ratio.
    """
    poly = event.place
    center = poly.centroid
    CONVERT_RADIUS_IN_DEGREES = 111300
    ratio = event.get_max_ratio() / CONVERT_RADIUS_IN_DEGREES
    w = ratio * sqrt(SystemRandom().random())
    t = 2 * pi * SystemRandom().random()
    x = w * cos(t)

    sum_x = x / cos(center.y)
    sum_y = w * sin(t)
    random_pos = (center.x + sum_x, center.y + sum_y)
    if poly.contains(Point(random_pos)):
        return random_pos
    else:
        return get_random_pos(event)


def create_random_player(event, position='random'):
    user = User.objects.create_user(
        username=get_random_username(),
        password=get_random_string())
    player = Player(user=user, ptype='ai')
    if isinstance(position, Point):
        player.pos = position
    elif position == 'random':
        pos = get_random_pos(event)
        player.set_position(pos[0], pos[1])
    player.save()
    return player
