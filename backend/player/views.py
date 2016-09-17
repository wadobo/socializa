from django.contrib.auth.decorators import login_required
from django.contrib.gis.measure import D
from django.http import JsonResponse
from django.views.generic import View

from .models import Player


class PlayersNear(View):

    NEAR_DISTANCE = 5 # km

    def get(self, request):
        ctx = {}
        my_pos = request.user.player.pos
        if my_pos:
            near_players = Player.objects.filter(pos__distance_gte=(my_pos, D(km=self.NEAR_DISTANCE)))
            ctx['players'] = [player.serialize for player in near_players]
        else:
            ctx['players'] = []
        return JsonResponse(ctx)

near = login_required(PlayersNear.as_view())
