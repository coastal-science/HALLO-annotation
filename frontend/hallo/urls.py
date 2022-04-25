from django.urls import path
from .views import image_view, audio_view

app_name = 'hallo'

urlpatterns = [
    path('image/', image_view),
    path('audio/', audio_view),
] 