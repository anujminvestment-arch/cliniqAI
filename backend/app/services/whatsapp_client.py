import httpx
from app.core.config import settings


class WhatsAppClient:
    BASE_URL = "https://api.gupshup.io/wa/api/v1"

    def __init__(self):
        self.api_key = settings.GUPSHUP_API_KEY
        self.app_name = settings.GUPSHUP_APP_NAME

    async def send_message(self, to: str, content: str) -> dict:
        """Send a text message via WhatsApp."""
        if not self.api_key:
            return {"status": "skipped", "reason": "GUPSHUP_API_KEY not configured"}

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/msg",
                headers={"apikey": self.api_key},
                data={
                    "channel": "whatsapp",
                    "source": self.app_name,
                    "destination": to,
                    "message": '{"type":"text","text":"' + content.replace('"', '\\"') + '"}',
                    "src.name": self.app_name,
                },
            )
            return response.json()

    async def send_template(self, to: str, template_id: str, params: list[str]) -> dict:
        """Send a template message via WhatsApp."""
        if not self.api_key:
            return {"status": "skipped", "reason": "GUPSHUP_API_KEY not configured"}

        import json
        body_params = [{"type": "text", "text": p} for p in params]
        template_msg = json.dumps({
            "type": "template",
            "template": {
                "name": template_id,
                "language": {"code": "en"},
                "components": [{"type": "body", "parameters": body_params}],
            },
        })

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/msg",
                headers={"apikey": self.api_key},
                data={
                    "channel": "whatsapp",
                    "source": self.app_name,
                    "destination": to,
                    "message": template_msg,
                    "src.name": self.app_name,
                },
            )
            return response.json()


whatsapp_client = WhatsAppClient()
