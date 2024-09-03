from django.urls import path
from .views import SignUpView, SignInView, UserDetailView, UserUpdateView, IncrementGamesPlayedView, IncrementWinsView, IncrementLossesView
from core import game_views


urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('signin/', SignInView.as_view(), name='signin'),
    path('user/', UserDetailView.as_view(), name='user_detail'),
    path('user/update/', UserUpdateView.as_view(), name='user_update'),
    path('user/increment_games_played/', IncrementGamesPlayedView.as_view(), name='increment_games_played'),
    path('user/increment_wins/', IncrementWinsView.as_view(), name='increment_wins'),
    path('user/increment_losses/', IncrementLossesView.as_view(), name='increment_losses'),
    
    
    
    path('game/create/', game_views.CreateGameView.as_view(), name='create_game'),
    path('game/join/', game_views.JoinGameView.as_view(), name='join_game'),
    path('game/status/<str:game_code>/', game_views.GameStatusView.as_view(), name='game_status'),
]
