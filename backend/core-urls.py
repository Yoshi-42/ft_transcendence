from django.urls import path
from .views import SignUpView, SignInView, UserDetailView, UserUpdateView, IncrementGamesPlayedView, IncrementWinsView, IncrementLossesView

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('signin/', SignInView.as_view(), name='signin'),
    path('user/', UserDetailView.as_view(), name='user_detail'),
    path('user/update/', UserUpdateView.as_view(), name='user_update'),
    path('user/increment_games_played/', IncrementGamesPlayedView.as_view(), name='increment_games_played'),
    path('user/increment_wins/', IncrementWinsView.as_view(), name='increment_wins'),
    path('user/increment_losses/', IncrementLossesView.as_view(), name='increment_losses'),
]