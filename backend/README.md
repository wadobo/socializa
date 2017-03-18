# Socializa backend [![Build Status](https://travis-ci.org/wadobo/socializa.svg?branch=master)](https://travis-ci.org/wadobo/socializa) [![Coverage Status](https://coveralls.io/repos/github/wadobo/socializa/badge.svg?branch=master)](https://coveralls.io/github/wadobo/socializa?branch=master) [![Requirements Status](https://requires.io/github/wadobo/socializa/requirements.svg?branch=master)](https://requires.io/github/wadobo/socializa/requirements/?branch=master) [![Quality Gate](https://sonarqube.com/api/badges/gate?key=socializa)](https://sonarqube.com/dashboard/index/socializa)

# Create postgis database

1. install postgresql
2. install postgis

3. Create a postgis database. With postgres user

    $ psql -c "create user socializa password 'socializa'"
    $ psql -c "create database socializa owner socializa"
    $ psql -d socializa -c "create extension postgis"
    $ psql -c "create database test_socializa owner socializa" # test db
    $ psql -d test_socializa -c "create extension postgis" # test db

# Others dependencies and problems

    P: If when you install with pip psycopg2, your get: error: Setup script exited with error: command 'x86_64-linux-gnu-gcc' failed with exit status 1
    S: sudo apt-get install build-essential python3-dev libpq-dev libxml2-dev libxslt1-dev libldap2-dev libsasl2-dev libffi-dev

    P: ImportError: cannot import name 'GDALRaster'
    S: sudo apt-get install libgdal-dev

# Apply migrations

    $ ./manage.py migrate

# Added fixtures

    $ ./manage.py loaddata editor/fixtures/group.json

# Install rabbitmq-server and run celery

    $ sudo apt-get install rabbitmq-server
    $ celery -A socializa worker -l info -B -S Django

# For run test

    $ ./manage.py test --keepdb # Maintain the created db, avoid problem with postgis extension

# Permit login with social networks

http://python-social-auth.readthedocs.io/en/latest/backends/index.html


# Generate graphical overview of your project or specified apps

    $ pip install -r requirements-dev.txt
    $ vim socializa/settings.py # change DEV to True
    $ ./manage.py graph_models --pydot event game clue player -g -o output.png  # selected apps
    $ # OR
    $ ./manage.py graph_models --pydot -a -g -o output.png  # all apps
