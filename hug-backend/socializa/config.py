import logging
import os


class BaseConfig:
    APP_DIR = os.path.abspath(os.path.dirname(__file__))
    PROJECT_ROOT = os.path.abspath(os.path.join(APP_DIR, os.pardir))
    SECRET_KEY = 'SECRET_KEY'
    DT_FORMAT = "%H:%M %d-%m-%Y"


class DevelopmentConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///db.sqlite3'


class ProductionConfig(BaseConfig):
    POSTGRES = {
        'user': 'hugsocializa',
        'pwd': 'hugsocializa',
        'db': 'hugsocializa',
        'host': 'localhost',
        'port': '5432',
    }
    SQLALCHEMY_DATABASE_URI = 'postgresql://{user}:{pwd}@{host}:{port}/{db}'.format(**POSTGRES)


class TestingConfig(BaseConfig):
    logging.getLogger('passlib').setLevel(logging.CRITICAL)
    logging.getLogger('shapely').setLevel(logging.CRITICAL)
    POSTGRES = {
        'user': 'test_hugsocializa',
        'pwd': 'test_hugsocializa',
        'db': 'test_hugsocializa',
        'host': 'localhost',
        'port': '5432',
    }
    TEST_SQLALCHEMY_DATABASE_URI = 'postgresql://{user}:{pwd}@{host}:{port}/{db}'.format(**POSTGRES)


config = ProductionConfig


try:
    from local_config import *
except ImportError:
    print('No local config found')
    pass
