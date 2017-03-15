import json
from django.utils.dateparse import parse_datetime
from django.utils.translation import ugettext as _
from django.views.generic.base import TemplateView
from django.contrib.auth.decorators import user_passes_test
from django.contrib.gis.geos import GEOSGeometry
from django.shortcuts import get_object_or_404
from django.shortcuts import render
from django.contrib import messages

from game.models import Game
from event.models import Event


def is_editor(user):
    # TODO: change this in the future, when other users can use the editor,
    # currently only staff users can, but in the future we can open this to
    # users with the group "editor" for example.
    return (not user.is_anonymous()) and user.is_staff
is_editor = user_passes_test(is_editor, login_url='/admin/login/')


class EditGame(TemplateView):
    template_name = 'editor/edit_game.html'

    @classmethod
    def parse_input(cls, request):
        data = request.POST
        game = {
            "name": data.get("game_name", ""),
            "desc": data.get("game_desc", ""),
            "solution": data.get("game_solution", ""),
            "challenges": []
        }

        cs = [(k, v) for k, v in data.items() if k.startswith("challenge_")]

        d = {}
        for k, v in cs:
            attr, n = k.rsplit("_", 1)
            if not n in d:
                d[n] = {}
            d[n].update({attr: v})

        game["challenges"] = [d.get(k) for k in sorted(list(d.keys())) if d[k].get('challenge_name')]
        return game

    def get_context_data(self, gameid=None):
        ctx = super().get_context_data(gameid=gameid)
        if gameid:
            game = get_object_or_404(Game, pk=gameid)
            ctx['game'] = game
            ctx['n'] = game.challenges.count()
        else:
            ctx['n'] = 0
        return ctx

    def post(self, request, gameid=None):
        if gameid:
            game = get_object_or_404(Game, pk=gameid)
            if game.author != request.user:
                messages.error(request, _("Unauthorized user"))
                return render(request, self.template_name, {}, status=401)

        data = self.parse_input(request)

        title = data.get('name')
        desc = data.get('desc')
        solution = data.get('solution')
        challenges = data.get('challenges')

        if gameid:
            game.name = title
            game.desc = desc
            game.solution = solution
            game.save()
        else:
            game = Game(name=title, desc=desc, solution=solution)
            game.save()

        num_challenge = 0
        for cha in challenges:
            cha_title = cha.get('challenge_name')
            cha_desc = cha.get('challenge_desc')
            cha_solution = cha.get('challenge_solution')
            cha_type = cha.get('challenge_type')
            cha_extra = cha.get('challenge_extra')

            if gameid and game.challenges.count() > num_challenge:
                challenge = game.challenges.order_by('pk')[num_challenge]
                challenge.name = cha_title
                challenge.desc = cha_desc
                challenge.solution = cha_solution
                challenge.ctype = cha_type
                challenge.extra = cha_extra
                challenge.save()
            else:
                game.challenges.create(name=cha_title, desc=cha_desc, solution=cha_solution)
                game.save()
            num_challenge += 1

        if gameid:
            messages.info(request, _("Updated game"))
            status = 200
        else:
            messages.info(request, _("Created game with {0} challenges".format(game.challenges.count())))
            status = 201

        return render(request, self.template_name, {}, status=status)

    def delete(self, request, gameid):
        game = get_object_or_404(Game, pk=gameid)
        if game.author == request.user:
            name = game.name
            game.challenges.all().delete()
            game.delete()
            messages.info(request, _("Deleted game: {0}".format(name)))
            status = 200
        else:
            messages.error(request, _("Unauthorized user"))
            status = 401
        return render(request, self.template_name, {}, status=status)

edit_game = is_editor(EditGame.as_view())


class EditEvent(TemplateView):
    template_name = 'editor/edit_event.html'

    def get_context_data(self, evid=None):
        ctx = super().get_context_data(evid=evid)
        if evid:
            ev = get_object_or_404(Event, pk=evid)
            ctx['ev'] = ev

        # TODO, paginate this or show by ajax, in the future we can't show
        # all games in one page if there's a lot.
        ctx['games'] = Game.objects.all()
        return ctx

    def post(self, request, evid=None):
        if evid:
            event = get_object_or_404(Event, pk=evid)
            if not request.user.pk in event.owners.values_list('pk', flat=True):
                messages.error(request, _("Unauthorized user"))
                return render(request, self.template_name, {}, status=401)

        data = request.POST

        _name = data.get('ev_name')
        _price = data.get('ev_price')
        _max_players = data.get('ev_max_players')
        _vision_distance = data.get('ev_vision_distance')
        _meeting_distance = data.get('ev_meeting_distance')
        _start_date = data.get('ev_start_date', None)
        _start_date = parse_datetime(_start_date)
        _end_date = data.get('ev_end_date', None)
        _end_date = parse_datetime(_end_date)
        _place = data.get('ev_place', None)
        if _place:
            _place = json.loads(_place)
        _place = GEOSGeometry(_place.get('geometry').__str__()) if _place else None
        _game = data.get('ev_game')

        game = get_object_or_404(Game, pk=_game)

        if evid:
            event.name = _name
            event.place = _place
            event.start_date = _start_date
            event.end_date = _end_date
            event.max_players = _max_players
            event.price = _price
            event.game = game
            event.vision_distance = _vision_distance
            event.meeting_distance = _meeting_distance
            event.save()
        else:
            event = Event(name=_name,
                          place=_place,
                          start_date=_start_date,
                          end_date=_end_date,
                          max_players=_max_players,
                          price=_price,
                          game=game,
                          vision_distance=_vision_distance,
                          meeting_distance=_meeting_distance)
            event.save()

        event.owners.add(request.user)
        event.save()

        if evid:
            messages.info(request, _("Updated event"))
            status = 200
        else:
            messages.info(request, _("Created event."))
            status = 201

        return render(request, self.template_name, {}, status=status)

    def delete(self, request, evid):
        event = get_object_or_404(Event, pk=evid)
        if request.user in event.owners.all():
            name = event.name
            # remove actors
            # TODO
            # remove event
            event.delete()
            messages.info(request, _("Deleted event: {0}".format(name)))
            status = 200
        else:
            messages.error(request, _("Unauthorized user"))
            status = 401
        return render(request, self.template_name, {}, status=status)
edit_event = is_editor(EditEvent.as_view())


class EventChallenges(TemplateView):
    '''
    View to assign challenges to players/actors or positions in the map
    '''

    def get_context_data(self, evid):
        ctx = super().get_context_data()
        ev = get_object_or_404(Event, pk=evid)
        cs = ev.game.challenges.all()
        ctx['ev'] = ev
        ctx['players'] = cs.filter(ctype='p')
        ctx['actors'] = cs.filter(ctype='np')
        return ctx

    template_name = 'editor/event_challenges.html'
event_challenges = is_editor(EventChallenges.as_view())
