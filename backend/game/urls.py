from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^(?P<game_id>\d+)/$', views.game, name='get_game'),
]
