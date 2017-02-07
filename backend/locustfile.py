import json
from random import choice

from locust import HttpLocust, TaskSet, task


HOST = "http://localhost:8000"


class DefIndex(TaskSet):
    """ Check access to static index page. """

    @task
    def index(self):
        self.client.get("/static/socializa/index.html")


class DefConnections(TaskSet):
    """ Check login and call to api for change position. """

    def on_start(self):
        with open('data/users.json') as f:
            self.users = json.loads(f.read())
        rand_user = choice(self.users)
        user = rand_user.get('user')
        pwd = rand_user.get('password')
        # Authenticate
        response = self.authenticate(user, pwd)
        if not response.status_code == 200:
            return -1
        # Get auth_token
        self.token = "Token {0}".format(response.json().get('token'))

    def on_quit(self):
        self.client = None

    def authenticate(self, user, password):
        data = {
            "grant_type": "password",
            "username": user,
            "password": password
        }
        return self.client.post('/api/token/', data)

    @task
    def connection(self):
        """ Call to set position. """
        data = {
            "lat": "37.26037320000002",
            "lon": "-6.926291000000001"
        }
        headers = {'Authorization': self.token}
        response = self.client.post("/api/player/set-pos/", data, headers=headers)
        if not response.status_code == 200:
            return -1


class Main(HttpLocust):
    host = HOST
    min_wait = 100
    max_wait = 1000


class Index(Main):
    task_set = DefIndex


class Connections(Main):
    task_set = DefConnections
