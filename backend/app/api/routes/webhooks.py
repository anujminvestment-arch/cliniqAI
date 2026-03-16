import hmac
import hashlib

from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.config import settings
from app.models import Clinic, Patient

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/exotel")
async def exotel_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Receive incoming call notification from Exotel and route to Sarvam Samvaad agent."""
    form_data = await request.form()
    caller = form_data.get("From", "")
    called_number = form_data.get("To", "")
    call_sid = form_data.get("CallSid", "")

    # Look up clinic by phone number
    result = await db.execute(select(Clinic).where(Clinic.phone == called_number))
    clinic = result.scalar_one_or_none()

    if not clinic:
        return {
            "status": "error",
            "message": "Clinic not found for this number",
        }

    # Check if caller is an existing patient
    result = await db.execute(
        select(Patient).where(Patient.clinic_id == clinic.id, Patient.phone == caller)
    )
    patient = result.scalar_one_or_none()

    patient_context = ""
    if patient:
        patient_context = f"Returning patient: {patient.name} (ID: {patient.unique_code})"

    # Route to Sarvam Samvaad agent
    return {
        "clinic_id": str(clinic.id),
        "clinic_name": clinic.name,
        "caller": caller,
        "call_sid": call_sid,
        "patient_context": patient_context,
        "status": "routed_to_sarvam",
    }


@router.post("/sarvam")
async def sarvam_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Receive post-call data from Sarvam Samvaad after call ends."""
    # Validate webhook signature
    body = await request.body()
    signature = request.headers.get("x-sarvam-signature", "")

    if settings.SARVAM_WEBHOOK_SECRET:
        expected = hmac.new(
            settings.SARVAM_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()

    # Sarvam Samvaad post-call payload
    call_id = payload.get("call_id")
    recording_url = payload.get("recording_url")
    transcript = payload.get("transcript")
    duration = payload.get("duration")
    status = payload.get("status")
    extracted_data = payload.get("extracted_data", {})
    language = payload.get("language", "hi")

    # Determine clinic from metadata
    clinic_id = payload.get("metadata", {}).get("clinic_id")
    caller_phone = payload.get("metadata", {}).get("caller_phone")

    if not clinic_id:
        raise HTTPException(status_code=400, detail="Missing clinic_id in metadata")

    # Process call data (inline for now; use ARQ/Redis queue in production)
    from app.workers.call_processor import process_call_data

    await process_call_data(
        db=db,
        execution_id=call_id,
        clinic_id=clinic_id,
        caller_phone=caller_phone,
        recording_url=recording_url,
        transcript=transcript,
        duration=duration,
        extracted_data=extracted_data,
        language=language,
        stt_provider="sarvam",
    )

    return {"status": "ok"}
