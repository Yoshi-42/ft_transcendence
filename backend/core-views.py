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