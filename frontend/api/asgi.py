"""
ASGI config for api project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "api.settings")

import django
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import file.routing
from .middleware import TokenAuthMiddleware


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddleware(
        URLRouter(
            file.routing.websocket_urlpatterns
        )
    ),
})
