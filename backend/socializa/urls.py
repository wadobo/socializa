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
from rest_framework.schemas import get_schema_view
from rest_framework_swagger.renderers import OpenAPIRenderer, SwaggerUIRenderer

from .views import oauth2apps, gplusid


schema_url_patterns = [
    url(r"^player/", include("player.urls")),
    url(r"^event/", include("event.urls")),
    url(r"^clue/", include("clue.urls")),
    url(r"^store/", include("store.urls")),
]

schema_view_v1 = get_schema_view(
        title="Socializa API V1",
        description="API versions: <a href='/docs/v1/'>V1</a> <a href='/docs/v2/'>V2 (latest)</a></p>",
        url="/api/v1",
        urlconf='socializa.urls',
        patterns=schema_url_patterns,
	renderer_classes=[OpenAPIRenderer, SwaggerUIRenderer]
)

schema_view_v2 = get_schema_view(
        title="Socializa API V2",
        description="API versions: <a href='/docs/v1/'>V1</a> <a href='/docs/v2/'>V2 (latest)</a></p>",
        url="/api/v2",
        urlconf='socializa.urls',
        patterns=schema_url_patterns,
	renderer_classes=[OpenAPIRenderer, SwaggerUIRenderer]
)

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^accounts/', include('django.contrib.auth.urls')),
    url(r'^docs/$', schema_view_v1),
    url(r'^docs/v1/', schema_view_v1),
    url(r'^docs/v2/', schema_view_v2),
    url(r"^editor/", include("editor.urls")),
    url(r'^api/oauth2apps/$', oauth2apps),
    url(r'^api/gplusid/$', gplusid),
    url(r'^api/token/', views.obtain_auth_token),
    url(r"^api/social/", include("rest_framework_social_oauth2.urls")),
    url(r"^api/player/", include("player.urls", namespace='v1')),
    url(r"^api/v1/player/", include("player.urls", namespace='v1')),
    url(r"^api/v2/player/", include("player.urls", namespace='v2')),
    url(r"^api/event/", include("event.urls", namespace='v1')),
    url(r"^api/v1/event/", include("event.urls", namespace='v1')),
    url(r"^api/v2/event/", include("event.urls", namespace='v2')),
    url(r"^api/clue/", include("clue.urls", namespace='v1')),
    url(r"^api/v1/clue/", include("clue.urls", namespace='v1')),
    url(r"^api/v2/clue/", include("clue.urls", namespace='v2')),
    url(r"^api/store/", include("store.urls", namespace='v1')),
    url(r"^api/v1/store/", include("store.urls", namespace='v1')),
    url(r"^api/v2/store/", include("store.urls", namespace='v2')),
    url(r'', include("landing.urls")),
]

if 'silk' in settings.INSTALLED_APPS:
    urlpatterns += [url(r'^silk/', include('silk.urls', namespace='silk'))]
