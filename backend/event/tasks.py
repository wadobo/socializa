from celery import shared_task


@shared_task
def manage_ais_task(event_pk):
    from django.shortcuts import get_object_or_404
    from event.models import Event
    from event.utils import manage_ais

    event = get_object_or_404(Event, pk=event_pk)
    return manage_ais(event)
