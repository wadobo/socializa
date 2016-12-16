from .models import Player


def create_player(backend, user, response, *args, **kwargs):
    if backend.name == "google-oauth2":
        player, new = Player.objects.get_or_create(user=user)
        if new and player:
            player.save()
    elif backend.name == "facebook":
        pass
    elif backend.name == "twitter":
        pass
