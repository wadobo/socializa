[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f517680e64c14e428ecb046364efbb48)](https://www.codacy.com/app/virako-9/socializa?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=wadobo/socializa&amp;utm_campaign=Badge_Grade)

### Backend: [![Build Status](https://travis-ci.org/wadobo/socializa.svg?branch=master)](https://travis-ci.org/wadobo/socializa) [![Coverage Status](https://coveralls.io/repos/github/wadobo/socializa/badge.svg?branch=master)](https://coveralls.io/github/wadobo/socializa?branch=master) [![Requirements Status](https://requires.io/github/wadobo/socializa/requirements.svg?branch=master)](https://requires.io/github/wadobo/socializa/requirements/?branch=master) [![sonarqube](https://sonarqube.com/api/badges/gate?key=socializa)](https://sonarqube.com/dashboard/index/socializa)

### Idiomas:  [![Spanish](/readme/icons/es.png)](/readme/archlinux/es/README.md) [![English](/readme/icons/en.png)](/readme/archlinux/en/README.md)

# Socializa

# Instalación de paquetes

    1. Pacman
        	$ pacman -S git python postgresql postgis nodejs npm python-celery rabbitmq

    2. Pip
        	$ pip install virtualenv

    3. Npm
        	$ sudo npm install -g bower


# Clonar el repositorio

	$ git clone htts://github.com/wadobo/socializa.git

# Activar el virtualenv

	$ source bin/activate

# Configuración de Postgres

    1. Activar el servicio para que se ejecute al inicio

        	$ sudo systemctl enable postgresql

        1.1	Para el correcto funcionamiento en ArchLinux

            $ sudo -u postgres initdb --locale $LANG -E UTF8 -D '/var/lib/postgres/data'

	2. Arrancar el servicio

        $ systemctl start postgresql

    3. Creación de la base de datos Postgis con el usuario postgres

        $ sudo -u postgres psql -c "create user socializa password 'socializa'"
        $ sudo -u postgres psql -c "create database socializa owner socializa"
        $ sudo -u postgres psql -d socializa -c "create extension postgis"
        $ sudo -u postgres psql -c "create database test_socializa owner socializa"
        $ sudo -u postgres psql -d test_socializa -c "create extension postgis"


# Instalar dependencias python

	$ python install -r requirements.txt

# Aplicamos migraciones

	$ python manage.py migrate

# Rabbitmq

    $ sudo systemctl enable rabbitmq

    $ sudo systemctl start rabbitmq

# Celery

    $ sudo celery -A socializa worker -l info -B -S Django

# Añadir ip del servidor al settings.py si no se va a usar en local

	ALLOWED_HOSTS = ['ip del servidor']

# Ejecutar el servidor Django (Para acceder desde otra máquina)

	$ python manage.py runserver 0.0.0.0:8000

# Crear superusuario de administración de Django 

	$ python manage.py createsuperuser

# Compilar frontend (/socializa/frontend/)

	$ make dev

	$ make web

# Poblar base de datos

    $ python manage.py loaddata player/fixtures/player-test.json

	$ python manage.py loaddata event/fixtures/event.json

	$ python manage.py loaddata clue/fixtures/clue.json

# URL socializa-app 

    http://ip_server:8000/static/socializa/index.html
