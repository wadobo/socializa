from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^my-clues/(?P<game_id>\d+)/$', views.my_clues, name="my_clues"),
    url(r'^solve/(?P<clue_id>\d+)/$', views.solve_clue, name='solve_clue'),
]
