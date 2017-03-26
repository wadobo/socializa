import json
from django.utils.dateparse import parse_datetime
from django.utils.translation import ugettext as _
from django.views.generic.base import TemplateView, View
from django.contrib.auth.decorators import user_passes_test
from django.contrib.gis.geos import GEOSGeometry
from django.shortcuts import get_object_or_404
from django.shortcuts import render, redirect
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from game.models import Game, Challenge
from event.models import Event

from player.serializers import PlayerSerializer
from player.models import Player, User

from clue.models import Clue


def is_editor(user):
    return not user.is_anonymous() and (belong_editor_group(user) or user.is_superuser)
is_editor = user_passes_test(is_editor, login_url='/admin/login/')


def belong_editor_group(user):
    return user.groups.filter(name='editor').exists()


class EditGame(TemplateView):
    template_name = 'editor/edit_game.html'

    @classmethod
    def parse_input(cls, request):
        data = request.POST
        game = {
            "name": data.get("game_name", ""),
            "desc": data.get("game_desc", ""),
            "solution": data.get("game_solution", ""),
            "visible_players": bool(data.get("game_visible_players", False)),
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

    def set_depends(self, depends, game):
        '''
        Assign dependencies between challenges.
        depends is a list of pairs, challenge, other challenges names.

        Dependencies of challenges are in the same game
        '''

        for ch, deps in depends:
            if not deps:
                continue

            ch.depends.clear()
            for d in deps.split(","):
                d = d.strip()
                if not d:
                    continue
                c = game.challenges.get(name__iexact=d)
                ch.depends.add(c)

    def update_challenges(self, game, challenges):
        depends = []
        num_challenge = 0
        for cha in challenges:
            cha_title = cha.get('challenge_name')
            cha_desc = cha.get('challenge_desc')
            cha_solution = cha.get('challenge_solution')
            cha_type = cha.get('challenge_type')
            cha_extra = cha.get('challenge_extra')
            cha_depends = cha.get('challenge_depends_on')

            created = False
            if game.challenges.count() > num_challenge:
                ch = game.challenges.order_by('pk')[num_challenge]
            else:
                ch = Challenge()
                created = True

            ch.name = cha_title
            ch.desc = cha_desc
            ch.solution = cha_solution
            ch.ctype = cha_type
            ch.extra = cha_extra
            ch.save()

            depends.append((ch, cha_depends))

            if created:
                game.challenges.add(ch)
                game.save()

            num_challenge += 1

        self.set_depends(depends, game)

    def remove_challenge(self, game, chid):
        ch = game.challenges.get(pk=chid)
        ch.games.remove(game)
        if not ch.games.count():
            ch.delete()

    def update_game(self, game, data):
        if not game:
            game = Game()

        game.name = data['name']
        game.desc = data['desc']
        game.solution = data['solution']
        game.visible_players = data['visible_players']
        game.save()

        return game

    def post(self, request, gameid=None):
        game = None

        if gameid:
            game = get_object_or_404(Game, pk=gameid)
            if game.author != request.user:
                messages.error(request, _("Unauthorized user"))
                return render(request, self.template_name, {}, status=401)

        if 'rmchallenge' in request.POST:
            chid = request.POST.get('rmchallenge', '')
            self.remove_challenge(game, chid)
            messages.info(request, _("Challenge removed correctly"))
            return redirect('edit_game', gameid=game.id)

        data = self.parse_input(request)
        game = self.update_game(game, data)
        self.update_challenges(game, data['challenges'])

        if gameid:
            messages.info(request, _("Updated game"))
        else:
            messages.info(request, _("Created game with {0} challenges".format(game.challenges.count())))

        return redirect('edit_game', gameid=game.id)

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

        return redirect('event_challenges', event.id)

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

    template_name = 'editor/event_challenges.html'

    def get_context_data(self, evid):
        ctx = super().get_context_data()
        ev = get_object_or_404(Event, pk=evid)
        cs = ev.game.challenges.all()
        ctx['ev'] = ev
        ctx['players'] = cs.filter(ctype='p')
        actors = cs.filter(ctype='np')

        # getting assigned information
        for c in actors:
            clue = c.mainclues().first()
            if clue:
                p = clue.player
                if p.pos:
                    c.pos = "%s, %s" % (p.pos.y, p.pos.x)
                c.actor = p
                c.ptype = p.ptype
                c.assigned = True

        ctx['actors'] = actors
        return ctx

    @classmethod
    def parse_input(cls, request):
        data = request.POST
        cs = [(k, v) for k, v in data.items() if k.startswith("challenge_")]

        d = {}
        for k, v in cs:
            attr, n = k.rsplit("_", 1)
            if not n in d:
                d[n] = {}
            d[n].update({attr: v})

        return d

    def update_ai(self, c, event, options):
        pos = options['challenge_pos']
        lat, lon = map(float, pos.split(','))

        clue = c.mainclues().first()
        if not clue:
            username = 'ai_' + User.objects.make_random_password(length=8)
            newu = User(username=username)
            newu.save()
            p = Player(user=newu, ptype='ai')
            p.save()

            clue = Clue(player=p, event=event, challenge=c, main=True)
            clue.save()

        clue.player.set_position(lon, lat)

    def update_actor(self, c, event, options):
        username = options['challenge_player']

        clue = c.mainclues().first()
        if not clue:
            clue = Clue(event=event, challenge=c, main=True)

        if username != clue.player:
            newu, created = User.objects.get_or_create(username=username)
            if created:
                pw = User.objects.make_random_password(length=8)
                newu.set_password(pw)
                newu.save()
                p = Player(user=newu, ptype='actor')
                p.extra = pw
                p.save()

            clue.player = newu.player
            clue.save()

    def post(self, request, evid):
        event = get_object_or_404(Event, pk=evid)
        if not request.user.pk in event.owners.values_list('pk', flat=True):
            messages.error(request, _("Unauthorized user"))
            return render(request, self.template_name, {}, status=401)

        data = self.parse_input(request)

        for cid, options in data.items():
            c = Challenge.objects.get(pk=cid)
            if options['challenge_type'] == 'ai':
                self.update_ai(c, event, options)
            elif options['challenge_type'] == 'actor':
                self.update_actor(c, event, options)

        return redirect('event_challenges', evid=evid)
event_challenges = is_editor(EventChallenges.as_view())


class AjaxPlayerSearch(View):
    def post(self, request):
        q = request.POST.get('q', '')
        if not q or len(q) < 3:
            return JsonResponse([], safe=False)

        players = Player.objects.filter(user__username__startswith=q)
        serializer = PlayerSerializer(players, many=True)
        data = serializer.data
        return JsonResponse(data, safe=False)
ajax_player_search = csrf_exempt(is_editor(AjaxPlayerSearch.as_view()))


class Editor(TemplateView):
    template_name = 'editor/editor.html'

    def get_context_data(self):
        ctx = super().get_context_data()
        ctx['games'] = self.request.user.games.all()
        ctx['events'] = self.request.user.events.all()
        return ctx
editor = is_editor(Editor.as_view())
