import requests
from django.shortcuts import render
from django.shortcuts import redirect
from django.http import JsonResponse
from django.http import HttpResponse
from django.conf import settings
from django.core.urlresolvers import reverse

from rest_framework.decorators import api_view, renderer_classes

from social_django.utils import load_backend, load_strategy
from rest_framework import exceptions
from rest_framework.authtoken.models import Token


def oauth2callback(request):
    if not request.GET:
        return render(request, 'oauth2callback.html')
    else:
        token = request.GET['access_token']
        state = request.GET['state']
        backend = 'google-oauth2'

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

        token, created = Token.objects.get_or_create(user=user)

        state = state.split('/')[-1]
        location = '?url=' + state + '&email=' + user.email + '&token=' + token.key
        return redirect(reverse('oauth2redirect') + location)


def oauth2redirect(request):
    return HttpResponse("")


def oauth2apps(request):
    data = {
        'google': settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
        'facebook': settings.SOCIAL_AUTH_FACEBOOK_KEY,
        'twitter': settings.SOCIAL_AUTH_TWITTER_KEY,
    }

    return JsonResponse(data)
