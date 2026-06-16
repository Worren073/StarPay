import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from rest_framework_simplejwt.tokens import AccessToken
        from django.contrib.auth import get_user_model

        User = get_user_model()

        params = parse_qs(self.scope['query_string'].decode())
        token = (params.get('token') or [None])[0]
        if not token:
            await self.close()
            return
        try:
            access = AccessToken(token)
            user_id = access['user_id']
            self.user = await database_sync_to_async(User.objects.get)(id=user_id)
        except Exception:
            await self.close()
            return

        self.group_name = f'notifications_{self.user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notification_message(self, event):
        await self.send(text_data=json.dumps(event['notification']))
