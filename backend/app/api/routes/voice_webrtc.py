"""WebRTC voice calling — AI receptionist powered by OpenAI GPT-4o-mini."""

import json
import base64
import logging
from datetime import date, datetime, time as time_type, timezone, timedelta
import random

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.core.config import settings
from app.models import (
    Doctor, Patient, Appointment, QueueEntry,
    SymptomSpecializationMap, Clinic, KnowledgeBase,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/voice-call", tags=["voice-call"])

# OpenAI client
try:
    import openai
    _openai = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
except ImportError:
    _openai = None


async def _get_clinic_context(db: AsyncSession, clinic_id: str) -> str:
    """Build clinic context for AI system prompt."""
    # Clinic info
    clinic_result = await db.execute(select(Clinic).where(Clinic.id == clinic_id))
    clinic = clinic_result.scalar_one_or_none()
    if not clinic:
        return "Clinic not found."

    # Doctors
    docs_result = await db.execute(
        select(Doctor).where(Doctor.clinic_id == clinic_id, Doctor.is_active == True)
    )
    doctors = docs_result.scalars().all()

    today = date.today()
    doctor_info = []
    for doc in doctors:
        q_count = (await db.execute(
            select(func.count()).where(
                QueueEntry.clinic_id == clinic_id,
                QueueEntry.doctor_id == doc.id,
                QueueEntry.date == today,
                QueueEntry.status.in_(["waiting", "in_progress"]),
            )
        )).scalar() or 0

        doctor_info.append(
            f"- {doc.name} ({doc.specialization}): Fee ₹{doc.consultation_fee}, "
            f"Experience {doc.experience_years}yrs, Rating {doc.avg_rating}/5, "
            f"Queue today: {q_count} patients, Wait ~{q_count * 15}min"
        )

    # KB entries
    kb_result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.clinic_id == clinic_id,
            KnowledgeBase.is_published == True,
        ).order_by(KnowledgeBase.priority.desc()).limit(15)
    )
    kb_entries = kb_result.scalars().all()
    kb_text = "\n".join([f"- {e.title}: {e.content[:200]}" for e in kb_entries])

    timings = ""
    if clinic.timings:
        for day, hours in clinic.timings.items():
            timings += f"  {day.capitalize()}: {hours.get('open', 'N/A')} - {hours.get('close', 'N/A')}\n"

    return f"""CLINIC: {clinic.name}
Address: {clinic.address or 'N/A'}
Phone: {clinic.phone or 'N/A'}
Timings:
{timings}
DOCTORS AVAILABLE TODAY:
{chr(10).join(doctor_info)}

KNOWLEDGE BASE:
{kb_text}
"""


def _build_system_prompt(clinic_context: str) -> str:
    return f"""You are the AI Voice Receptionist for an Indian medical clinic. You speak Hindi and English naturally — use Hinglish (Hindi words in English script) as patients typically speak this way.

{clinic_context}

YOUR CAPABILITIES:
1. Suggest the right doctor based on patient symptoms
2. Share doctor fees, availability, queue length, and estimated wait time
3. Help book appointments (collect patient name, phone, preferred doctor, date, time)
4. Check queue status — how many patients waiting, current token
5. Answer clinic questions — timings, location, parking, services, fees, insurance
6. Cancel or reschedule appointments

RULES:
- Be warm, professional, and empathetic
- Keep responses SHORT (2-3 sentences max) — this is voice, not text
- When patient describes symptoms, suggest the best doctor from the list above
- Always mention the consultation fee and current queue wait
- If patient wants to book, ask for their name and phone number
- Never provide medical advice — only route to the right doctor
- If you can't understand, ask the patient to repeat clearly
- Respond in the same language the patient uses (Hindi → Hindi, English → English)
- Use "Aap" (respectful) not "Tum"

AVAILABLE FUNCTIONS:
When you need to perform an action, include a JSON block in your response like this:
[ACTION: {{"action": "search_doctors", "symptoms": ["tooth pain"]}}]
[ACTION: {{"action": "book_appointment", "doctor_id": "xxx", "patient_name": "xxx", "patient_phone": "+91xxx", "date": "2026-03-20", "time": "10:00"}}]
[ACTION: {{"action": "check_queue", "doctor_id": "xxx"}}]

Only include an action if you actually need to perform one. For normal conversation, just respond naturally."""


async def _call_openai(messages: list[dict], system_prompt: str) -> str:
    """Call OpenAI GPT-4o-mini for conversation."""
    if not _openai:
        return "AI service not configured. Please type your query."

    try:
        response = await _openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system_prompt}] + messages,
            max_tokens=300,
            temperature=0.7,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        logger.error(f"OpenAI call failed: {e}")
        return "Maaf kijiye, abhi technical issue hai. Kya aap thodi der baad try kar sakte hain?"


