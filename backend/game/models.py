import re

from django.contrib.auth.models import User
from django.db import models

from common.models import ExtraBase


CHALLENGES_TYPE = (
    ('p', 'playable player'),
    ('np', 'not playable player'),
)


class Challenge(models.Model, ExtraBase):
    name = models.CharField(max_length=200, blank=True, null=True)
    desc = models.TextField(max_length=1024, blank=True, null=True)
    solution = models.TextField(max_length=1024, blank=True, null=True)
    ctype = models.CharField(max_length=8, choices=CHALLENGES_TYPE, default='p')
    extra = models.TextField(max_length=1024, blank=True, null=True)

    # options in extra:
    # {"options":
    #  [
    #   {"type": "text", "question": "who is the killer?"},
    #   {"type": "option", "question": "with which weapon?",
    #    "answers": ["knife", "rope", "gun", "bare hands", "venom"]},
    #   ...
    #  ]
    # }

    depends = models.ManyToManyField('Challenge', related_name="requiedby",
                                     blank=True)

    # challenges to give when resolve this challenge, only if solution is
    # not null and we resolve this
    child_challenges = models.ManyToManyField('Challenge',
                                              related_name="parents",
                                              blank=True)

    def mainclues(self):
        return self.clues.filter(main=True)

    def depends_on(self):
        return ", ".join(i.name for i in self.depends.all())

    def get_desc_html(self):
        # search #[NUM][solution] and return [('NUM', 'solution'), ... ]
        qregex = re.compile("#\[[\d]+\]\[([^#]*)\]")
        desc_html = self.desc[:]
        for sre in qregex.finditer(self.desc):
            ini_pos, end_pos = sre.span()
            rex = self.desc[ini_pos:end_pos]
            solution = sre.group(1)
            desc_html = desc_html.replace(rex, "<b>{}</b>".format(solution))
        return desc_html

    def __str__(self):
        desc = self.desc[:10] if self.desc else "-"
        return "{} - {}...".format(self.name, desc)

    class Meta:
        ordering = ['pk']


class Game(models.Model, ExtraBase):
    name = models.CharField(max_length=200, blank=True, null=True)
    desc = models.TextField(max_length=1024, blank=True, null=True)
    solution = models.TextField(max_length=1024, blank=True, null=True)
    challenges = models.ManyToManyField(Challenge, related_name="games")
    author = models.ForeignKey(User, related_name="games", blank=True, null=True)
    auto_assign_clue = models.BooleanField(default=True)
    visible_players = models.BooleanField(default=True)
    extra = models.TextField(max_length=1024, blank=True, null=True)

    # options in extra:
    # {"options":
    #  [
    #   {"type": "text", "question": "who is the killer?"},
    #   {"type": "option", "question": "with which weapon?",
    #    "answers": ["knife", "rope", "gun", "bare hands", "venom"]},
    #   ...
    #  ]
    # }

    def get_desc_html(self):
        # search #[NUM][type][question] and return [('NUM', 'type', 'question'), ... ]
        qregex = re.compile("#\[[\d]+\]\[(?:option|text)\]\[([^#]*)\]")
        desc_html = self.desc[:]
        for sre in qregex.finditer(self.desc):
            ini_pos, end_pos = sre.span()
            rex = self.desc[ini_pos:end_pos]
            question = sre.group(1)
            desc_html = desc_html.replace(rex, "<b>{}</b>".format(question))
        return desc_html

    def __str__(self):
        return self.name
