from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.editor, name="editor"),

    url(r'^game/$', views.edit_game, name="add_game"),
    url(r'^game/(?P<gameid>\d+)/$', views.edit_game, name="edit_game"),

    url(r'^event/$', views.edit_event, name="add_event"),
    url(r'^event/(?P<evid>\d+)/$', views.edit_event, name="edit_event"),

    url(r'^ajax/player/$', views.ajax_player_search, name="ajax_player_search"),

    url(r'^api/game/(?P<game_id>\d+)/$', views.gameview, name='get_game'),
    url(r'^api/game/$', views.gameview, name='new_game'),
    url(r'^api/games/$', views.gamelist, name='get_games'),

    url(r'^api/ev/(?P<ev_id>\d+)/$', views.evview, name='get_ev'),
    url(r'^api/ev/$', views.evview, name='new_ev'),
]
