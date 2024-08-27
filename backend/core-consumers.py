# consumers.py

from channels.generic.websocket import AsyncWebsocketConsumer
import json

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Rejoindre le groupe de jeu
        await self.channel_layer.group_add(
            "game_group",
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Quitter le groupe de jeu
        await self.channel_layer.group_discard(
            "game_group",
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Envoyer le message à tous les membres du groupe
        await self.channel_layer.group_send(
            "game_group",
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
