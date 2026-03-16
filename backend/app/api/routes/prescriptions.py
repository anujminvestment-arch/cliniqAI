import uuid as uuid_mod
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, datetime, timezone

from app.db.session import get_db
from app.models.prescription import Prescription
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.core.deps import get_current_user, CurrentUser, require_roles
from app.schemas.prescriptions import PrescriptionCreate, PrescriptionUpdate

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])


@router.get("")
async def list_prescriptions(
    patient_id: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Prescription, Doctor.name.label("doctor_name"), Patient.name.label("patient_name"))
        .join(Doctor, Prescription.doctor_id == Doctor.id)
        .join(Patient, Prescription.patient_id == Patient.id)
        .where(Prescription.clinic_id == user.clinic_id)
    )
    if patient_id:
        query = query.where(Prescription.patient_id == patient_id)
    # If patient role, only show their prescriptions
    if user.role == "patient":
        from app.models.patient import Patient as PatientModel
        patient_result = await db.execute(
            select(PatientModel.id).where(PatientModel.user_id == user.user_id, PatientModel.clinic_id == user.clinic_id)
        )
        pid = patient_result.scalar_one_or_none()
        if pid:
            query = query.where(Prescription.patient_id == pid)
    query = query.order_by(Prescription.date.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    return {
        "prescriptions": [
            {
                "id": str(rx.id),
                "prescription_code": rx.prescription_code,
                "doctor_name": dn,
                "patient_name": pn,
                "patient_id": str(rx.patient_id),
                "date": rx.date.isoformat(),
                "diagnosis": rx.diagnosis,
                "medications": rx.medications,
                "instructions": rx.instructions,
                "follow_up_date": rx.follow_up_date.isoformat() if rx.follow_up_date else None,
                "is_signed": rx.is_signed,
                "created_at": rx.created_at.isoformat() if rx.created_at else None,
            }
            for rx, dn, pn in rows
        ],
    }


@router.post("")
async def create_prescription(
    body: PrescriptionCreate,
    user: CurrentUser = Depends(require_roles("clinic_owner", "doctor")),
    db: AsyncSession = Depends(get_db),
):
    # Find the doctor record for this user
    result = await db.execute(
        select(Doctor).where(Doctor.user_id == user.user_id, Doctor.clinic_id == user.clinic_id)
    )
    doctor = result.scalar_one_or_none()
    if not doctor:
        # Fallback: clinic owner creating on behalf
        result = await db.execute(select(Doctor).where(Doctor.clinic_id == user.clinic_id).limit(1))
        doctor = result.scalar_one_or_none()
        if not doctor:
            raise HTTPException(status_code=400, detail="No doctor found")

    code = f"RX{uuid_mod.uuid4().hex[:6].upper()}"
    rx = Prescription(
        clinic_id=user.clinic_id,
        doctor_id=doctor.id,
        patient_id=body.patient_id,
        appointment_id=body.appointment_id,
        prescription_code=code,
        date=body.date,
        diagnosis=body.diagnosis,
        medications=[m.model_dump() for m in body.medications],
        instructions=body.instructions,
        follow_up_date=body.follow_up_date,
    )
    db.add(rx)
    await db.commit()
    await db.refresh(rx)
    return {"id": str(rx.id), "prescription_code": rx.prescription_code}


@router.put("/{prescription_id}")
async def update_prescription(
    prescription_id: str,
    body: PrescriptionUpdate,
    user: CurrentUser = Depends(require_roles("clinic_owner", "doctor")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Prescription).where(Prescription.id == prescription_id, Prescription.clinic_id == user.clinic_id)
    )
    rx = result.scalar_one_or_none()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    if body.diagnosis is not None:
        rx.diagnosis = body.diagnosis
    if body.medications is not None:
        rx.medications = [m.model_dump() for m in body.medications]
    if body.instructions is not None:
        rx.instructions = body.instructions
    if body.follow_up_date is not None:
        rx.follow_up_date = body.follow_up_date
    await db.commit()
    return {"id": str(rx.id), "prescription_code": rx.prescription_code}


@router.post("/{prescription_id}/sign")
async def sign_prescription(
    prescription_id: str,
    user: CurrentUser = Depends(require_roles("clinic_owner", "doctor")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Prescription).where(Prescription.id == prescription_id, Prescription.clinic_id == user.clinic_id)
    )
    rx = result.scalar_one_or_none()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    rx.is_signed = True
    rx.signed_at = datetime.now(timezone.utc)
    await db.commit()

    # Send notification to patient
    try:
        from app.services.notification_service import notify_prescription_ready
        patient_result = await db.execute(select(Patient).where(Patient.id == rx.patient_id))
        patient = patient_result.scalar_one_or_none()
        doctor_result = await db.execute(select(Doctor).where(Doctor.id == rx.doctor_id))
        doctor = doctor_result.scalar_one_or_none()
        if patient and doctor and patient.phone:
            await notify_prescription_ready(
                db, clinic_id=str(rx.clinic_id), patient_id=str(rx.patient_id),
                patient_phone=patient.phone, patient_name=patient.name,
                doctor_name=doctor.name, prescription_code=rx.prescription_code,
            )
    except Exception:
        pass  # Don't fail the sign operation if notification fails

    return {"id": str(rx.id), "is_signed": True}


@router.get("/{prescription_id}/pdf")
async def get_prescription_pdf(
    prescription_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from fastapi.responses import Response as FastAPIResponse
    from app.services.pdf_generator import generate_prescription_pdf
    from app.models.clinic import Clinic

    result = await db.execute(
        select(Prescription).where(Prescription.id == prescription_id, Prescription.clinic_id == user.clinic_id)
    )
    rx = result.scalar_one_or_none()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")

    # Get related data
    doctor_result = await db.execute(select(Doctor).where(Doctor.id == rx.doctor_id))
    doctor = doctor_result.scalar_one_or_none()
    patient_result = await db.execute(select(Patient).where(Patient.id == rx.patient_id))
    patient = patient_result.scalar_one_or_none()
    clinic_result = await db.execute(select(Clinic).where(Clinic.id == rx.clinic_id))
    clinic = clinic_result.scalar_one_or_none()

    if not doctor or not patient or not clinic:
        raise HTTPException(status_code=404, detail="Related data not found")

    # Calculate age
    patient_age = None
    if patient.date_of_birth:
        from datetime import date as date_type
        today = date_type.today()
        patient_age = str(today.year - patient.date_of_birth.year - (
            (today.month, today.day) < (patient.date_of_birth.month, patient.date_of_birth.day)
        ))

    pdf_bytes = generate_prescription_pdf(
        clinic_name=clinic.name,
        clinic_address=clinic.address,
        clinic_phone=clinic.phone,
        doctor_name=doctor.name,
        doctor_specialization=getattr(doctor, "specialization", None),
        doctor_qualification=getattr(doctor, "qualification", None),
        patient_name=patient.name,
        patient_age=patient_age,
        patient_gender=patient.gender,
        prescription_code=rx.prescription_code,
        date=rx.date.isoformat(),
        diagnosis=rx.diagnosis,
        medications=rx.medications or [],
        instructions=rx.instructions,
        follow_up_date=rx.follow_up_date.isoformat() if rx.follow_up_date else None,
        is_signed=rx.is_signed,
    )

    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="prescription_{rx.prescription_code}.pdf"'},
    )
