import random
import logging
from datetime import date, datetime, time, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from app.db.session import get_db
from app.core.deps import verify_voice_api_key
from app.models import (
    Doctor, Patient, Appointment, QueueEntry,
    SymptomSpecializationMap, Clinic, KnowledgeBase,
    DoctorPatientRelationship,
)
from app.schemas.voice import (
    SearchDoctorsRequest, SearchDoctorsResponse, DoctorSuggestion,
    BookAppointmentRequest, BookAppointmentResponse,
    CheckQueueRequest, CheckQueueResponse,
    ClinicInfoRequest, ClinicInfoResponse,
    RegisterPatientRequest, RegisterPatientResponse,
    CancelAppointmentRequest, CancelAppointmentResponse,
    SimulateRequest,
)

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/search-doctors", response_model=SearchDoctorsResponse, dependencies=[Depends(verify_voice_api_key)])
async def search_doctors(body: SearchDoctorsRequest, db: AsyncSession = Depends(get_db)):
    clinic_id = body.clinic_id

    # Map symptoms to specializations
    specializations: set[str] = set()
    for symptom in body.symptoms:
        result = await db.execute(
            select(SymptomSpecializationMap.specialization, SymptomSpecializationMap.priority)
            .where(
                or_(
                    SymptomSpecializationMap.clinic_id == clinic_id,
                    SymptomSpecializationMap.clinic_id.is_(None),
                ),
                func.lower(SymptomSpecializationMap.symptom_keyword) == symptom.lower(),
            )
            .order_by(SymptomSpecializationMap.priority.desc())
        )
        rows = result.all()
        for row in rows:
            specializations.add(row.specialization)

    # If no match, default to General Physician
    if not specializations:
        specializations.add("General Physician")

    # Find matching doctors
    result = await db.execute(
        select(Doctor).where(
            Doctor.clinic_id == clinic_id,
            Doctor.is_active == True,
            Doctor.specialization.in_(specializations),
        )
    )
    doctors = result.scalars().all()

    today = date.today()
    suggestions: list[DoctorSuggestion] = []

    for doc in doctors:
        # Get queue info for today
        queue_result = await db.execute(
            select(func.count(), func.max(QueueEntry.token_number))
            .where(
                QueueEntry.clinic_id == clinic_id,
                QueueEntry.doctor_id == doc.id,
                QueueEntry.date == today,
                QueueEntry.status.in_(["waiting", "in_progress"]),
            )
        )
        queue_row = queue_result.one()
        queue_length = queue_row[0] or 0
        max_token = queue_row[1] or 0

        avg_wait = queue_length * 15  # 15 min per patient estimate

        # Ranking score
        rating = float(doc.avg_rating or 0)
        exp = doc.experience_years or 0
        score = (rating * 20) + (exp * 2) - (queue_length * 5)

        suggestions.append(DoctorSuggestion(
            doctor_id=doc.id,
            name=doc.name,
            specialization=doc.specialization,
            fee=float(doc.consultation_fee) if doc.consultation_fee else None,
            rating=rating,
            experience_years=exp,
            queue_length=queue_length,
            next_token=max_token + 1,
            estimated_wait=avg_wait,
            next_slot=None,
        ))

    # Sort by score descending
    suggestions.sort(
        key=lambda s: (float(s.rating) * 20 + (s.experience_years or 0) * 2 - s.queue_length * 5),
        reverse=True,
    )

    return SearchDoctorsResponse(doctors=suggestions)


