import os
from datetime import timedelta
from celery import Celery
from celery.task import PeriodicTask


# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'socializa.settings')

app = Celery('socializa')

# Using a string here means the worker don't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()


class ManageIA(PeriodicTask):
    run_every = timedelta(seconds=10)

    @classmethod
    def run(cls, **kwargs):
        pass


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
