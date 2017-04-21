from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone

import datetime
from random import SystemRandom
from string import ascii_uppercase, digits

from player.models import Player

from oauth2_provider.models import Application, AccessToken
from oauth2client import client, crypt


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


def gplusid(request, token):
    try:
        idinfo = client.verify_id_token(token, None)

        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise crypt.AppIdentityError("Wrong issuer.")


    except crypt.AppIdentityError:
        return JsonResponse({'status': 'nok'})

    email = idinfo['email']
    user, new = User.objects.get_or_create(email=email)
    if new and user:
        user.username = email
        user.save()
    player, new = Player.objects.get_or_create(user=user)
    if new and player:
        player.save()

    chars = ascii_uppercase + digits
    random_token = ''.join([SystemRandom().choice(chars) for i in range(30)])

    app = Application.objects.get(name='google')
    tk = AccessToken.objects.create(user=user, token=random_token,
                               application=app,
                               expires=timezone.now() + datetime.timedelta(days=1),
                               scope='read write')
    tk.save()
    return JsonResponse({'status': 'ok', 'token': random_token, 'email': email})