@router.post("/book-appointment", response_model=BookAppointmentResponse, dependencies=[Depends(verify_voice_api_key)])
async def book_appointment(body: BookAppointmentRequest, db: AsyncSession = Depends(get_db)):
    clinic_id = body.clinic_id

    # Find or create patient
    result = await db.execute(
        select(Patient).where(Patient.clinic_id == clinic_id, Patient.phone == body.patient_phone)
    )
    patient = result.scalar_one_or_none()

    if not patient:
        code = f"PAT-{datetime.now().year}-{random.randint(1000, 9999)}"
        patient = Patient(
            clinic_id=clinic_id,
            name=body.patient_name,
            phone=body.patient_phone,
            registration_source="ai_call",
            unique_code=code,
        )
        db.add(patient)
        await db.flush()

    # Verify doctor exists
    result = await db.execute(select(Doctor).where(Doctor.id == body.doctor_id, Doctor.clinic_id == clinic_id))
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Check slot availability
    appt_date = date.fromisoformat(body.date)
    appt_time = time.fromisoformat(body.start_time)

    result = await db.execute(
        select(Appointment).where(
            Appointment.clinic_id == clinic_id,
            Appointment.doctor_id == body.doctor_id,
            Appointment.date == appt_date,
            Appointment.start_time == appt_time,
            Appointment.status.notin_(["cancelled"]),
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Slot already booked")

    # Generate appointment code
    apt_code = f"APT-{datetime.now().year}-{random.randint(1000, 9999)}"

    # Create appointment
    appointment = Appointment(
        clinic_id=clinic_id,
        doctor_id=body.doctor_id,
        patient_id=patient.id,
        appointment_code=apt_code,
        date=appt_date,
        start_time=appt_time,
        booking_source="ai_call",
        symptoms_summary=body.symptoms,
    )
    db.add(appointment)
    await db.flush()

    # Calculate next token
    result = await db.execute(
        select(func.max(QueueEntry.token_number)).where(
            QueueEntry.clinic_id == clinic_id,
            QueueEntry.doctor_id == body.doctor_id,
            QueueEntry.date == appt_date,
        )
    )
    max_token = result.scalar() or 0
    next_token = max_token + 1

    # Count waiting patients for position
    result = await db.execute(
        select(func.count()).where(
            QueueEntry.clinic_id == clinic_id,
            QueueEntry.doctor_id == body.doctor_id,
            QueueEntry.date == appt_date,
            QueueEntry.status.in_(["waiting", "in_progress"]),
        )
    )
    waiting_count = result.scalar() or 0
    estimated_wait = waiting_count * 15

    # Create queue entry
    queue_entry = QueueEntry(
        clinic_id=clinic_id,
        doctor_id=body.doctor_id,
        patient_id=patient.id,
        appointment_id=appointment.id,
        date=appt_date,
        token_number=next_token,
        position=waiting_count + 1,
        estimated_wait=estimated_wait,
    )
    db.add(queue_entry)

    # Update doctor-patient relationship
    result = await db.execute(
        select(DoctorPatientRelationship).where(
            DoctorPatientRelationship.clinic_id == clinic_id,
            DoctorPatientRelationship.doctor_id == body.doctor_id,
            DoctorPatientRelationship.patient_id == patient.id,
        )
    )
    dpr = result.scalar_one_or_none()
    if dpr:
        dpr.total_visits += 1
        dpr.last_visit = datetime.now(timezone.utc)
    else:
        db.add(DoctorPatientRelationship(
            clinic_id=clinic_id,
            doctor_id=body.doctor_id,
            patient_id=patient.id,
        ))

    await db.commit()

    return BookAppointmentResponse(
        appointment_code=apt_code,
        token_number=next_token,
        estimated_wait=estimated_wait,
        doctor_name=doctor.name,
        fee=float(doctor.consultation_fee) if doctor.consultation_fee else None,
        date=body.date,
        time=body.start_time,
    )


@router.post("/check-queue", response_model=CheckQueueResponse, dependencies=[Depends(verify_voice_api_key)])
async def check_queue(body: CheckQueueRequest, db: AsyncSession = Depends(get_db)):
    clinic_id = body.clinic_id
    today = date.today()

    conditions = [
        QueueEntry.clinic_id == clinic_id,
        QueueEntry.date == today,
        QueueEntry.status.in_(["waiting", "in_progress"]),
    ]
    if body.doctor_id:
        conditions.append(QueueEntry.doctor_id == body.doctor_id)

    # Queue length
    result = await db.execute(select(func.count()).where(*conditions))
    queue_length = result.scalar() or 0

    # Current token being served
    result = await db.execute(
        select(QueueEntry.token_number).where(
            QueueEntry.clinic_id == clinic_id,
            QueueEntry.date == today,
            QueueEntry.status == "in_progress",
            *([QueueEntry.doctor_id == body.doctor_id] if body.doctor_id else []),
        ).limit(1)
    )
    current_token = result.scalar()

    # Patient position
    patient_position = None
    if body.patient_phone:
        result = await db.execute(
            select(Patient.id).where(Patient.clinic_id == clinic_id, Patient.phone == body.patient_phone)
        )
        patient = result.scalar_one_or_none()
        if patient:
            result = await db.execute(
                select(QueueEntry.position).where(
                    QueueEntry.clinic_id == clinic_id,
                    QueueEntry.date == today,
                    QueueEntry.patient_id == patient,
                    QueueEntry.status == "waiting",
                ).limit(1)
            )
            patient_position = result.scalar()

    return CheckQueueResponse(
        queue_length=queue_length,
        patient_position=patient_position,
        estimated_wait=patient_position * 15 if patient_position else None,
        current_token=current_token,
    )


@router.post("/clinic-info", response_model=ClinicInfoResponse, dependencies=[Depends(verify_voice_api_key)])
async def clinic_info(body: ClinicInfoRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Clinic).where(Clinic.id == body.clinic_id))
    clinic = result.scalar_one_or_none()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    answer = None
    if body.query:
        # Try semantic search via embeddings first
        try:
            from app.services.embedding_service import search_knowledge_base
            results = await search_knowledge_base(db, str(body.clinic_id), body.query, limit=3)
            if results:
                answer = results[0]["content_text"]
                if len(results) > 1 and results[1].get("similarity", 0) > 0.5:
                    answer += "\n\n" + results[1]["content_text"]
        except Exception:
            pass

        # Fallback to keyword search if embedding search returns nothing
        if not answer:
            try:
                result = await db.execute(
                    select(KnowledgeBase).where(
                        or_(KnowledgeBase.clinic_id == body.clinic_id, KnowledgeBase.clinic_id.is_(None)),
                        KnowledgeBase.is_published == True,
                    )
                )
                kb_entries = result.scalars().all()
                query_lower = body.query.lower()
                for entry in kb_entries:
                    if any(word in entry.title.lower() or word in entry.content.lower()
                           for word in query_lower.split()):
                        answer = entry.content
                        break
            except Exception:
                pass

    return ClinicInfoResponse(
        name=clinic.name,
        address=clinic.address,
        phone=clinic.phone,
        timings=clinic.timings,
        answer=answer,
    )


@router.post("/register-patient", response_model=RegisterPatientResponse, dependencies=[Depends(verify_voice_api_key)])
async def register_patient(body: RegisterPatientRequest, db: AsyncSession = Depends(get_db)):
    clinic_id = body.clinic_id

    # Check existing
    result = await db.execute(
        select(Patient).where(Patient.clinic_id == clinic_id, Patient.phone == body.phone)
    )
    existing = result.scalar_one_or_none()
    if existing:
        return RegisterPatientResponse(
            patient_id=existing.id,
            unique_code=existing.unique_code or "",
            is_new=False,
            name=existing.name,
        )

    code = f"PAT-{datetime.now().year}-{random.randint(1000, 9999)}"
    patient = Patient(
        clinic_id=clinic_id,
        name=body.name,
        phone=body.phone,
        date_of_birth=date.fromisoformat(body.date_of_birth) if body.date_of_birth else None,
        gender=body.gender,
        registration_source="ai_call",
        unique_code=code,
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)

    return RegisterPatientResponse(
        patient_id=patient.id,
        unique_code=code,
        is_new=True,
        name=patient.name,
    )


@router.post("/cancel-appointment", response_model=CancelAppointmentResponse, dependencies=[Depends(verify_voice_api_key)])
async def cancel_appointment(body: CancelAppointmentRequest, db: AsyncSession = Depends(get_db)):
    clinic_id = body.clinic_id

    appointment = None
    if body.appointment_code:
        result = await db.execute(
            select(Appointment).where(
                Appointment.clinic_id == clinic_id,
                Appointment.appointment_code == body.appointment_code,
                Appointment.status.notin_(["cancelled", "completed"]),
            )
        )
        appointment = result.scalar_one_or_none()
    elif body.patient_phone:
        result = await db.execute(
            select(Patient.id).where(Patient.clinic_id == clinic_id, Patient.phone == body.patient_phone)
        )
        patient_id = result.scalar_one_or_none()
        if patient_id:
            result = await db.execute(
                select(Appointment).where(
                    Appointment.clinic_id == clinic_id,
                    Appointment.patient_id == patient_id,
                    Appointment.status.notin_(["cancelled", "completed"]),
                    Appointment.date >= date.today(),
                ).order_by(Appointment.date, Appointment.start_time).limit(1)
            )
            appointment = result.scalar_one_or_none()

    if not appointment:
        return CancelAppointmentResponse(success=False, appointment_code=None, message="No appointment found to cancel")

    appointment.status = "cancelled"

    # Remove queue entry
    result = await db.execute(
        select(QueueEntry).where(QueueEntry.appointment_id == appointment.id)
    )
    queue_entry = result.scalar_one_or_none()
    if queue_entry:
        await db.delete(queue_entry)

    await db.commit()

    return CancelAppointmentResponse(
        success=True,
        appointment_code=appointment.appointment_code,
        message=f"Appointment {appointment.appointment_code} has been cancelled",
    )


@router.post("/simulate")
async def simulate(body: SimulateRequest, db: AsyncSession = Depends(get_db)):
    """Test endpoint — mimics Sarvam Samvaad tool-call flow without real telephony."""
    action_map = {
        "search_doctors": search_doctors,
        "book_appointment": book_appointment,
        "check_queue": check_queue,
        "clinic_info": clinic_info,
        "register_patient": register_patient,
        "cancel_appointment": cancel_appointment,
    }

    handler = action_map.get(body.action)
    if not handler:
        raise HTTPException(status_code=400, detail=f"Unknown action: {body.action}")

    # Build the request model based on action
    schema_map = {
        "search_doctors": SearchDoctorsRequest,
        "book_appointment": BookAppointmentRequest,
        "check_queue": CheckQueueRequest,
        "clinic_info": ClinicInfoRequest,
        "register_patient": RegisterPatientRequest,
        "cancel_appointment": CancelAppointmentRequest,
    }

    schema = schema_map[body.action]
    params = {**body.params, "clinic_id": str(body.clinic_id)}
    request_body = schema(**params)

    return await handler(body=request_body, db=db)


# ── STT/TTS Provider Routing Endpoints ───────────────────────────

@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    caller_phone: str = Form(default=""),
    language: str = Form(default=""),
    db: AsyncSession = Depends(get_db),
):
    """Transcribe audio — auto-routes to Sarvam (Indian) or Whisper (global).

    - Indian callers (+91): Sarvam Saaras v3 (best Hindi/regional accuracy)
    - Global callers: OpenAI Whisper (57 languages)

    Upload audio file (mp3, wav, m4a, webm, ogg, flac).
    """
    from app.services.stt_router import transcribe

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")

    result = await transcribe(
        audio_bytes=audio_bytes,
        caller_phone=caller_phone or None,
        language=language or None,
        filename=audio.filename or "audio.wav",
    )
    return result


