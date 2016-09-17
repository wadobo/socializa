from .models import Player


def create_player(backend, user, response, *args, **kwargs):
    player = Player.objects.get_or_create(user=user)
    if not player:
        player = Player(user=user)
        player.save()
