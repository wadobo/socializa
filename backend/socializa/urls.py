"""socializa URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import url, include
from django.contrib import admin
from rest_framework.authtoken import views
from rest_framework_swagger.views import get_swagger_view

from .views import oauth2apps, gplusid


schema_view = get_swagger_view(title="Socializa API")

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^docs/', schema_view),
    url(r"^editor/", include("editor.urls")),
    url(r'^api/oauth2apps/$', oauth2apps),
    url(r'^api/gplusid/([\w.]+)/$', gplusid),
    url(r'^api/token/', views.obtain_auth_token),
    url(r"^api/social/", include("rest_framework_social_oauth2.urls")),
    url(r"^api/player/", include("player.urls")),
    url(r"^api/event/", include("event.urls")),
    url(r"^api/clue/", include("clue.urls")),
    url(r'', include("landing.urls")),
]

if 'silk' in settings.INSTALLED_APPS:
    urlpatterns += [url(r'^silk/', include('silk.urls', namespace='silk'))]