async def _execute_action(db: AsyncSession, clinic_id: str, action_data: dict) -> str:
    """Execute an action from the AI's response and return result text."""
    action = action_data.get("action")
    today = date.today()

    if action == "search_doctors":
        symptoms = action_data.get("symptoms", [])
        specializations = set()

        for symptom in symptoms:
            result = await db.execute(
                select(SymptomSpecializationMap.specialization).where(
                    or_(
                        SymptomSpecializationMap.clinic_id == clinic_id,
                        SymptomSpecializationMap.clinic_id.is_(None),
                    ),
                    func.lower(SymptomSpecializationMap.symptom_keyword).contains(symptom.lower()),
                )
            )
            for row in result.scalars().all():
                specializations.add(row)

        if not specializations:
            specializations.add("General Physician")

        result = await db.execute(
            select(Doctor).where(
                Doctor.clinic_id == clinic_id,
                Doctor.is_active == True,
                Doctor.specialization.in_(specializations),
            )
        )
        doctors = result.scalars().all()
        if doctors:
            doc = doctors[0]
            q = (await db.execute(
                select(func.count()).where(
                    QueueEntry.clinic_id == clinic_id,
                    QueueEntry.doctor_id == doc.id,
                    QueueEntry.date == today,
                    QueueEntry.status.in_(["waiting", "in_progress"]),
                )
            )).scalar() or 0
            return f"Found: {doc.name} ({doc.specialization}), Fee ₹{doc.consultation_fee}, Queue: {q}, Wait: {q*15}min"
        return "No matching doctor found."

    elif action == "book_appointment":
        doctor_id = action_data.get("doctor_id")
        patient_name = action_data.get("patient_name", "Patient")
        patient_phone = action_data.get("patient_phone", "")
        appt_date = action_data.get("date", str(today))
        appt_time = action_data.get("time", "10:00")

        if not doctor_id:
            return "Doctor not selected. Please choose a doctor first."

        # Find or create patient
        patient_result = await db.execute(
            select(Patient).where(Patient.clinic_id == clinic_id, Patient.phone == patient_phone)
        )
        patient = patient_result.scalar_one_or_none()
        if not patient:
            code = f"PAT-{datetime.now().year}-{random.randint(1000, 9999)}"
            patient = Patient(
                clinic_id=clinic_id, name=patient_name, phone=patient_phone,
                registration_source="ai_call", unique_code=code,
            )
            db.add(patient)
            await db.flush()

        # Create appointment
        apt_code = f"APT-{datetime.now().year}-{random.randint(1000, 9999)}"
        appt = Appointment(
            clinic_id=clinic_id, doctor_id=doctor_id, patient_id=patient.id,
            appointment_code=apt_code, date=date.fromisoformat(appt_date),
            start_time=time_type.fromisoformat(appt_time + ":00" if len(appt_time) == 5 else appt_time),
            booking_source="ai_call",
        )
        db.add(appt)
        await db.flush()

        # Create queue entry
        max_token = (await db.execute(
            select(func.max(QueueEntry.token_number)).where(
                QueueEntry.clinic_id == clinic_id,
                QueueEntry.doctor_id == doctor_id,
                QueueEntry.date == date.fromisoformat(appt_date),
            )
        )).scalar() or 0

        q_count = (await db.execute(
            select(func.count()).where(
                QueueEntry.clinic_id == clinic_id,
                QueueEntry.doctor_id == doctor_id,
                QueueEntry.date == date.fromisoformat(appt_date),
                QueueEntry.status.in_(["waiting", "in_progress"]),
            )
        )).scalar() or 0

        queue_entry = QueueEntry(
            clinic_id=clinic_id, doctor_id=doctor_id, patient_id=patient.id,
            appointment_id=appt.id, date=date.fromisoformat(appt_date),
            token_number=max_token + 1, position=q_count + 1,
            estimated_wait=q_count * 15,
        )
        db.add(queue_entry)
        await db.commit()

        doc_result = await db.execute(select(Doctor.name).where(Doctor.id == doctor_id))
        doc_name = doc_result.scalar() or "Doctor"

        return f"BOOKED! Code: {apt_code}, Token #{max_token + 1}, Doctor: {doc_name}, Date: {appt_date}, Time: {appt_time}, Wait: ~{q_count * 15}min"

    elif action == "check_queue":
        doctor_id = action_data.get("doctor_id")
        conditions = [QueueEntry.clinic_id == clinic_id, QueueEntry.date == today, QueueEntry.status.in_(["waiting", "in_progress"])]
        if doctor_id:
            conditions.append(QueueEntry.doctor_id == doctor_id)

        q_count = (await db.execute(select(func.count()).where(*conditions))).scalar() or 0
        current = (await db.execute(
            select(QueueEntry.token_number).where(
                QueueEntry.clinic_id == clinic_id, QueueEntry.date == today, QueueEntry.status == "in_progress",
            ).limit(1)
        )).scalar()

        return f"Queue: {q_count} patients waiting. Current token: {current or 'None'}. Wait: ~{q_count * 15}min."

    return "Action not recognized."


