# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extraire le connection_id de l'URL de l'appel
        self.connection_id = self.scope['url_route']['kwargs']['connection_id']
        self.group_name = f"game_{self.connection_id}"

        # Rejoindre le groupe de jeu spécifique
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Quitter le groupe de jeu spécifique
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Envoyer le message à tous les membres du groupe spécifique
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'game_message',
                'message': message
            }
        )

    async def game_message(self, event):
        message = event['message']

        # Envoyer le message au WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
