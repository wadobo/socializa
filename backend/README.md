# Socializa backend [![Build Status](https://travis-ci.org/wadobo/socializa.svg?branch=master)](https://travis-ci.org/wadobo/socializa) [![Coverage Status](https://coveralls.io/repos/github/wadobo/socializa/badge.svg?branch=master)](https://coveralls.io/github/wadobo/socializa?branch=master)

# Create postgis database

1. install postgresql
2. install postgis

3. Create a postgis database. With postgres user:
    $ psql -c "create user socializa password 'socializa'"
    $ psql -c "create database socializa owner socializa"
    $ psql -d socializa -c "create extension postgis"
    $ psql -c "create database test_socializa owner socializa" # test db
    $ psql -d test_socializa -c "create extension postgis" # test db

# Apply migrations and added world borders

    $ ./manage.py migrate
    $ ./manage.py shell
    shell: from world import load
    shell: load.run()

# For run test

    $ ./manage.py test --keepdb # Maintain the created db, avoid problem with postgis extension

# Permit login with social networks

http://python-social-auth.readthedocs.io/en/latest/backends/index.html
