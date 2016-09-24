from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^near/', views.near, name="near"),
    url(r'^meeting/', views.meeting_create, name="meeting_create"),
]