@router.websocket("/ws/{clinic_id}")
async def voice_call_websocket(websocket: WebSocket, clinic_id: str):
    """WebSocket endpoint for AI-powered voice calling."""
    await websocket.accept()

    # Build context and conversation history
    conversation: list[dict] = []
    system_prompt = ""

    try:
        # Load clinic context
        async with AsyncSessionLocal() as db:
            clinic_context = await _get_clinic_context(db, clinic_id)
            system_prompt = _build_system_prompt(clinic_context)

        # Get AI greeting
        greeting_response = await _call_openai(
            [{"role": "user", "content": "Patient just connected. Greet them warmly in Hinglish."}],
            system_prompt,
        )
        # Clean any action tags from greeting
        greeting_clean = greeting_response.split("[ACTION")[0].strip()
        conversation.append({"role": "assistant", "content": greeting_clean})

        await websocket.send_json({"type": "response", "text": greeting_clean})
        await websocket.send_json({"type": "state", "state": "listening"})

        # Try TTS
        try:
            from app.services.sarvam_client import sarvam_client
            if sarvam_client.available:
                tts = await sarvam_client.text_to_speech(greeting_clean, language="hi-IN")
                if tts and "audios" in tts and tts["audios"]:
                    await websocket.send_json({"type": "audio", "data": tts["audios"][0], "format": "mp3"})
        except Exception as e:
            logger.warning(f"TTS failed: {e}")

        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            msg_type = msg.get("type")
            user_text = ""

            if msg_type == "text":
                user_text = msg.get("data", "").strip()
                if not user_text:
                    continue
                await websocket.send_json({"type": "transcript", "text": user_text})

            elif msg_type == "audio":
                await websocket.send_json({"type": "state", "state": "processing"})
                audio_bytes = base64.b64decode(msg.get("data", ""))
                if len(audio_bytes) < 1000:
                    await websocket.send_json({"type": "state", "state": "listening"})
                    continue
                try:
                    from app.services.whisper_client import whisper_client
                    if whisper_client.available:
                        result = await whisper_client.transcribe(audio_bytes=audio_bytes, filename="recording.webm")
                    else:
                        from app.services.stt_router import transcribe
                        result = await transcribe(audio_bytes=audio_bytes, filename="recording.webm")
                    user_text = result.get("text", "").strip()
                    if not user_text:
                        await websocket.send_json({"type": "state", "state": "listening"})
                        continue
                    await websocket.send_json({"type": "transcript", "text": user_text})
                except Exception as e:
                    logger.error(f"STT failed: {e}")
                    await websocket.send_json({"type": "response", "text": "Aawaz sunai nahi di. Please type karke bhejein."})
                    await websocket.send_json({"type": "state", "state": "listening"})
                    continue
            else:
                continue

            await websocket.send_json({"type": "state", "state": "processing"})

            # Add to conversation
            conversation.append({"role": "user", "content": user_text})

            # Call OpenAI
            ai_response = await _call_openai(conversation, system_prompt)

            # Check for actions in the response
            response_text = ai_response
            if "[ACTION:" in ai_response:
                parts = ai_response.split("[ACTION:")
                response_text = parts[0].strip()
                for part in parts[1:]:
                    try:
                        action_json = part.split("]")[0].strip()
                        action_data = json.loads(action_json)
                        async with AsyncSessionLocal() as db:
                            action_result = await _execute_action(db, clinic_id, action_data)
                        # Feed action result back to AI for natural response
                        conversation.append({"role": "assistant", "content": response_text})
                        conversation.append({"role": "system", "content": f"Action result: {action_result}"})
                        follow_up = await _call_openai(conversation, system_prompt)
                        response_text = follow_up.split("[ACTION")[0].strip()
                    except Exception as e:
                        logger.error(f"Action failed: {e}")

            conversation.append({"role": "assistant", "content": response_text})

            # Keep conversation manageable (last 20 messages)
            if len(conversation) > 20:
                conversation = conversation[-20:]

            await websocket.send_json({"type": "response", "text": response_text})

            # TTS
            try:
                from app.services.sarvam_client import sarvam_client
                if sarvam_client.available and len(response_text) < 500:
                    tts = await sarvam_client.text_to_speech(response_text, language="hi-IN")
                    if tts and "audios" in tts and tts["audios"]:
                        await websocket.send_json({"type": "audio", "data": tts["audios"][0], "format": "mp3"})
            except Exception as e:
                logger.warning(f"TTS failed: {e}")

            await websocket.send_json({"type": "state", "state": "listening"})

    except WebSocketDisconnect:
        logger.info(f"Voice call disconnected: {clinic_id}")
    except Exception as e:
        logger.error(f"Voice call error: {e}")
        try:
            await websocket.close()
        except Exception:
            pass
