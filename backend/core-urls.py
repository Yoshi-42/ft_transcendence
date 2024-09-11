from django.urls import path
from .views import SignUpView, SignInView, UserDetailView, UserUpdateView, IncrementGamesPlayedView, IncrementWinsView, IncrementLossesView, VerifyOTPView, LeaderboardView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('signin/', SignInView.as_view(), name='signin'),
    path('user/', UserDetailView.as_view(), name='user_detail'),
    path('user/update/', UserUpdateView.as_view(), name='user_update'),
    path('user/increment_games_played/', IncrementGamesPlayedView.as_view(), name='increment_games_played'),
    path('user/increment_wins/', IncrementWinsView.as_view(), name='increment_wins'),
    path('user/increment_losses/', IncrementLossesView.as_view(), name='increment_losses'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), #peut-etre qu'il faudra degager le api/
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]