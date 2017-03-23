from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^join/(?P<event_id>\d+)/$', views.join_event, name='join_event'),
    url(r'^unjoin/(?P<event_id>\d+)/$', views.unjoin_event, name="unjoin_event"),
    url(r'^my-events/$', views.my_events, name="my_events"),
    url(r'^all/$', views.all_events, name="all_events"),
    url(r'^(?P<event_id>\d+)?/$', views.event_detail, name="event_detail"),
    url(r'^current/(?P<event_id>\d+)?/$', views.current_event, name="current_event"),
    url(r'^solve/(?P<event_id>\d+)/$', views.solve_event, name='solve_event'),

    url(r'^admin/challenges/(?P<event_id>\d+)/$',
        views.admin_event_challenges, name='admin_event_challenges'),
    url(r'^admin/(?P<event_id>\d+)/$',
        views.admin_event_update, name='admin_event_update'),
]
