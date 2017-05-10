from django.core.management.base import BaseCommand

from oauth2_provider.models import Application
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Creates default Apps for social authentication'

    def handle(self, *args, **options):
        apps = ['local', 'facebook', 'google']

        for app in apps:
            a, created = Application.objects.get_or_create(name=app)
            if created:
                a.user = User.objects.all()[0]
                a.redirect_uris = 'http://wadobo.com'
                a.client_type = 'public'
                if app == 'local':
                    a.authorization_grant_type = 'password'
                else:
                    a.authorization_grant_type = 'authorization-code'
                a.save()
