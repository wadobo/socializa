[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f517680e64c14e428ecb046364efbb48)](https://www.codacy.com/app/virako-9/socializa?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=wadobo/socializa&amp;utm_campaign=Badge_Grade)

### Backend: [![Build Status](https://travis-ci.org/wadobo/socializa.svg?branch=master)](https://travis-ci.org/wadobo/socializa) [![Coverage Status](https://coveralls.io/repos/github/wadobo/socializa/badge.svg?branch=master)](https://coveralls.io/github/wadobo/socializa?branch=master) [![Requirements Status](https://requires.io/github/wadobo/socializa/requirements.svg?branch=master)](https://requires.io/github/wadobo/socializa/requirements/?branch=master) [![sonarqube](https://sonarqube.com/api/badges/gate?key=socializa)](https://sonarqube.com/dashboard/index/socializa)

### Languages:  [![Spanish](/readme/icons/es.png)](/readme/archlinux/es/README.md) [![English](/readme/icons/en.png)](/readme/archlinux/en/README.md)

# Socializa

# Package installation

    1. Pacman
        	$ pacman -S git python postgresql postgis nodejs npm python-celery rabbitmq

    2. Pip
        	$ pip install virtualenv

    3. Npm
        	$ sudo npm install -g bower


# Clone the repository

	$ git clone htts://github.com/wadobo/socializa.git

# Activate virtualenv

	$ source bin/activate

# Postgres configuration

    1. Enable the service to run at system startup

        	$ sudo systemctl enable postgresql

        1.1	In order to get it working in archlinux
            $ sudo -u postgres initdb --locale $LANG -E UTF8 -D '/var/lib/postgres/data'

	2. Start the service postgresql

        $ systemctl start postgresql

    3. Create a postgis database with postgres user

        $ sudo -u postgres psql -c "create user socializa password 'socializa'"
        $ sudo -u postgres psql -c "create database socializa owner socializa"
        $ sudo -u postgres psql -d socializa -c "create extension postgis"
        $ sudo -u postgres psql -c "create database test_socializa owner socializa"
        $ sudo -u postgres psql -d test_socializa -c "create extension postgis"


# Install python dependences

	$ python install -r requirements.txt

# Apply migrations

	$ python manage.py migrate

# Start and enable Rabbitmq service

    $ sudo systemctl enable rabbitmq

    $ sudo systemctl start rabbitmq

# Run Celery

    $ sudo celery -A socializa worker -l info -B -S Django

# Add ip server to settings.py

	ALLOWED_HOSTS = ['server ip']

# Run Django server

	$ python manage.py runserver 0.0.0.0:8000

# Create administrator superuser Django

	$ python manage.py createsuperuser

# Compile frontend (/socializa/frontend/)

	$ make dev

	$ make web

#   Populate database

    $ python manage.py loaddata player/fixtures/player-test.json

	$ python manage.py loaddata event/fixtures/event.json

	$ python manage.py loaddata clue/fixtures/clue.json

# URL socializa-app 

    http://ip_server:8000/static/socializa/index.html
