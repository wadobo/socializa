import json

from django.test import Client
from oauth2_provider.models import Application


class BaseClient(Client):
    def __init__(self, base_url='/api', version='', *args, **kwargs):
        self.auth_token = ''
        self.base_url = base_url
        self.version = '/v{0}'.format(version)
        super().__init__(*args, **kwargs)

    def set_auth_token(self, response):
        json_res = response.json()
        token_type = json_res.get('token_type')
        access_token = json_res.get('access_token')
        self.auth_token = '%s %s' % (token_type, access_token)

    def authenticate(self, email, password):
        app = Application.objects.get(name='local')
        data = {
            'client_id': app.client_id,
            'grant_type': 'password',
            'username': email,
            'password': password
        }
        response = self.post('/social/token/', data)
        if response.status_code == 200:
            self.set_auth_token(response)
        return response

    def logout(self):
        self.auth_token = ''

    def get(self, url):
        return super().get(self.base_url + self.version + url,
                           content_type='application/json',
                           HTTP_AUTHORIZATION=self.auth_token)

    def post(self, url, data={}):
        return super().post(self.base_url + self.version + url,
                            json.dumps(data),
                            content_type='application/json',
                            HTTP_AUTHORIZATION=self.auth_token)

    def put(self, url, data={}):
        return super().put(self.base_url + self.version + url,
                           json.dumps(data),
                           content_type='application/json',
                           HTTP_AUTHORIZATION=self.auth_token)

    def delete(self, url, data={}):
        return super().delete(self.base_url + self.version + url,
                              json.dumps(data),
                              content_type='application/json',
                              HTTP_AUTHORIZATION=self.auth_token)
