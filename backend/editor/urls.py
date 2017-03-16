from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^game/$', views.edit_game, name="add_game"),
    url(r'^game/(?P<gameid>\d+)/$', views.edit_game, name="edit_game"),

    url(r'^event/$', views.edit_event, name="add_event"),
    url(r'^event/(?P<evid>\d+)/$', views.edit_event, name="edit_event"),
    url(r'^event/challenges/(?P<evid>\d+)/$', views.event_challenges, name="event_challenges"),

    url(r'^ajax/player/$', views.ajax_player_search, name="ajax_player_search"),
]
