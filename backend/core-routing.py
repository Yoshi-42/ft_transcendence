from django.urls import path
from core import consumers

websocket_urlpatterns = [
    path('ws/connection/(?P<connection_id>\w+)/$', consumers.GameConsumer.as_asgi()),
]

