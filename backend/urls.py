"""transcendence URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from core.health_check import health_check
#from core.game_views import game_views
from core import game_views

urlpatterns = [
    #path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('api/', include('core.urls')),
    
    
    path('api/game/create/', game_views.CreateGameView.as_view(), name='create_game'),
    path('api/game/join/', game_views.JoinGameView.as_view(), name='join_game'),
    path('api/game/status/<str:game_code>/', game_views.GameStatusView.as_view(), name='game_status'),
]
