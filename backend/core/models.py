from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    games_played = models.IntegerField(null=True, default=None)
    wins = models.IntegerField(null=True, default=None)
    losses = models.IntegerField(null=True, default=None)
    enable_2fa = models.BooleanField(null=False, default=False)

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