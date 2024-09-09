from django.urls import path
from .views import SignUpView, SignInView, UserDetailView, UserUpdateView, IncrementGamesPlayedView, IncrementWinsView, IncrementLossesView, OAuthLogin, forty_two_login, forty_two_callback

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('signin/', SignInView.as_view(), name='signin'),
    path('user/', UserDetailView.as_view(), name='user_detail'),
    path('user/update/', UserUpdateView.as_view(), name='user_update'),
    path('user/increment_games_played/', IncrementGamesPlayedView.as_view(), name='increment_games_played'),
    path('user/increment_wins/', IncrementWinsView.as_view(), name='increment_wins'),
    path('user/increment_losses/', IncrementLossesView.as_view(), name='increment_losses'),
#     path('oauth/login/42/', OAuthLogin.as_view(), name='oauth_login'),
#     path('auth/callback/', views.oauth_callback, name='oauth_callback'),
    path('42/login/', forty_two_login, name='forty_two_login'),
    path('42/callback/', forty_two_callback, name='forty_two_callback'),
]