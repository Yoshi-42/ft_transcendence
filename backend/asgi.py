import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from transcendence.routing import websocket_urlpatterns


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')

django_get_asgi = get_asgi_application()


application = ProtocolTypeRouter({
    "http": django_get_asgi,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
