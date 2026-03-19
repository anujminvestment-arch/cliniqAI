"""STT Provider Router — automatically selects Sarvam or Whisper based on caller.

Routing logic:
- Indian phone numbers (+91) → Sarvam AI (best Indian language accuracy)
- Global phone numbers → OpenAI Whisper (57 languages, global coverage)
- No phone number → try Sarvam first, fall back to Whisper

Also handles TTS routing and language detection.
"""

import logging
from app.services.sarvam_client import sarvam_client, is_indian_number, SARVAM_LANGUAGES
from app.services.whisper_client import whisper_client, WHISPER_LANGUAGES

logger = logging.getLogger(__name__)


def get_stt_provider(caller_phone: str | None = None) -> str:
    """Determine which STT provider to use based on caller's phone number.

    Returns: "sarvam" | "whisper"
    """
    if caller_phone and is_indian_number(caller_phone):
        if sarvam_client.available:
            return "sarvam"
    if whisper_client.available:
        return "whisper"
    if sarvam_client.available:
        return "sarvam"
    raise RuntimeError("No STT provider configured. Set SARVAM_API_KEY or OPENAI_API_KEY.")


def get_tts_provider(caller_phone: str | None = None, language: str | None = None) -> str:
    """Determine which TTS provider to use.

    Indian language TTS → Sarvam (better Indian voices)
    Global language TTS → OpenAI (if Sarvam doesn't support the language)
    """
    # If Indian number or Indian language, prefer Sarvam
    if caller_phone and is_indian_number(caller_phone):
        if sarvam_client.available:
            return "sarvam"
    if language and language in SARVAM_LANGUAGES:
        if sarvam_client.available:
            return "sarvam"
    if whisper_client.available:
        return "whisper"
    if sarvam_client.available:
        return "sarvam"
    raise RuntimeError("No TTS provider configured.")


# Map Sarvam language codes to Whisper ISO-639-1 codes and vice versa
_SARVAM_TO_WHISPER = {
    "hi-IN": "hi", "en-IN": "en", "bn-IN": "bn", "gu-IN": "gu",
    "kn-IN": "kn", "ml-IN": "ml", "mr-IN": "mr", "pa-IN": "pa",
    "ta-IN": "ta", "te-IN": "te", "ur-IN": "ur", "ne-IN": "ne",
    "sa-IN": "sa", "sd-IN": "sd",
}
_WHISPER_TO_SARVAM = {v: k for k, v in _SARVAM_TO_WHISPER.items()}


async def transcribe(
    audio_bytes: bytes | None = None,
    audio_url: str | None = None,
    caller_phone: str | None = None,
    language: str | None = None,
    filename: str = "audio.wav",
) -> dict:
    """Route transcription to the right provider.

    Args:
        audio_bytes: Raw audio data
        audio_url: URL to audio file (Sarvam only)
        caller_phone: Caller's phone number (for routing)
        language: Language hint (Sarvam format "hi-IN" or Whisper format "hi")
        filename: Filename with extension

    Returns:
        {"text": str, "language": str, "provider": str, "duration": float, ...}
    """
    provider = get_stt_provider(caller_phone)
    logger.info(f"STT routing: phone={caller_phone} → provider={provider}")

    if provider == "sarvam":
        # Convert Whisper language code to Sarvam format if needed
        sarvam_lang = language or "hi-IN"
        if len(sarvam_lang) == 2:
            sarvam_lang = _WHISPER_TO_SARVAM.get(sarvam_lang, "hi-IN")

        try:
            result = await sarvam_client.transcribe(
                audio_url=audio_url,
                audio_bytes=audio_bytes,
                language=sarvam_lang,
            )
            return {
                "text": result.get("transcript", ""),
                "language": sarvam_lang,
                "provider": "sarvam",
                "model": "saaras:v3",
                "timestamps": result.get("timestamps"),
                "raw": result,
            }
        except Exception as e:
            logger.warning(f"Sarvam STT failed, falling back to Whisper: {e}")
            if not whisper_client.available:
                raise
            provider = "whisper"

    # Whisper
    if not audio_bytes:
        raise ValueError("Whisper requires audio_bytes (file upload), not URL")

    # Convert Sarvam language code to Whisper format if needed
    whisper_lang = language
    if whisper_lang and "-" in whisper_lang:
        whisper_lang = _SARVAM_TO_WHISPER.get(whisper_lang, whisper_lang.split("-")[0])

    result = await whisper_client.transcribe(
        audio_bytes=audio_bytes,
        filename=filename,
        language=whisper_lang,
    )
    return result


async def translate_to_english(
    audio_bytes: bytes,
    caller_phone: str | None = None,
    language: str | None = None,
    filename: str = "audio.wav",
) -> dict:
    """Transcribe + translate to English using the appropriate provider."""
    provider = get_stt_provider(caller_phone)

    if provider == "sarvam":
        sarvam_lang = language or "hi-IN"
        if len(sarvam_lang) == 2:
            sarvam_lang = _WHISPER_TO_SARVAM.get(sarvam_lang, "hi-IN")
        try:
            result = await sarvam_client.transcribe_translate(
                audio_bytes=audio_bytes,
                language=sarvam_lang,
            )
            return {
                "text": result.get("translated_text", result.get("transcript", "")),
                "original_text": result.get("transcript", ""),
                "language": "en",
                "source_language": sarvam_lang,
                "provider": "sarvam",
            }
        except Exception as e:
            logger.warning(f"Sarvam STTT failed, falling back to Whisper: {e}")
            if not whisper_client.available:
                raise

    return await whisper_client.translate_to_english(audio_bytes, filename)


async def text_to_speech(
    text: str,
    language: str = "en-IN",
    caller_phone: str | None = None,
    speaker: str | None = None,
) -> dict:
    """Route TTS to the right provider.

    Returns:
        {"audio": bytes | base64_str, "provider": str, "format": str}
    """
    provider = get_tts_provider(caller_phone, language)

    if provider == "sarvam":
        sarvam_lang = language
        if len(sarvam_lang) == 2:
            sarvam_lang = _WHISPER_TO_SARVAM.get(sarvam_lang, "en-IN")
        result = await sarvam_client.text_to_speech(
            text=text,
            language=sarvam_lang,
            speaker=speaker or "anushka",
        )
        return {"audio": result, "provider": "sarvam", "format": "mp3"}

    audio_bytes = await whisper_client.tts(
        text=text,
        voice=speaker or "nova",
    )
    return {"audio": audio_bytes, "provider": "whisper", "format": "mp3"}


async def detect_language(
    text: str | None = None,
    caller_phone: str | None = None,
) -> dict:
    """Detect language from text or infer from phone number.

    Returns:
        {"language_code": str, "language_name": str, "provider": str}
    """
    # If we have text and Sarvam is available, use language detection API
    if text and sarvam_client.available:
        try:
            result = await sarvam_client.detect_language(text)
            lang_code = result.get("language_code", "en-IN")
            return {
                "language_code": lang_code,
                "language_name": SARVAM_LANGUAGES.get(lang_code, "Unknown"),
                "script": result.get("script"),
                "confidence": result.get("confidence"),
                "provider": "sarvam",
            }
        except Exception as e:
            logger.warning(f"Language detection failed: {e}")

    # Fallback: infer from phone number
    if caller_phone:
        if is_indian_number(caller_phone):
            return {"language_code": "hi-IN", "language_name": "Hindi", "provider": "inferred"}
        return {"language_code": "en-IN", "language_name": "English", "provider": "inferred"}

    return {"language_code": "en-IN", "language_name": "English", "provider": "default"}
