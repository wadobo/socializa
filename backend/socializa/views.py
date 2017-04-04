from base64 import b64decode
import json
import requests
from django.shortcuts import render
from django.shortcuts import redirect
from django.http import JsonResponse
from django.http import HttpResponse
from django.conf import settings
from django.core.urlresolvers import reverse

from social_django.utils import load_backend, load_strategy
from rest_framework import exceptions
from rest_framework.authtoken.models import Token


def oauth2callback(request):
    if not request.GET:
        return render(request, 'oauth2callback.html')
    else:
        token = request.GET['access_token']
        state = request.GET['state']
        state = json.loads(b64decode(state).decode())

        # TODO manage errors:
        # * no token in the request
        # * no email in the user created

        backend = ''
        if state['app'] == 'google':
            backend = 'google-oauth2'
        elif state['app'] == 'facebook':
            backend = 'facebook'

        strategy = load_strategy(request=request)

        backend = load_backend(strategy, backend, '')

        try:
            user = backend.do_auth(access_token=token)
        except requests.HTTPError as e:
            msg = e.response.text
            raise exceptions.AuthenticationFailed(msg)

        if not user:
            msg = 'Bad credentials.'
            raise exceptions.AuthenticationFailed(msg)

        token, _ = Token.objects.get_or_create(user=user)

        url = state['url'].split('#')[0]
        # don't redirect if phonegap
        if 'file://' in url:
            url = url.split('/')[-1]
            location = '?url=' + url + '&email=' + user.email + '&token=' + token.key
            return redirect(reverse('oauth2redirect') + location)

        return redirect(url + '?email=' + user.email + '&token=' + token.key)


def oauth2redirect(request):
    return HttpResponse("")


def oauth2apps(request):
    data = {
        'google': settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
        'facebook': settings.SOCIAL_AUTH_FACEBOOK_KEY,
        'twitter': settings.SOCIAL_AUTH_TWITTER_KEY,
    }

    return JsonResponse(data)
