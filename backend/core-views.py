from django.conf import settings
from django.contrib.auth import authenticate ,get_user_model, authenticate, login
from django.contrib.auth.models import User
from django.core.cache import cache
from django.db.models import F
from .leaderboard import LeaderboardView
from django.http import JsonResponse
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
import logging
from .models import CustomUser
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework import status
import requests
from .serializers import UserSerializer
from .utils import send_otp
from urllib.parse import urlencode
import urllib.parse
import os
from rest_framework.parsers import MultiPartParser, FormParser

User = get_user_model()
logger = logging.getLogger(__name__)



class FortyTwoLoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        base_url = "https://api.intra.42.fr/oauth/authorize"
        params = {
            'client_id': 'u-s4t2ud-3f8d76fb565ae2c8b49b3e5a004b06c8508fc22af3ef603d001f7adce5e277e1',
            'redirect_uri': 'http://localhost:8000/api/42/callback/',
            'response_type': 'code',
        }
        url = f"{base_url}?{urllib.parse.urlencode(params)}"
        print(url)
        return redirect(url)

class FortyTwoCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get('code')
        return self.handle_callback(code)

    def post(self, request):
        code = request.data.get('code')
        return self.handle_callback(code)

    def handle_callback(self, code):
        token_url = "https://api.intra.42.fr/oauth/token"
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': 'u-s4t2ud-3f8d76fb565ae2c8b49b3e5a004b06c8508fc22af3ef603d001f7adce5e277e1',
            'client_secret': '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',
            'code': code,
            'redirect_uri': 'http://localhost:8000/api/42/callback/',
        }

        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        access_token = token_json.get('access_token')

        user_info_url = "https://api.intra.42.fr/v2/me"
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        user_info_response = requests.get(user_info_url, headers=headers)
        user_info = user_info_response.json()

        username = user_info['login']
        email = user_info['email']
        first_name = user_info['first_name']
        last_name = user_info['last_name']

        user, created = CustomUser.objects.get_or_create(username=username)

        if created:
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # response = HttpResponseRedirect('http://0.0.0.0')
        # response.set_cookie('access_token', access_token, httponly=True)
        # response.set_cookie('refresh_token', refresh_token, httponly=True)
        # response = redirect('http://0.0.0.0/#' +
        # querystring.stringify({
        #     access_token: access_token,
        #     refresh_token: refresh_token
        # })
    # Construct the query string
        query_params = {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'username': username,
        }
    # Use urlencode to build the query string
        query_string = urlencode(query_params)
    # Redirect to the URL with the query string
        return redirect('http://0.0.0.0/#' + query_string)

        # else:
        #     return Response(serializer.errors, status=400)
class SignUpView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        print("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&\n")
        print(request.data)
        print("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&\n")

        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SignInView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            if user.enable_2fa:
                otp = send_otp(request, user.email)
                cache.set(f'otp_{user.username}', otp, timeout=60)
                return Response({'message': 'OTP has been sent to your registered email.'})
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        otp = request.data.get('otp')
        cached_otp = cache.get(f'otp_{username}')
        if cached_otp and cached_otp == otp:
            user = User.objects.get(username=username)
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_401_UNAUTHORIZED)



class UserDetailView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return JsonResponse(serializer.data)

class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IncrementGamesPlayedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        logger.info(f"POST request received to increment games_played for user {user.username}")
        logger.info(f"Initial games_played value: {user.games_played}")

        # Initialize games_played if it's None
        if user.games_played is None:
            user.games_played = 0
            user.save()
            logger.info(f"Initialized games_played to 0 for user {user.username}")

        # Increment games_played using update() to avoid race conditions
        updated = User.objects.filter(pk=user.pk).update(games_played=F('games_played') + 1)
        logger.info(f"Update operation affected {updated} row(s)")

        # Refresh from db to get the updated value
        user.refresh_from_db()

        logger.info(f"Final games_played value: {user.games_played}")

        return Response({
            'status': 'games_played incremented',
            'games_played': user.games_played
        })

    def options(self, request, *args, **kwargs):
        logger.info("OPTIONS request received")
        return super().options(request, *args, **kwargs)

class IncrementWinsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        logger.info(f"Incrementing wins for user {user.username}")

        try:
            # Initialize wins if it's None
            if user.wins is None:
                user.wins = 0
                user.save()
                logger.info(f"Initialized wins to 0 for user {user.username}")

            # Increment wins using update() to avoid race conditions
            updated = type(user).objects.filter(pk=user.pk).update(wins=F('wins') + 1)
            logger.info(f"Update operation affected {updated} row(s)")

            # Refresh from db to get the updated value
            user.refresh_from_db()

            logger.info(f"New wins value for user {user.username}: {user.wins}")

            return Response({
                'status': 'wins incremented',
                'wins': user.wins
            })
        except Exception as e:
            logger.error(f"Error incrementing wins for user {user.username}: {str(e)}")
            return Response({'status': 'error', 'message': 'Failed to increment wins'}, status=500)

class IncrementLossesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        logger.info(f"Incrementing losses for user {user.username}")

        try:
            # Initialize losses if it's None
            if user.losses is None:
                user.losses = 0
                user.save()
                logger.info(f"Initialized losses to 0 for user {user.username}")

            # Increment losses using update() to avoid race conditions
            updated = type(user).objects.filter(pk=user.pk).update(losses=F('losses') + 1)
            logger.info(f"Update operation affected {updated} row(s)")

            # Refresh from db to get the updated value
            user.refresh_from_db()

            logger.info(f"New losses value for user {user.username}: {user.losses}")

            return Response({
                'status': 'losses incremented',
                'losses': user.losses
            })
        except Exception as e:
            logger.error(f"Error incrementing losses for user {user.username}: {str(e)}")
            return Response({'status': 'error', 'message': 'Failed to increment losses'}, status=500)


class OAuthLogin(APIView):
    permission_classes = [AllowAny]
    print("TARTOFRAIZ")
    def get(self, request):
        try:
            base_url = 'https://api.intra.42.fr/oauth/authorize'
            params = {
                'client_id': 'u-s4t2ud-3f8d76fb565ae2c8b49b3e5a004b06c8508fc22af3ef603d001f7adce5e277e1',
                'redirect_uri': 'http://localhost:8000/accounts/42/callback/',
                'response_type': 'code',
                'scope': 'public',
            }
            url = f"{base_url}?{urlencode(params)}"
            # print(f'Final URL from OAuthLogin: {url}')
            print("TARTOPOM")
            print(url)
            return redirect(url)
        # return redirect('https://www.google.com')
        except KeyError as e:
            return Response({'error': f'Missing environment variable: {str(e)}'}, status=500)

    # def post(self, request):
    #     print("TARTAPASTEK")
    #     return redirect('https://www.google.com')

class AvatarUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        if 'avatar' in request.data:
            user = request.user
            user.avatar = request.data['avatar']
            user.save()
            return Response({'status': 'Avatar updated'}, status=status.HTTP_200_OK)
        return Response({'status': 'No avatar provided'}, status=status.HTTP_400_BAD_REQUEST)

#Debug function to see if avatar is uploaded
# class UserDetailView(APIView):
#     def get(self, request):
#         user = request.user
#         serializer = UserSerializer(user)
#         data = serializer.data

#         if user.avatar:
#             print(f"Avatar path: {user.avatar.path}")
#             print(f"Avatar URL: {user.avatar.url}")
#         else:
#             default_avatar_path = os.path.join(settings.STATIC_ROOT, 'images', 'default-avatar.png')
#             print(f"Default avatar path: {default_avatar_path}")
#             print(f"Default avatar exists: {os.path.exists(default_avatar_path)}")

#         return Response(data)