@router.post("/translate-audio")
async def translate_audio_to_english(
    audio: UploadFile = File(...),
    caller_phone: str = Form(default=""),
    language: str = Form(default=""),
):
    """Transcribe + translate audio to English.

    Works for any language — Hindi, Tamil, Spanish, French, etc.
    """
    from app.services.stt_router import translate_to_english

    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")

    return await translate_to_english(
        audio_bytes=audio_bytes,
        caller_phone=caller_phone or None,
        language=language or None,
        filename=audio.filename or "audio.wav",
    )


@router.post("/tts")
async def text_to_speech_endpoint(
    text: str = Form(...),
    language: str = Form(default="en-IN"),
    caller_phone: str = Form(default=""),
    speaker: str = Form(default=""),
):
    """Convert text to speech — auto-routes to Sarvam (Indian) or OpenAI (global).

    Indian languages: Sarvam Bulbul v3 (30+ Indian voices)
    Global: OpenAI TTS (alloy, echo, fable, onyx, nova, shimmer)
    """
    from app.services.stt_router import text_to_speech
    from fastapi.responses import Response

    result = await text_to_speech(
        text=text,
        language=language,
        caller_phone=caller_phone or None,
        speaker=speaker or None,
    )

    if result["provider"] == "whisper" and isinstance(result["audio"], bytes):
        return Response(content=result["audio"], media_type="audio/mpeg")

    # Sarvam returns JSON with base64 audio
    return result


