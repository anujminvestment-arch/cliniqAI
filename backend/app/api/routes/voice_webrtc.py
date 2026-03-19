"""WebRTC-style in-app voice calling — patient talks to AI via browser mic."""

import json
import base64
import logging
from datetime import date, datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models import Doctor, Patient, Appointment, QueueEntry, SymptomSpecializationMap, Clinic, KnowledgeBase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/voice-call", tags=["voice-call"])


def _build_ai_response(intent: str, data: dict) -> str:
    """Build natural language response based on intent and data."""
    if intent == "greeting":
        return "Namaste! City Dental and Multi-Specialty Clinic mein aapka swagat hai. Main aapki kaise madad kar sakta hoon? Aap Hindi ya English mein baat kar sakte hain."

    elif intent == "doctors_found":
        docs = data.get("doctors", [])
        if not docs:
            return "Sorry, is taklif ke liye humare clinic mein koi specialist available nahi hai. Kya aap kuch aur batana chahenge?"
        doc = docs[0]
        resp = f"Aapki taklif ke liye {doc['name']} best rahenge. "
        resp += f"Unki specialization {doc['specialization']} hai. "
        resp += f"Consultation fee {doc['fee']} rupees hai. "
        if doc.get("queue_length", 0) > 0:
            resp += f"Abhi unke paas {doc['queue_length']} patient queue mein hain, lagbhag {doc['estimated_wait']} minute ka wait hoga. "
        else:
            resp += "Abhi koi queue nahi hai, aap turant mil sakte hain. "
        resp += "Kya aap appointment book karna chahenge?"
        return resp

    elif intent == "appointment_booked":
        return (
            f"Aapka appointment book ho gaya hai! Aapka token number {data.get('token_number')} hai. "
            f"Aapka estimated wait time {data.get('estimated_wait')} minutes hai. "
            f"Doctor {data.get('doctor_name')} aapko dekhenge. Dhanyavaad!"
        )

    elif intent == "queue_status":
        if data.get("patient_position"):
            return (
                f"Aapki queue position {data['patient_position']} hai. "
                f"Aapke aage {data['patient_position'] - 1} patient hain. "
                f"Estimated wait {data.get('estimated_wait', 'unknown')} minutes hai."
            )
        return (
            f"Abhi queue mein {data.get('queue_length', 0)} patient hain. "
            f"Current token {data.get('current_token', 'N/A')} chal raha hai."
        )

    elif intent == "clinic_info":
        return data.get("answer", "Yeh information abhi available nahi hai. Kya aap kuch aur jaanna chahenge?")

    elif intent == "ask_symptoms":
        return "Aapko kya taklif hai? Please apni problem batayein, main aapke liye sahi doctor suggest karunga."

    elif intent == "ask_name_phone":
        return "Appointment book karne ke liye aapka naam aur phone number chahiye. Pehle aapka naam batayein."

    elif intent == "confirmed":
        return "Theek hai, main aapka appointment book kar raha hoon. Ek minute ruken."

    elif intent == "goodbye":
        return "Dhanyavaad! Aapka din shubh ho. Agar koi aur sawal ho toh humein zaroor call karein."

    elif intent == "not_understood":
        return (
            "Maaf kijiye, main samajh nahi paaya. Kya aap dobara bata sakte hain? "
            "Aap bol sakte hain: appointment book karna hai, queue status, ya clinic ki information chahiye."
        )

    return "Main aapki madad ke liye yahan hoon. Kya aap appointment book karna chahenge ya kuch aur jaanna chahenge?"


def _detect_intent(text: str) -> tuple[str, dict]:
    """Simple intent detection from transcribed text."""
    text_lower = text.lower().strip()

    # Greeting
    greetings = ["hello", "hi", "namaste", "namaskar", "haan", "yes"]
    if any(g == text_lower or text_lower.startswith(g + " ") for g in greetings):
        return "greeting", {}

    # Goodbye
    goodbyes = ["bye", "thank", "dhanyavaad", "shukriya", "ok bye", "theek hai"]
    if any(g in text_lower for g in goodbyes):
        return "goodbye", {}

    # Queue check
    queue_words = ["queue", "token", "wait", "kitna time", "kab tak", "mera number", "status", "position"]
    if any(w in text_lower for w in queue_words):
        return "check_queue", {}

    # Booking intent
    book_words = ["book", "appointment", "milna", "dikhana", "doctor", "time", "slot"]
    if any(w in text_lower for w in book_words):
        return "want_booking", {}

    # Confirmation
    confirm_words = ["haan", "yes", "ok", "theek", "kar do", "book kar", "confirmed", "sure"]
    if any(w in text_lower for w in confirm_words):
        return "confirm", {}

    # Clinic info
    info_words = ["timing", "address", "location", "parking", "insurance", "fee", "charges", "kab", "kahan"]
    if any(w in text_lower for w in info_words):
        return "clinic_info", {"query": text}

    # Symptoms (default — treat as symptom description)
    return "symptoms", {"symptoms_text": text}


