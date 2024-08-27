from rest_framework import serializers
#from .models import CustomUser
from .models import CustomUser, GameInstance, Player

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'games_played', 'wins', 'losses')

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance




# Nouveau sérialiseur pour GameInstance
class GameInstanceSerializer(serializers.ModelSerializer):
    creator = serializers.StringRelatedField(read_only=True)  # Affiche le nom d'utilisateur au lieu de l'ID

    class Meta:
        model = GameInstance
        fields = ('id', 'creator', 'game_code', 'created_at', 'is_active')
        read_only_fields = ('id', 'creator', 'created_at')  # Ces champs sont uniquement en lecture

# Nouveau sérialiseur pour Player
class PlayerSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # Affiche le nom d'utilisateur au lieu de l'ID
    game_instance = serializers.StringRelatedField(read_only=True)  # Affiche le code de jeu au lieu de l'ID

    class Meta:
        model = Player
        fields = ('id', 'user', 'game_instance', 'is_creator', 'joined_at')
        read_only_fields = ('id', 'user', 'game_instance', 'joined_at')  # Ces champs sont uniquement en lecture
