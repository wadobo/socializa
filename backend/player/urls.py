from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^near/', views.near, name="near"),
]
