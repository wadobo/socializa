import re
from django.db.models import Q

from player.utils import create_random_player
from .models import Clue
from .serializers import ClueSerializer


def possible_solutions(player, event):
    game = event.game
    challenges = game.challenges.all()
    clues = Clue.objects.filter(player=player, challenge__in=challenges).order_by('created')

    # REGEX GAME
    qregex_game = re.compile("(?#)\[([\d]+)\]\[(option|text)\]\[([^#]*)\]")
    game_desc = game.desc
    questions = qregex_game.findall(game_desc)
    res = list({} for i in range(len(questions)))
    for question in questions:
        num, qtype, quest = question
        num = int(num) - 1
        answer = [] if qtype == "option" else None
        res[num].update({"type": qtype, "question": quest, "answers": answer})

    # REGEX CHALLENGES
    qregex_challenge = re.compile("(?#)\[([\d]+)\]\[([^#]*)\]")
    for clue in clues:
        cha_desc = clue.challenge.desc
        for solution in qregex_challenge.findall(cha_desc):
            num, sol = solution
            num = int(num) - 1
            if num < len(res) and res[num].get("type") == "option":
                res[num]["answers"].append(sol)

    return res


def attach_clue(player, event):
    challenges = event.game.challenges.all()
    clues = event.clues.filter(main=True)
    challenges_attach_pks = clues.values_list('challenge__pk', flat=True)

    if challenges.count() > clues.count():
        avail_challenge = challenges.exclude(pk__in=challenges_attach_pks).first()
        clue = Clue(player=player, challenge=avail_challenge, main=True, event=event)
        clue.save()
    elif clues.filter(player__ptype='ai').exists() and player.ptype != 'ai':
        clue = clues.filter(player__ptype='ai').first()
        playerAI = clue.player
        clue.player = player
        clue.save()
        playerAI.delete()
    elif event.max_players > len(clues):
        random_challenge = challenges.order_by('?').first()
        clue = Clue(player=player, challenge=random_challenge, main=True, event=event)
        clue.save()
    else:
        print("max player")


def get_position_ai(player, event):
    if player.pos:
        if event.place and not event.place.contains(player.pos):
            pos = 'random'
        else:
            pos = player.pos
    else:
        pos = 'random' if event.place else None
    return pos


def detach_clues(player, event, main=True):
    game = event.game
    challenges = game.challenges.all()
    query = Q(player=player, challenge__in=challenges, event=event)
    if not main or main == 'all':
        extra_query = Q(main=False)
        Clue.objects.filter(query & extra_query).delete()
    if main:
        extra_query = Q(main=True)
        clues = Clue.objects.filter(query & extra_query)
        if clues:
            pos = get_position_ai(player, event)
            playerAI = create_random_player(event, position=pos)
            for clue in clues:
                clue.player = playerAI
                clue.save()


def transfer_clues(player, old_event, new_event):
    if new_event and new_event.game.auto_assign_clue and player.associate_ai:
        playerAI = player.associate_ai
        for clue in playerAI.clues.filter(main=True):
            clue.player = player
            clue.save()
        playerAI.delete()
    if old_event and old_event.game.auto_assign_clue:
        pos = get_position_ai(player, old_event)
        playerAI = create_random_player(old_event, position=pos)
        for clue in player.clues.filter(main=True):
            clue.player = playerAI
            clue.save()
        player.associate_ai = playerAI
        player.save()

