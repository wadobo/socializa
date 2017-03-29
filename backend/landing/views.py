from event.models import Event
from django.views.generic import TemplateView
from django.utils import timezone


class LandingView(TemplateView):
    template_name = 'landing/index.html'

    def get_context_data(self, *args, **kwargs):
        ctx = super().get_context_data(*args, **kwargs)
        events = Event.objects.filter(end_date__gte=timezone.now())
        ctx['events'] = events
        return ctx
landing = LandingView.as_view()
