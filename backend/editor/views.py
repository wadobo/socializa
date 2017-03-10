from django.utils.translation import ugettext as _
from django.views.generic.base import TemplateView
from django.contrib.auth.decorators import user_passes_test
from django.shortcuts import get_object_or_404
from django.shortcuts import redirect
from django.shortcuts import render
from django.contrib import messages

from game.models import Game


def is_editor(user):
    # TODO: change this in the future, when other users can use the editor,
    # currently only staff users can, but in the future we can open this to
    # users with the group "editor" for example.
    return (not user.is_anonymous()) and user.is_staff
is_editor = user_passes_test(is_editor, login_url='/admin/login/')


class EditGame(TemplateView):
    template_name = 'editor/edit_game.html'

    def parse_input(self, request):
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

        game["challenges"] = [d.get(k) for k in sorted(list(d.keys()))]
        return game

    def get_context_data(self, gameid=None):
        ctx = super().get_context_data(gameid=gameid)
        if gameid:
            ctx['game'] = get_object_or_404(Game, pk=gameid)
            ctx['n'] = ctx['game'].challenges.count()
        else:
            ctx['n'] = 0
        return ctx

    def edit(self, request, gameid):
        messages.warning(request, _("Not implemented yet!"))
        return redirect('add_game')

    def post(self, request, gameid=None):
        if gameid:
            game = get_object_or_404(Game, pk=gameid)
            if game.author != request.user:
                messages.error(request, _("Unauthorized user"))
                return render(request, self.template_name, {}, status=401)

        data = self.parse_input(request)

        title = data.get('title')
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
            cha_title = cha.get('challenge_title')
            cha_desc = cha.get('challenge_desc')
            cha_solution = cha.get('challenge_solution')
            if gameid and game.challenges.count() > num_challenge:
                challenge = game.challenges.order_by('pk')[num_challenge]
                challenge.name = cha_title
                challenge.desc = cha_desc
                challenge.solution = cha_solution
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
