from django.urls import path

from . import views


urlpatterns = [
    path('', views.PlayerListCreate.as_view(), name="player_list"),
    path('<int:pk>/', views.PlayerDetail.as_view(), name="player_detail"),
]

