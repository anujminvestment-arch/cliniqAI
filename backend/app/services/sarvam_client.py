"""Sarvam AI API client — Full integration.

Services used:
- STT: Saaras v3 (speech-to-text, streaming + batch, 10 Indian languages)
- TTS: Bulbul v3 (text-to-speech, 30+ voices, streaming)
- Translation: sarvam-translate v1 (22 Indian languages + English)
- Transliteration: script conversion (Devanagari ↔ Latin etc.)
- Language Detection: detect language + script from text
- Samvaad: voice agent management (create, update, calls)
"""

import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

SARVAM_BASE_URL = "https://api.sarvam.ai"

# All supported Sarvam language codes
SARVAM_LANGUAGES = {
    "hi-IN": "Hindi", "en-IN": "English", "bn-IN": "Bengali",
    "gu-IN": "Gujarati", "kn-IN": "Kannada", "ml-IN": "Malayalam",
    "mr-IN": "Marathi", "od-IN": "Odia", "pa-IN": "Punjabi",
    "ta-IN": "Tamil", "te-IN": "Telugu", "ur-IN": "Urdu",
    "as-IN": "Assamese", "brx-IN": "Bodo", "doi-IN": "Dogri",
    "kok-IN": "Konkani", "ks-IN": "Kashmiri", "mai-IN": "Maithili",
    "mni-IN": "Manipuri", "ne-IN": "Nepali", "sa-IN": "Sanskrit",
    "sat-IN": "Santali", "sd-IN": "Sindhi",
}

# Indian phone number prefixes
INDIAN_COUNTRY_CODE = "+91"


def is_indian_number(phone: str) -> bool:
    """Check if a phone number is Indian (+91)."""
    cleaned = phone.strip().replace(" ", "").replace("-", "")
    return cleaned.startswith("+91") or cleaned.startswith("91") and len(cleaned) >= 12


class SarvamClient:
    def __init__(self):
        self.api_key = settings.SARVAM_API_KEY
        self.headers = {
            "API-Subscription-Key": self.api_key,
            "Content-Type": "application/json",
        }
        self.available = bool(self.api_key)

    def _get_headers(self, content_type: str = "application/json") -> dict:
        return {"API-Subscription-Key": self.api_key, "Content-Type": content_type}

    # ── STT (Saaras v3) ─────────────────────────────────────────

    async def transcribe(
        self,
        audio_url: str | None = None,
        audio_bytes: bytes | None = None,
        language: str = "hi-IN",
        mode: str = "transcribe",
    ) -> dict:
        """Transcribe audio using Sarvam Saaras v3.

        Args:
            audio_url: URL of audio file (for batch/URL mode)
            audio_bytes: Raw audio bytes (for file upload mode)
            language: Language code (e.g., "hi-IN", "en-IN", "ta-IN")
            mode: Output mode — "transcribe" | "translate" | "verbatim" | "translit" | "codemix"

        Returns:
            {"transcript": str, "language_code": str, ...}
        """
        async with httpx.AsyncClient(timeout=120) as client:
            if audio_bytes:
                # File upload mode
                import base64
                response = await client.post(
                    f"{SARVAM_BASE_URL}/speech-to-text",
                    json={
                        "audio": base64.b64encode(audio_bytes).decode(),
                        "language_code": language,
                        "model": "saaras:v3",
                        "mode": mode,
                        "with_timestamps": True,
                    },
                    headers=self.headers,
                )
            else:
                # URL mode
                response = await client.post(
                    f"{SARVAM_BASE_URL}/speech-to-text",
                    json={
                        "url": audio_url,
                        "language_code": language,
                        "model": "saaras:v3",
                        "mode": mode,
                        "with_timestamps": True,
                    },
                    headers=self.headers,
                )
            response.raise_for_status()
            return response.json()

    async def transcribe_translate(
        self,
        audio_url: str | None = None,
        audio_bytes: bytes | None = None,
        language: str = "hi-IN",
    ) -> dict:
        """Transcribe + translate to English in one call (STTT endpoint)."""
        async with httpx.AsyncClient(timeout=120) as client:
            payload = {
                "language_code": language,
                "model": "saaras:v3",
                "with_timestamps": True,
            }
            if audio_bytes:
                import base64
                payload["audio"] = base64.b64encode(audio_bytes).decode()
            else:
                payload["url"] = audio_url
            response = await client.post(
                f"{SARVAM_BASE_URL}/speech-to-text-translate",
                json=payload,
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    # ── TTS (Bulbul v3) ─────────────────────────────────────────

    async def text_to_speech(
        self,
        text: str,
        language: str = "hi-IN",
        speaker: str = "anushka",
        audio_format: str = "mp3",
        sample_rate: int = 24000,
    ) -> dict:
        """Convert text to speech using Sarvam Bulbul v3.

        Args:
            text: Text to synthesize (max 2500 chars for v3)
            language: Target language code
            speaker: Voice name (30+ available)
            audio_format: "mp3" | "wav" | "aac" | "opus" | "flac" | "pcm"
            sample_rate: 8000 | 16000 | 22050 | 24000

        Returns:
            {"audios": [base64_audio_string], ...}
        """
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/text-to-speech",
                json={
                    "inputs": [text[:2500]],
                    "target_language_code": language,
                    "speaker": speaker,
                    "model": "bulbul:v2",
                    "audio_format": audio_format,
                    "sample_rate": sample_rate,
                },
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    # ── Translation (sarvam-translate v1) ────────────────────────

    async def translate(
        self,
        text: str,
        source_lang: str = "en-IN",
        target_lang: str = "hi-IN",
        numerals_format: str = "international",
    ) -> str:
        """Translate text between 22 Indian languages + English.

        Supported: hi, en, bn, gu, kn, ml, mr, od, pa, ta, te, ur,
                   as, brx, doi, kok, ks, mai, mni, ne, sa, sat, sd
        """
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/translate",
                json={
                    "input": text,
                    "source_language_code": source_lang,
                    "target_language_code": target_lang,
                    "model": "sarvam-translate:v1",
                    "numerals_format": numerals_format,
                },
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json().get("translated_text", text)

    # ── Transliteration ──────────────────────────────────────────

    async def transliterate(
        self,
        text: str,
        source_lang: str = "hi-IN",
        target_lang: str = "en-IN",
    ) -> str:
        """Convert script without changing language (e.g., Devanagari → Latin)."""
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/transliterate",
                json={
                    "input": text,
                    "source_language_code": source_lang,
                    "target_language_code": target_lang,
                },
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json().get("transliterated_text", text)

    # ── Language Detection ───────────────────────────────────────

    async def detect_language(self, text: str) -> dict:
        """Detect language and script from text.

        Returns:
            {"language_code": "hi-IN", "script": "Devanagari", "confidence": 0.95}
        """
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/detect-language",
                json={"input": text},
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    # ── Samvaad Agent Management ─────────────────────────────────

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
