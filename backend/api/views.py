from django.contrib.auth import views as auth_views


class CustomLogin(auth_views.LoginView):

    next = '/annotation/admin'
