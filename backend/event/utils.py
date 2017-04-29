from django.utils import timezone

from clue.utils import attach_clue
from player.utils import create_random_player
from .models import Membership
from .models import PlayingEvent


def manage_ais(event, amount=0):
    now = timezone.now()
    if not event or event.end_date <= now or event.place is None:
        return
    if amount <= 0:
        total_need_players = event.max_players
        current_players = event.players.count()
        need_player = total_need_players - current_players
    else:
        need_player = amount
    if need_player == 0:  # Not changes necessaries
        return
    elif need_player > 0:  # Add some IAs
        while need_player > 0:
            player = create_random_player(event)
            member = Membership(player=player, event=event)
            member.save()
            playing_event = PlayingEvent(event=event, player=player)
            playing_event.save()
            attach_clue(player=player, event=event, main=True)
            need_player -= 1
    else:  # Removed some IAs
        assert "Not work OK. When enter new player, this player should sustitute IA"