async def _search_doctors_for_symptoms(db: AsyncSession, clinic_id: str, symptoms_text: str) -> list[dict]:
    """Find doctors matching symptoms."""
    words = symptoms_text.lower().split()
    specializations = set()

    for word in words:
        result = await db.execute(
            select(SymptomSpecializationMap.specialization).where(
                or_(
                    SymptomSpecializationMap.clinic_id == clinic_id,
                    SymptomSpecializationMap.clinic_id.is_(None),
                ),
                func.lower(SymptomSpecializationMap.symptom_keyword).contains(word),
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

    today = date.today()
    doctor_list = []
    for doc in doctors:
        queue_result = await db.execute(
            select(func.count()).where(
                QueueEntry.clinic_id == clinic_id,
                QueueEntry.doctor_id == doc.id,
                QueueEntry.date == today,
                QueueEntry.status.in_(["waiting", "in_progress"]),
            )
        )
        queue_length = queue_result.scalar() or 0

        doctor_list.append(
            {
                "id": str(doc.id),
                "name": doc.name,
                "specialization": doc.specialization,
                "fee": float(doc.consultation_fee) if doc.consultation_fee else None,
                "queue_length": queue_length,
                "estimated_wait": queue_length * 15,
            }
        )

    doctor_list.sort(key=lambda d: (float(d.get("fee", 0) or 0)), reverse=False)
    return doctor_list


@router.websocket("/ws/{clinic_id}")
async def voice_call_websocket(websocket: WebSocket, clinic_id: str):
    """WebSocket endpoint for browser-based voice calling.

    Protocol:
    Client sends: {"type": "audio", "data": "<base64 audio chunk>", "format": "webm"}
                  {"type": "text", "data": "typed message"}  (fallback text input)
                  {"type": "end_turn"} (user finished speaking)

    Server sends: {"type": "transcript", "text": "what user said"}
                  {"type": "response", "text": "AI response text"}
                  {"type": "audio", "data": "<base64 audio>", "format": "mp3"}
                  {"type": "state", "state": "listening|processing|speaking"}
                  {"type": "doctors", "data": [...]} (doctor suggestions)
                  {"type": "booked", "data": {...}} (appointment confirmed)
    """
    await websocket.accept()

    # Conversation state
    state = {
        "clinic_id": clinic_id,
        "language": "hi-IN",
        "suggested_doctor": None,
        "patient_name": None,
        "patient_phone": None,
        "turn": 0,
    }

    try:
        # Send greeting
        greeting = _build_ai_response("greeting", {})
        await websocket.send_json({"type": "response", "text": greeting})
        await websocket.send_json({"type": "state", "state": "listening"})

        # Try to generate TTS for greeting
        try:
            from app.services.sarvam_client import sarvam_client

            if sarvam_client.available:
                tts_result = await sarvam_client.text_to_speech(greeting, language="hi-IN")
                if tts_result and "audios" in tts_result and tts_result["audios"]:
                    await websocket.send_json(
                        {
                            "type": "audio",
                            "data": tts_result["audios"][0],
                            "format": "mp3",
                        }
                    )
        except Exception as e:
            logger.warning(f"TTS greeting failed: {e}")

        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            msg_type = msg.get("type")

            if msg_type == "text":
                # Direct text input (typed or pre-transcribed)
                user_text = msg.get("data", "").strip()
                if not user_text:
                    continue

                await websocket.send_json({"type": "transcript", "text": user_text})
                await websocket.send_json({"type": "state", "state": "processing"})

            elif msg_type == "audio":
                # Audio chunk — transcribe with Whisper (handles WebM from browser)
                await websocket.send_json({"type": "state", "state": "processing"})
                audio_b64 = msg.get("data", "")
                audio_bytes = base64.b64decode(audio_b64)

                if len(audio_bytes) < 1000:
                    # Too short, probably noise
                    await websocket.send_json({"type": "state", "state": "listening"})
                    continue

                try:
                    # Use Whisper directly for WebM from browser (Sarvam doesn't accept WebM)
                    from app.services.whisper_client import whisper_client
                    if whisper_client.available:
                        result = await whisper_client.transcribe(
                            audio_bytes=audio_bytes,
                            filename="recording.webm",
                            language="hi",  # Default to Hindi, Whisper auto-detects
                        )
                    else:
                        # Fallback to Sarvam (needs audio URL, not bytes for some formats)
                        from app.services.stt_router import transcribe
                        result = await transcribe(
                            audio_bytes=audio_bytes,
                            language=state["language"],
                            filename="recording.webm",
                        )
                    user_text = result.get("text", "").strip()
                    if not user_text:
                        await websocket.send_json({"type": "state", "state": "listening"})
                        continue
                    await websocket.send_json({"type": "transcript", "text": user_text})
                except Exception as e:
                    logger.error(f"STT failed: {e}")
                    await websocket.send_json(
                        {"type": "response", "text": "Maaf kijiye, aawaz sunai nahi di. Kya aap text type karke bhej sakte hain?"}
                    )
                    await websocket.send_json({"type": "state", "state": "listening"})
                    continue
            else:
                continue

            # Process the user's text
            state["turn"] += 1
            intent, intent_data = _detect_intent(user_text)
            response_text = ""
            extra_data = {}

            async with AsyncSessionLocal() as db:
                if intent == "greeting":
                    response_text = _build_ai_response("ask_symptoms", {})

                elif intent == "symptoms":
                    doctors = await _search_doctors_for_symptoms(
                        db, clinic_id, intent_data.get("symptoms_text", "")
                    )
                    state["suggested_doctor"] = doctors[0] if doctors else None
                    response_text = _build_ai_response("doctors_found", {"doctors": doctors})
                    if doctors:
                        extra_data = {"type": "doctors", "data": doctors}

                elif intent == "want_booking":
                    if state["suggested_doctor"]:
                        response_text = "Aapka naam aur phone number batayein, main appointment book kar dunga."
                    else:
                        response_text = _build_ai_response("ask_symptoms", {})

                elif intent == "confirm":
                    if state["suggested_doctor"]:
                        response_text = _build_ai_response(
                            "appointment_booked",
                            {
                                "token_number": 1,
                                "estimated_wait": state["suggested_doctor"].get("estimated_wait", 0),
                                "doctor_name": state["suggested_doctor"].get("name", ""),
                            },
                        )
                    else:
                        response_text = _build_ai_response("ask_symptoms", {})

                elif intent == "check_queue":
                    queue_count = (
                        await db.execute(
                            select(func.count()).where(
                                QueueEntry.clinic_id == clinic_id,
                                QueueEntry.date == date.today(),
                                QueueEntry.status.in_(["waiting", "in_progress"]),
                            )
                        )
                    ).scalar() or 0

                    current = (
                        await db.execute(
                            select(QueueEntry.token_number)
                            .where(
                                QueueEntry.clinic_id == clinic_id,
                                QueueEntry.date == date.today(),
                                QueueEntry.status == "in_progress",
                            )
                            .limit(1)
                        )
                    ).scalar()

                    response_text = _build_ai_response(
                        "queue_status",
                        {
                            "queue_length": queue_count,
                            "current_token": current,
                        },
                    )

                elif intent == "clinic_info":
                    query = intent_data.get("query", "")
                    result = await db.execute(
                        select(KnowledgeBase).where(
                            or_(KnowledgeBase.clinic_id == clinic_id, KnowledgeBase.clinic_id.is_(None)),
                            KnowledgeBase.is_published == True,
                        )
                    )
                    kb_entries = result.scalars().all()
                    answer = None
                    for entry in kb_entries:
                        if any(
                            w in entry.title.lower() or w in entry.content.lower()
                            for w in query.lower().split()
                        ):
                            answer = entry.content
                            break
                    response_text = _build_ai_response("clinic_info", {"answer": answer})

                elif intent == "goodbye":
                    response_text = _build_ai_response("goodbye", {})

                else:
                    response_text = _build_ai_response("not_understood", {})

            # Send text response
            await websocket.send_json({"type": "response", "text": response_text})

            # Send extra data if any
            if extra_data:
                await websocket.send_json(extra_data)

            # Generate TTS
            try:
                from app.services.sarvam_client import sarvam_client

                if sarvam_client.available:
                    tts_result = await sarvam_client.text_to_speech(
                        response_text, language=state["language"]
                    )
                    if tts_result and "audios" in tts_result and tts_result["audios"]:
                        await websocket.send_json(
                            {
                                "type": "audio",
                                "data": tts_result["audios"][0],
                                "format": "mp3",
                            }
                        )
            except Exception as e:
                logger.warning(f"TTS failed: {e}")

            await websocket.send_json({"type": "state", "state": "listening"})

            # Close if goodbye
            if intent == "goodbye":
                await websocket.close()
                break

    except WebSocketDisconnect:
        logger.info(f"Voice call disconnected for clinic {clinic_id}")
    except Exception as e:
        logger.error(f"Voice call error: {e}")
        try:
            await websocket.close()
        except Exception:
            pass
