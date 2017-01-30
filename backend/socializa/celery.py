import os
from celery import Celery
from celery.schedules import crontab
from celery.task import PeriodicTask
from datetime import timedelta


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


@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(20.0, test.s(), name='add every 10')


class ManageIA(PeriodicTask):
    run_every = timedelta(seconds=10)

    def run(self, **kwargs):
        from event.tasks import manage_ia
        manage_ia()


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))