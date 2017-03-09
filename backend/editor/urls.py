from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^game/$', views.edit_game, name="add_game"),
    url(r'^game/(?P<gameid>\d+)/$', views.edit_game, name="edit_game"),
]
