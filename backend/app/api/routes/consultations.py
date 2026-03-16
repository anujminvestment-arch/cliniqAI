from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from app.db.session import get_db
from app.models.consultation import ConsultationNote
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.core.deps import get_current_user, CurrentUser, require_roles

router = APIRouter(prefix="/consultations", tags=["consultations"])


@router.get("")
async def list_consultations(
    patient_id: str | None = None,
    doctor_id: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(ConsultationNote, Doctor.name.label("doctor_name"), Patient.name.label("patient_name"))
        .join(Doctor, ConsultationNote.doctor_id == Doctor.id)
        .join(Patient, ConsultationNote.patient_id == Patient.id)
        .where(ConsultationNote.clinic_id == user.clinic_id)
    )
    if patient_id:
        query = query.where(ConsultationNote.patient_id == patient_id)
    if doctor_id:
        query = query.where(ConsultationNote.doctor_id == doctor_id)
    if user.role == "patient":
        patient_result = await db.execute(
            select(Patient.id).where(Patient.user_id == user.user_id, Patient.clinic_id == user.clinic_id)
        )
        pid = patient_result.scalar_one_or_none()
        if pid:
            query = query.where(ConsultationNote.patient_id == pid)
    query = query.order_by(ConsultationNote.date.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    return {
        "consultations": [
            {
                "id": str(c.id),
                "doctor_name": dn,
                "patient_name": pn,
                "patient_id": str(c.patient_id),
                "date": c.date.isoformat(),
                "chief_complaint": c.chief_complaint,
                "subjective": c.subjective,
                "objective": c.objective,
                "assessment": c.assessment,
                "plan": c.plan,
                "vitals": c.vitals,
                "follow_up_date": c.follow_up_date.isoformat() if c.follow_up_date else None,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c, dn, pn in rows
        ],
    }


@router.post("")
async def create_consultation(
    body: dict,
    user: CurrentUser = Depends(require_roles("clinic_owner", "doctor")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Doctor).where(Doctor.user_id == user.user_id, Doctor.clinic_id == user.clinic_id)
    )
    doctor = result.scalar_one_or_none()
    if not doctor:
        result = await db.execute(select(Doctor).where(Doctor.clinic_id == user.clinic_id).limit(1))
        doctor = result.scalar_one_or_none()
        if not doctor:
            raise HTTPException(status_code=400, detail="No doctor found")

    note = ConsultationNote(
        clinic_id=user.clinic_id,
        doctor_id=doctor.id,
        patient_id=body["patient_id"],
        appointment_id=body.get("appointment_id"),
        date=body.get("date", date.today().isoformat()),
        chief_complaint=body.get("chief_complaint"),
        subjective=body.get("subjective"),
        objective=body.get("objective"),
        assessment=body.get("assessment"),
        plan=body.get("plan"),
        vitals=body.get("vitals", {}),
        follow_up_date=body.get("follow_up_date"),
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return {"id": str(note.id), "date": note.date.isoformat()}


@router.put("/{consultation_id}")
async def update_consultation(
    consultation_id: str,
    body: dict,
    user: CurrentUser = Depends(require_roles("clinic_owner", "doctor")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ConsultationNote).where(
            ConsultationNote.id == consultation_id,
            ConsultationNote.clinic_id == user.clinic_id,
        )
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Consultation not found")
    for field in ["chief_complaint", "subjective", "objective", "assessment", "plan", "vitals", "follow_up_date"]:
        if field in body:
            setattr(note, field, body[field])
    await db.commit()
    return {"id": str(note.id)}
