from django.utils.translation import ugettext as _
from django.views.generic.base import TemplateView
from django.contrib.auth.decorators import user_passes_test
from django.shortcuts import get_object_or_404
from django.shortcuts import redirect
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
            return self.edit(request, gameid)
        messages.error(request, _("Not implemented yet!"))
        return redirect('add_game')

edit_game = is_editor(EditGame.as_view())
