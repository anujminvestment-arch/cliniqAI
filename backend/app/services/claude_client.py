import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    import anthropic
    _client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None
except ImportError:
    _client = None


async def generate_summary(text: str, max_tokens: int = 300) -> str | None:
    """Generate a summary of the given text using Claude."""
    if not _client:
        logger.warning("Anthropic client not configured, using extractive summary")
        # Simple extractive fallback
        sentences = text.replace("\n", ". ").split(". ")
        return ". ".join(sentences[:3]) + "." if sentences else None

    try:
        response = await _client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=max_tokens,
            messages=[{
                "role": "user",
                "content": f"Summarize this clinic conversation concisely in 2-3 sentences. Focus on: patient's concern, actions taken, outcome.\n\n{text[:4000]}",
            }],
        )
        return response.content[0].text
    except Exception as e:
        logger.error(f"Claude summary failed: {e}")
        return None


async def ai_assist_consultation(
    chief_complaint: str,
    subjective: str | None = None,
    objective: str | None = None,
) -> dict | None:
    """Provide AI-assisted consultation suggestions."""
    if not _client:
        return None

    prompt = f"""Based on this consultation data, suggest:
1. Possible assessment/diagnosis
2. Recommended plan
3. Follow-up timeline

Chief Complaint: {chief_complaint}
"""
    if subjective:
        prompt += f"\nSubjective: {subjective}"
    if objective:
        prompt += f"\nObjective: {objective}"

    try:
        response = await _client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        return {"suggestion": response.content[0].text}
    except Exception as e:
        logger.error(f"AI assist failed: {e}")
        return None
