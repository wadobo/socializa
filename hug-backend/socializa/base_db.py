import hug
from sqlalchemy import create_engine, orm
from sqlalchemy.ext.declarative import declarative_base


class SQLAlchemy:
    def __init__(self, autocommit=False):
        self.engine = None
        self.session = None
        self._conn_str = None
        self._autocommit = autocommit

    def connect(self, expire_on_commit=True):
        sm = orm.sessionmaker(bind=self.engine, autoflush=True,
                              autocommit=self._autocommit,
                              expire_on_commit=expire_on_commit)
        self.session = orm.scoped_session(sm)

    def close(self):
        self.session.flush()
        self.session.close()
        self.session.remove()

    def init_app(self, app, conn_str):
        self._conn_str = conn_str
        self.engine = create_engine(self._conn_str)

        @hug.request_middleware(api=app)
        def process_data(request, response):
            self.connect()

        @hug.response_middleware(api=app)
        def process_data(request, response, resource):
            self.close()

        return app

Base = declarative_base()
db = SQLAlchemy(autocommit=True)
