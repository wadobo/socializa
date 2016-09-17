# Create postgis database

1. install postgresql
2. install postgis

3. Create a postgis database:
    $ createuser -P socializa
    $ createdb socializa -O socializa
4. $ psql socializa
    > CREATE EXTENSION postgis;

# Apply migrations and added world borders

    $ ./manage.py migrate
    $ ./manage.py shell
    shell: from world import load
    shell: load.run()

# Permit login with social networks

http://python-social-auth.readthedocs.io/en/latest/backends/index.html
