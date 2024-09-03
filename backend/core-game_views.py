# game_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils.crypto import get_random_string
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import GameInstance, Player
from .serializers import GameInstanceSerializer, PlayerSerializer

User = get_user_model()

# game_views.py

from django.urls import reverse  # Import pour obtenir l'URL du jeu

class CreateGameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user


        print("get_random_string: ", get_random_string)
		
        # Créer un code de jeu unique
        game_code = get_random_string(length=8)
        print("Generated game code: ", game_code)
		
        # Créer une nouvelle instance de jeu de manière atomique
        with transaction.atomic():
            game_instance = GameInstance.objects.create(
                creator=user,
                game_code=game_code,
            )

            # Ajouter le joueur créateur à la partie
            Player.objects.create(
                user=user,
                game_instance=game_instance,
                is_creator=True,
            )

        # Construire le lien de jeu
        game_link = request.build_absolute_uri(reverse('join_game') + f"?game_code={game_code}")


        connection_id = str(game_instance.id)  # ou tout autre identifiant unique
        print("Generated connection ID: ", connection_id)

        # Retourner la réponse avec les données du jeu et le lien partageable
        return Response({
            'game': GameInstanceSerializer(game_instance).data,
            'game_link': game_link,
            'connection_id': connection_id,
        }, status=201)


class JoinGameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        game_code = request.data.get('game_code')

        # Vérifier que le code de jeu est fourni
        if not game_code:
            return Response({'detail': 'Le code de jeu est requis.'}, status=400)

        # Rechercher l'instance de jeu avec le code fourni
        game_instance = get_object_or_404(GameInstance, game_code=game_code)

        # Vérifier s'il y a déjà deux joueurs
        if game_instance.players.count() >= 2:
            return Response({'detail': 'La partie est déjà pleine.'}, status=400)

        # Vérifier si l'utilisateur a déjà rejoint le jeu
        if Player.objects.filter(user=user, game_instance=game_instance).exists():
            return Response({'detail': 'Vous avez déjà rejoint cette partie.'}, status=400)

        # Ajouter le joueur à la partie
        Player.objects.create(
            user=user,
            game_instance=game_instance,
        )

        return Response(GameInstanceSerializer(game_instance).data, status=200)


class GameStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, game_code):
        # Obtenir l'instance de jeu
        game_instance = get_object_or_404(GameInstance, game_code=game_code)

        # Retourner la réponse avec les données du jeu
        return Response(GameInstanceSerializer(game_instance).data, status=200)
