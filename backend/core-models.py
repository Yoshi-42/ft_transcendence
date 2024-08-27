from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class CustomUser(AbstractUser):
    games_played = models.IntegerField(null=True, default=None)
    wins = models.IntegerField(null=True, default=None)
    losses = models.IntegerField(null=True, default=None)

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='customuser_set',
        related_query_name='customuser',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='customuser_set',
        related_query_name='customuser',
    )
    

class GameInstance(models.Model):
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_games'
    )
    game_code = models.CharField(max_length=8, unique=True)  # Code unique pour rejoindre le jeu
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp pour la création du jeu
    is_active = models.BooleanField(default=True)  # Indique si le jeu est encore en cours

    def __str__(self):
        return f"Game {self.game_code} by {self.creator.username}"


class Player(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='games'
    )
    game_instance = models.ForeignKey(
        GameInstance,
        on_delete=models.CASCADE,
        related_name='players'
    )
    is_creator = models.BooleanField(default=False)  # Indique si le joueur est le créateur du jeu
    joined_at = models.DateTimeField(auto_now_add=True)  # Timestamp pour quand le joueur a rejoint le jeu
