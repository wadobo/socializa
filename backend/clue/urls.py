from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^my-clues/(?P<game_id>\d+)/$', views.my_clues, name="my_clues"),
]
