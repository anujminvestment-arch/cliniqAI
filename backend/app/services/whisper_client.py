"""OpenAI Whisper / GPT-4o Transcribe client — for global (non-Indian) callers.

Models:
- whisper-1: $0.006/min, 57 languages, basic transcription
- gpt-4o-transcribe: $0.006/min, better accuracy, structured output
- gpt-4o-mini-transcribe: $0.003/min, cost-effective
- gpt-4o-transcribe-diarize: $0.006/min, speaker identification

Used when caller phone number is NOT +91 (Indian).
"""

import io
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    import openai
    _client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
except ImportError:
    _client = None

# Whisper supports 57 languages — most common ones mapped
WHISPER_LANGUAGES = {
    "en": "English", "zh": "Chinese", "de": "German", "es": "Spanish",
    "ru": "Russian", "ko": "Korean", "fr": "French", "ja": "Japanese",
    "pt": "Portuguese", "tr": "Turkish", "pl": "Polish", "ca": "Catalan",
    "nl": "Dutch", "ar": "Arabic", "sv": "Swedish", "it": "Italian",
    "id": "Indonesian", "hi": "Hindi", "fi": "Finnish", "vi": "Vietnamese",
    "he": "Hebrew", "uk": "Ukrainian", "el": "Greek", "ms": "Malay",
    "cs": "Czech", "ro": "Romanian", "da": "Danish", "hu": "Hungarian",
    "ta": "Tamil", "no": "Norwegian", "th": "Thai", "ur": "Urdu",
    "hr": "Croatian", "bg": "Bulgarian", "lt": "Lithuanian", "la": "Latin",
    "mi": "Maori", "ml": "Malayalam", "cy": "Welsh", "sk": "Slovak",
    "te": "Telugu", "fa": "Persian", "lv": "Latvian", "bn": "Bengali",
    "sr": "Serbian", "az": "Azerbaijani", "sl": "Slovenian", "kn": "Kannada",
    "et": "Estonian", "mk": "Macedonian", "br": "Breton", "eu": "Basque",
    "is": "Icelandic", "hy": "Armenian", "ne": "Nepali", "mn": "Mongolian",
    "bs": "Bosnian", "kk": "Kazakh", "sq": "Albanian", "sw": "Swahili",
    "gl": "Galician", "mr": "Marathi", "pa": "Punjabi", "si": "Sinhala",
    "km": "Khmer", "sn": "Shona", "yo": "Yoruba", "so": "Somali",
    "af": "Afrikaans", "ka": "Georgian", "be": "Belarusian",
    "tg": "Tajik", "sd": "Sindhi", "gu": "Gujarati", "am": "Amharic",
    "yi": "Yiddish", "lo": "Lao", "uz": "Uzbek", "fo": "Faroese",
    "ht": "Haitian Creole", "ps": "Pashto", "tk": "Turkmen",
    "nn": "Nynorsk", "mt": "Maltese", "sa": "Sanskrit",
    "lb": "Luxembourgish", "my": "Myanmar", "bo": "Tibetan",
    "tl": "Tagalog", "mg": "Malagasy",
}


class WhisperClient:
    def __init__(self):
        self.client = _client
        self.available = _client is not None

    async def transcribe(
        self,
        audio_bytes: bytes,
        filename: str = "audio.wav",
        language: str | None = None,
        model: str = "whisper-1",
        response_format: str = "verbose_json",
        prompt: str | None = None,
    ) -> dict:
        """Transcribe audio using OpenAI Whisper API.

        Args:
            audio_bytes: Audio file bytes
            filename: Filename with extension (determines format)
            language: ISO-639-1 code (e.g., "en", "es", "fr"). Auto-detect if None.
            model: "whisper-1" | "gpt-4o-transcribe" | "gpt-4o-mini-transcribe"
            response_format: "json" | "text" | "srt" | "verbose_json" | "vtt"
            prompt: Context hint for better accuracy

        Returns:
            {"text": str, "language": str, "duration": float, "segments": [...]}
        """
        if not self.client:
            raise RuntimeError("OpenAI client not configured (OPENAI_API_KEY missing)")

        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = filename

        kwargs = {
            "model": model,
            "file": audio_file,
            "response_format": response_format,
        }
        if language:
            kwargs["language"] = language
        if prompt:
            kwargs["prompt"] = prompt
        if response_format == "verbose_json":
            kwargs["timestamp_granularities"] = ["word", "segment"]

        response = await self.client.audio.transcriptions.create(**kwargs)

        if response_format in ("json", "verbose_json"):
            return {
                "text": response.text,
                "language": getattr(response, "language", language or "unknown"),
                "duration": getattr(response, "duration", None),
                "segments": getattr(response, "segments", []),
                "words": getattr(response, "words", []),
                "provider": "whisper",
                "model": model,
            }
        return {"text": response if isinstance(response, str) else response.text, "provider": "whisper", "model": model}

    async def transcribe_with_diarization(
        self,
        audio_bytes: bytes,
        filename: str = "audio.wav",
        language: str | None = None,
    ) -> dict:
        """Transcribe with speaker diarization (who said what).

        Uses gpt-4o-transcribe-diarize model for speaker identification.
        """
        if not self.client:
            raise RuntimeError("OpenAI client not configured")

        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = filename

        kwargs = {
            "model": "gpt-4o-transcribe-diarize",
            "file": audio_file,
            "response_format": "verbose_json",
        }
        if language:
            kwargs["language"] = language

        response = await self.client.audio.transcriptions.create(**kwargs)
        return {
            "text": response.text,
            "language": getattr(response, "language", language or "unknown"),
            "duration": getattr(response, "duration", None),
            "segments": getattr(response, "segments", []),
            "provider": "whisper",
            "model": "gpt-4o-transcribe-diarize",
        }

    async def translate_to_english(
        self,
        audio_bytes: bytes,
        filename: str = "audio.wav",
        model: str = "whisper-1",
    ) -> dict:
        """Translate any language audio to English text.

        Only whisper-1 supports the /translations endpoint.
        """
        if not self.client:
            raise RuntimeError("OpenAI client not configured")

        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = filename

        response = await self.client.audio.translations.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",
        )
        return {
            "text": response.text,
            "language": "en",
            "duration": getattr(response, "duration", None),
            "segments": getattr(response, "segments", []),
            "provider": "whisper",
            "model": "whisper-1",
            "translation": True,
        }

    async def tts(
        self,
        text: str,
        voice: str = "alloy",
        model: str = "tts-1",
        response_format: str = "mp3",
        speed: float = 1.0,
    ) -> bytes:
        """Text-to-speech using OpenAI TTS (for global callers).

        Args:
            text: Text to synthesize (max 4096 chars)
            voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"
            model: "tts-1" (fast) | "tts-1-hd" (quality)
            response_format: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm"
            speed: 0.25 to 4.0

        Returns:
            Audio bytes
        """
        if not self.client:
            raise RuntimeError("OpenAI client not configured")

        response = await self.client.audio.speech.create(
            model=model,
            voice=voice,
            input=text[:4096],
            response_format=response_format,
            speed=speed,
        )
        return response.content


whisper_client = WhisperClient()
