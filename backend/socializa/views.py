from django.http import JsonResponse
from django.conf import settings

from oauth2_provider.models import Application


def oauth2apps(request):
    data = {}

    apps = Application.objects.all()
    for app in apps:
        data[app.name] = { 'id': app.client_id }
        if app.name == 'google':
            data[app.name]['oauth'] = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
            data[app.name]['apikey'] = settings.GOOGLE_APIKEY
        if app.name == 'facebook':
            data[app.name]['oauth'] = settings.SOCIAL_AUTH_FACEBOOK_KEY

    return JsonResponse(data)
