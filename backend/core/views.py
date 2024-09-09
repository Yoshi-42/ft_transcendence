from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.http import JsonResponse
from django.db.models import F
from django.contrib.auth import get_user_model
import logging
import os

User = get_user_model()
logger = logging.getLogger(__name__)

class SignUpView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
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
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

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
        
import requests
from django.shortcuts import redirect
from urllib.parse import urlencode

class OAuthLogin(APIView):
    permission_classes = [AllowAny]
    print("TARTOFRAIZ")
    def get(self, request):
        try:
            base_url = 'https://api.intra.42.fr/oauth/authorize'
            params = {
                'client_id': os.environ['OAUTH_CLIENT_ID'],
                'redirect_uri': os.environ['OAUTH_REDIRECT_URI'],
                'response_type': 'code',
                'scope': 'public',
            }
            url = f"{base_url}?{urlencode(params)}"
            print(f'Final URL from OAuthLogin: {url}')
            print("TARTOPOM")
            return Response(url)
        # return redirect('https://www.google.com')
        except KeyError as e:
            return Response({'error': f'Missing environment variable: {str(e)}'}, status=500)
        
    # def post(self, request):
    #     print("TARTAPASTEK")
    #     return redirect('https://www.google.com')
    

from django.shortcuts import redirect, render
from django.conf import settings

def oauth_callback(request):
    code = request.GET.get('code')

    if not code:
        return render(request, 'error.html', {"message": "No code provided by 42."})

    token_url = 'https://api.intra.42.fr/oauth/token'
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': settings.OAUTH_CLIENT_ID,
        'client_secret': settings.OAUTH_CLIENT_SECRET,
        'code': code,
        'redirect_uri': settings.OAUTH_REDIRECT_URI,
    }
    token_headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    
    # Send request to 42 for access token
    token_r = requests.post(token_url, data=token_data, headers=token_headers)
    token_json = token_r.json()

    # Check if access token is present
    if 'access_token' in token_json:
        access_token = token_json['access_token']
        
        # Use the access token to get user data
        user_data_url = 'https://api.intra.42.fr/v2/me'
        user_data_r = requests.get(user_data_url, headers={'Authorization': f'Bearer {access_token}'})
        user_data = user_data_r.json()

        # Now you can process the user_data as you wish (e.g., creating or logging in a user)
        
        # Example: redirect to a success page
        return render(request, 'success.html', {'user_data': user_data})
    else:
        return render(request, 'error.html', {'message': "Failed to retrieve access token."})

