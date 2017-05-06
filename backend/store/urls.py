from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^products/$', views.GetProducts.as_view(), name='products'),
    url(r'^check-purchase/$', views.CheckPurchase.as_view(), name='check_purchase'),
]
