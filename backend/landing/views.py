from event.models import Event
from django.views.generic import TemplateView
from django.utils import timezone
from django.shortcuts import redirect
from django.contrib import messages
from django.utils.translation import ugettext as _
from django.core.mail import mail_admins


class LandingView(TemplateView):
    template_name = 'landing/index.html'

    def get_context_data(self, *args, **kwargs):
        ctx = super().get_context_data(*args, **kwargs)
        events = Event.objects.filter(end_date__gte=timezone.now())
        ctx['events'] = events
        return ctx

    def post(self, request):
        action = request.POST.get('action', '')
        if not action:
            messages.error(request, _("Unknown error"))
            return redirect('landing')

        if action == 'beta':
            subject = '[Socializa] Beta tester request'
            message = 'email: %(email)s' % request.POST

        elif action == 'contact':
            subject = '[Socializa] Contact form'
            message = '''
from: %(name)s <%(email)s>

message:

%(msg)s
            ''' % request.POST

        mail_admins(subject, message)

        messages.info(request, _("Thank you!, we'll contact you as soon as possible"))
        return redirect('landing')

landing = LandingView.as_view()
