from django.urls import path
from your_app_name import consumers

websocket_urlpatterns = [
    path('ws/some_path/', consumers.YourConsumer.as_asgi()),
]
