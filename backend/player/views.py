from django.contrib.auth.decorators import login_required
from django.contrib.gis.measure import D
from django.http import JsonResponse
from django.views.generic import View

from .models import Player


class PlayersNear(View):

    NEAR_DISTANCE = 5 # km

    def get(self, request):
        ctx = {}
        player = request.user.player
        if player.pos:
            near_players = Player.objects.filter(pos__distance_lte=(player.pos, D(km=self.NEAR_DISTANCE))).exclude(pk=player.pk)
            ctx['players'] = [player.serialize() for player in near_players]
        else:
            ctx['players'] = []
        return JsonResponse(ctx)

near = login_required(PlayersNear.as_view())


class Meeting(View):

    MEETING_DISTANCE = 10 # m

    def post(self, request, pk):
        player1 = request.user.player
        is_near = Player.objects.filter(pk=pk, pos__distance_lte=(player.pos, D(m=self.MEETING_DISTANCE)))
        if is_near:
            meeting = Meeting(player1=player1, player2=is_near.first())
            meeting.save()
            return "Meeting created"
        else:
            return "User is far for meeting"

meeting_create = login_required(PlayersNear.as_view())
