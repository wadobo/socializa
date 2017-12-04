import hug
import json
from unittest import TestCase

from socializa.app import app
from socializa.base_db import db, Base
from socializa.config import TestingConfig


class Client:

    def __init__(self, app, base_url='/api', version=''):
        self.app = app
        self.headers = {}
        self.__base_url = base_url + version

    def set_base_url(self, base_url):
        """ Set base_url and put / at start if not exists and remove / at end if exists. """
        if not base_url.startswith("/"):
            base_url = "/" + base_url
        if base_url.endswith("/"):
            base_url = base_url[:-1]
        self.__base_url = base_url

    def set_token(self, response):
        token = response.get('access_token')
        self.headers.update({'authorization': token})

    def revoke_token(self):
        if self.headers.get('authorization'):
            self.headers.pop('authorization')

    def login(self, email='test@wadobo.com', pwd='qwerty'):
        data = {'email': email, 'pwd': pwd}
        response = self.post(self.__base_url + '/player/login/', data)
        self.set_token(response)
        return response

    def logout(self):
        response = self.get(self.__base_url + '/player/logout/')
        self.revoke_token()
        return response

    def get(self, url, body={}):
        return hug.test.get(self.app, self.__base_url + url, body=body, headers=self.headers)

    def post(self, url, body={}):
        return hug.test.post(self.app, self.__base_url + url, body=body, headers=self.headers)

    def put(self, url, body={}):
        return hug.test.put(self.app, self.__base_url + url, body=body, headers=self.headers)

    def delete(self, url, body={}):
        return hug.test.delete(self.app, self.__base_url + url, body=body, headers=self.headers)


class TestBase(TestCase):

    def setUp(self):
        db.init_app(app, TestingConfig.TEST_SQLALCHEMY_DATABASE_URI)
        Base.metadata.create_all(db.engine)
        self.client = Client(app)

    def tearDown(self):
        Base.metadata.drop_all(db.engine)
