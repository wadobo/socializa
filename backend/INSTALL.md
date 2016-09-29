# Create postgis database

1. install postgresql
2. install postgis

3. Create a postgis database:
    $ createuser -P socializa
    $ createdb socializa -O socializa
    # For test
    $ createdb test_socializa -O socializa
4. $ psql socializa
    > CREATE EXTENSION postgis;
5. $ psql test_socializa
    > CREATE EXTENSION postgis;
    > ALTER USER socializa CREATEDB;

# Apply migrations and added world borders

    $ ./manage.py migrate
    # for test
    $ ./manage.py migrate --database test
    $ ./manage.py shell
    shell: from world import load
    shell: load.run()

# For run test

    $ ./manage.py test --keepdb # Maintain the created db, avoid problem with postgis extension

# Permit login with social networks

http://python-social-auth.readthedocs.io/en/latest/backends/index.html
