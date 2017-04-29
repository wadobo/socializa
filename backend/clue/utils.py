import re
from django.db.models import Q

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


def attach_clue(player, event, main=True):
    game = event.game
    challenges = game.challenges.all()
    challenges_attach = Clue.objects.filter(challenge__in=challenges, main=main).\
            values_list('challenge__pk', flat=True)
    challenges = game.challenges.exclude(pk__in=challenges_attach)
    avail_challenges = challenges.exclude(pk__in=challenges_attach)

    if avail_challenges:
        clue = Clue(player=player, challenge=avail_challenges[0], main=main, event=event)
        clue.save()


def detach_clue(player, event, main=True):
    game = event.game
    challenges = game.challenges.all()
    query = Q(player=player, challenge__in=challenges, event=event)
    if main != 'all':
        query &= Q(main=main)
    clue = Clue.objects.filter(query)
    if clue:
        clue.delete()


