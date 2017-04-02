from celery import shared_task


@shared_task
def manage_ais_task(event):
    from event.utils import manage_ais

    return manage_ais(event)
