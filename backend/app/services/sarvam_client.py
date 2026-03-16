"""Sarvam AI API client — STT (Saaras), TTS (Bulbul), and Samvaad agent management."""

import httpx
from app.core.config import settings

SARVAM_BASE_URL = "https://api.sarvam.ai"


class SarvamClient:
    def __init__(self):
        self.api_key = settings.SARVAM_API_KEY
        self.headers = {
            "API-Subscription-Key": self.api_key,
            "Content-Type": "application/json",
        }

    # ── STT (Saaras) ──────────────────────────────────────────────

    async def transcribe(self, audio_url: str, language: str = "hi-IN") -> dict:
        """Transcribe audio using Sarvam Saaras STT (batch mode)."""
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/speech-to-text",
                json={
                    "url": audio_url,
                    "language_code": language,
                    "model": "saaras:v2",
                    "with_timestamps": True,
                },
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def transcribe_streaming(self, websocket_url: str) -> str:
        """Connect to Sarvam streaming STT WebSocket for real-time transcription."""
        # Used during live calls — Samvaad handles this internally
        # This method is for manual re-transcription of recordings
        raise NotImplementedError("Use Samvaad for live STT; use transcribe() for batch")

    # ── TTS (Bulbul) ──────────────────────────────────────────────

    async def text_to_speech(
        self, text: str, language: str = "hi-IN", speaker: str = "meera"
    ) -> bytes:
        """Convert text to speech using Sarvam Bulbul TTS."""
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/text-to-speech",
                json={
                    "inputs": [text],
                    "target_language_code": language,
                    "speaker": speaker,
                    "model": "bulbul:v2",
                },
                headers=self.headers,
            )
            response.raise_for_status()
            data = response.json()
            # Returns base64 encoded audio
            return data

    # ── Translation ───────────────────────────────────────────────

    async def translate(
        self, text: str, source_lang: str = "en-IN", target_lang: str = "hi-IN"
    ) -> str:
        """Translate text between Indian languages."""
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/translate",
                json={
                    "input": text,
                    "source_language_code": source_lang,
                    "target_language_code": target_lang,
                    "model": "mayura:v1",
                },
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json().get("translated_text", text)

    # ── Samvaad Agent Management ──────────────────────────────────

    async def create_agent(self, config: dict) -> dict:
        """Create a Sarvam Samvaad conversational agent."""
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/agents",
                json=config,
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def update_agent(self, agent_id: str, config: dict) -> dict:
        """Update a Samvaad agent configuration."""
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.put(
                f"{SARVAM_BASE_URL}/agents/{agent_id}",
                json=config,
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def get_agent(self, agent_id: str) -> dict:
        """Get Samvaad agent details."""
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                f"{SARVAM_BASE_URL}/agents/{agent_id}",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def get_call_details(self, call_id: str) -> dict:
        """Get details of a completed call including transcript."""
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                f"{SARVAM_BASE_URL}/calls/{call_id}",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()


sarvam_client = SarvamClient()
