"""Post-call processing worker.

After a voice call ends, this processes the transcript:
1. Stores conversation record
2. Parses transcript into messages
3. Extracts structured data (symptoms, intent, doctor selected)
4. Generates AI summary via Claude Haiku
5. Generates embedding via OpenAI
6. Stores in database
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Conversation, ConversationMessage, ConversationExtraction,
    Patient, Embedding,
)


async def process_call_data(
    db: AsyncSession,
    execution_id: str,
    clinic_id: str,
    caller_phone: str | None,
    recording_url: str | None,
    transcript: str | None,
    duration: int | None,
    extracted_data: dict | None,
    language: str = "hi",
    stt_provider: str = "sarvam",
):
    """Process a completed voice call."""

    # 1. Deduplicate by execution_id
    result = await db.execute(
        select(Conversation).where(Conversation.external_id == execution_id)
    )
    if result.scalar_one_or_none():
        return  # Already processed

    # 2. Find patient by phone
    patient_id = None
    if caller_phone:
        result = await db.execute(
            select(Patient.id).where(
                Patient.clinic_id == clinic_id,
                Patient.phone == caller_phone,
            )
        )
        patient_id = result.scalar_one_or_none()

    # 3. Create conversation record
    conversation = Conversation(
        clinic_id=clinic_id,
        patient_id=patient_id,
        external_id=execution_id,
        channel="voice",
        caller_phone=caller_phone,
        status="completed",
        duration=duration,
        recording_url=recording_url,
        transcript=transcript,
        language=language,
        stt_provider=stt_provider,
        metadata=extracted_data or {},
    )
    db.add(conversation)
    await db.flush()

    # 4. Parse transcript into turns
    if transcript:
        turns = parse_transcript_turns(transcript)
        for turn in turns:
            db.add(ConversationMessage(
                conversation_id=conversation.id,
                role=turn["role"],
                content=turn["content"],
            ))

    # 5. Store extracted data
    if extracted_data:
        if "symptoms" in extracted_data:
            db.add(ConversationExtraction(
                conversation_id=conversation.id,
                extraction_type="symptoms",
                data={"symptoms": extracted_data["symptoms"]},
                confidence=90,
            ))
        if "intent" in extracted_data:
            db.add(ConversationExtraction(
                conversation_id=conversation.id,
                extraction_type="intent",
                data={"intent": extracted_data["intent"]},
                confidence=85,
            ))
        if "doctor_selected" in extracted_data:
            db.add(ConversationExtraction(
                conversation_id=conversation.id,
                extraction_type="doctor_selected",
                data={"doctor": extracted_data["doctor_selected"]},
                confidence=95,
            ))

    # 6. Generate AI summary (placeholder — requires ANTHROPIC_API_KEY)
    ai_summary = generate_summary_placeholder(transcript)
    conversation.ai_summary = ai_summary

    # 7. Generate embedding (placeholder — requires OPENAI_API_KEY)
    # In production:
    # embedding_vector = await generate_embedding(transcript)
    # db.add(Embedding(
    #     clinic_id=clinic_id,
    #     patient_id=patient_id,
    #     source_type="conversation",
    #     source_id=conversation.id,
    #     content_text=transcript,
    #     embedding=embedding_vector,
    # ))

    await db.commit()


def parse_transcript_turns(transcript: str) -> list[dict]:
    """Parse a raw transcript into speaker turns."""
    turns = []
    lines = transcript.strip().split("\n")

    for line in lines:
        line = line.strip()
        if not line:
            continue

        if line.lower().startswith("patient:") or line.lower().startswith("user:"):
            content = line.split(":", 1)[1].strip()
            turns.append({"role": "patient", "content": content})
        elif line.lower().startswith("ai:") or line.lower().startswith("agent:") or line.lower().startswith("assistant:"):
            content = line.split(":", 1)[1].strip()
            turns.append({"role": "ai", "content": content})
        else:
            # Continuation of previous turn or unknown format
            if turns:
                turns[-1]["content"] += " " + line
            else:
                turns.append({"role": "ai", "content": line})

    return turns


def generate_summary_placeholder(transcript: str | None) -> str:
    """Placeholder summary until Claude API key is configured."""
    if not transcript:
        return "No transcript available"

    # Simple extractive summary: first 200 chars
    clean = transcript.replace("\n", " ").strip()
    if len(clean) > 200:
        return clean[:200] + "..."
    return clean
