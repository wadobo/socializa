from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^near/$', views.near, name='near'),
    url(r'^meeting/(?P<pk>\d+)/$', views.meeting_create, name="meeting_create"),
    url(r'^set-pos/$', views.set_position, name="set_position"),
]