@router.post("/detect-language")
async def detect_language_endpoint(
    text: str = Form(default=""),
    caller_phone: str = Form(default=""),
):
    """Detect language from text or phone number.

    Uses Sarvam Language Detection API for Indian languages.
    Falls back to phone-number inference.
    """
    from app.services.stt_router import detect_language

    return await detect_language(
        text=text or None,
        caller_phone=caller_phone or None,
    )


@router.get("/providers")
async def list_providers():
    """Show which STT/TTS providers are configured and available."""
    from app.services.sarvam_client import sarvam_client, SARVAM_LANGUAGES
    from app.services.whisper_client import whisper_client, WHISPER_LANGUAGES

    return {
        "sarvam": {
            "available": sarvam_client.available,
            "use_for": "Indian callers (+91)",
            "stt_model": "saaras:v3",
            "tts_model": "bulbul:v3",
            "languages": list(SARVAM_LANGUAGES.keys()),
            "features": [
                "STT (batch + streaming)",
                "TTS (30+ voices)",
                "Translation (22 Indian languages)",
                "Transliteration",
                "Language Detection",
                "Samvaad Voice Agent",
            ],
        },
        "whisper": {
            "available": whisper_client.available,
            "use_for": "Global callers (non-Indian)",
            "stt_models": ["whisper-1", "gpt-4o-transcribe", "gpt-4o-mini-transcribe", "gpt-4o-transcribe-diarize"],
            "tts_models": ["tts-1", "tts-1-hd"],
            "languages": len(WHISPER_LANGUAGES),
            "features": [
                "STT (57 languages)",
                "Translation to English",
                "Speaker Diarization",
                "TTS (6 voices)",
                "Timestamps (word + segment)",
            ],
        },
        "routing": {
            "indian_callers": "Sarvam AI (best Indian language accuracy)",
            "global_callers": "OpenAI Whisper (57 languages)",
            "fallback": "If primary provider fails, falls back to the other",
        },
    }
