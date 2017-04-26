from django.test import Client
from oauth2_provider.models import Application
from requests.auth import _basic_auth_str


class JClient(Client):
    def __init__(self, *args, **kwargs):
        self.auth_token = ''
        super(JClient, self).__init__(*args, **kwargs)

    def set_auth_token(self, response):
        json_res = response.json()
        token_type = json_res.get('token_type')
        access_token = json_res.get('access_token')
        self.auth_token = "%s %s" % (token_type, access_token)

    def authenticate(self, email, password):
        app = Application.objects.get(name='Twitter')
        data = {
                "client_id": app.client_id,
                "grant_type": "password",
                "username": email,
                "password": password
        }
        response = self.post('/api/social/token/', data)
        if response.status_code == 200:
            self.set_auth_token(response)
        return response

    def get(self, url, data):
        return super(JClient, self).get(url, data, HTTP_AUTHORIZATION=self.auth_token)

    def post(self, url, data):
        return super(JClient, self).post(url, data, HTTP_AUTHORIZATION=self.auth_token)

    def put(self, url, data):
        return super(JClient, self).put(url, data, HTTP_AUTHORIZATION=self.auth_token)

    def delete(self, url, data):
        return super(JClient, self).delete(url, data,
                content_type="application/json", HTTP_AUTHORIZATION=self.auth_token)
