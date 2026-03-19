from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
import uuid as uuid_mod

from app.db.session import get_db
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.core.deps import get_current_user, CurrentUser
from app.schemas.patients import PatientCreate, PatientUpdate

router = APIRouter(prefix="/patients", tags=["patients"])


def _patient_to_dict(p: Patient) -> dict:
    return {
        "id": str(p.id),
        "name": p.name,
        "phone": p.phone,
        "email": p.email,
        "date_of_birth": p.date_of_birth.isoformat() if p.date_of_birth else None,
        "gender": p.gender,
        "blood_group": p.blood_group,
        "address": p.address,
        "emergency_contact": p.emergency_contact,
        "registration_source": p.registration_source,
        "unique_code": p.unique_code,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


@router.get("")
async def list_patients(
    search: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Patient).where(Patient.clinic_id == user.clinic_id, Patient.is_active == True)
    if search:
        query = query.where(
            (Patient.name.ilike(f"%{search}%")) | (Patient.phone.ilike(f"%{search}%"))
        )
    query = query.order_by(Patient.name).offset(offset).limit(limit)
    result = await db.execute(query)
    patients = result.scalars().all()

    count_q = select(func.count(Patient.id)).where(Patient.clinic_id == user.clinic_id, Patient.is_active == True)
    total = (await db.execute(count_q)).scalar() or 0

    return {"patients": [_patient_to_dict(p) for p in patients], "total": total}


@router.get("/me")
async def get_my_patient_profile(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Patient).where(Patient.user_id == user.user_id, Patient.clinic_id == user.clinic_id)
    )
    patient = result.scalar_one_or_none()

    # Auto-create patient profile if user has patient role but no Patient record
    if not patient and user.role == "patient":
        from app.models.user import User
        import random
        user_result = await db.execute(select(User).where(User.id == user.user_id))
        u = user_result.scalar_one_or_none()
        if u:
            code = f"PAT-{__import__('datetime').datetime.now().year}-{random.randint(1000, 9999)}"
            patient = Patient(
                clinic_id=user.clinic_id,
                user_id=user.user_id,
                name=u.name,
                phone=u.phone or "",
                email=u.email,
                registration_source="portal",
                unique_code=code,
            )
            db.add(patient)
            await db.commit()
            await db.refresh(patient)

    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return _patient_to_dict(patient)


@router.get("/{patient_id}")
async def get_patient(
    patient_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Patient).where(Patient.id == patient_id, Patient.clinic_id == user.clinic_id)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return _patient_to_dict(patient)


@router.post("")
async def create_patient(
    body: PatientCreate,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check duplicate phone
    result = await db.execute(
        select(Patient).where(Patient.clinic_id == user.clinic_id, Patient.phone == body.phone)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Patient with this phone already exists")

    unique_code = f"P{uuid_mod.uuid4().hex[:6].upper()}"
    patient = Patient(
        clinic_id=user.clinic_id,
        name=body.name,
        phone=body.phone,
        email=body.email,
        date_of_birth=body.date_of_birth,
        gender=body.gender,
        blood_group=body.blood_group,
        address=body.address,
        emergency_contact=body.emergency_contact,
        registration_source=body.registration_source,
        unique_code=unique_code,
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return {"id": str(patient.id), "unique_code": patient.unique_code, "name": patient.name}


@router.put("/{patient_id}")
async def update_patient(
    patient_id: str,
    body: PatientUpdate,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Patient).where(Patient.id == patient_id, Patient.clinic_id == user.clinic_id)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    await db.commit()
    return _patient_to_dict(patient)


@router.get("/{patient_id}/appointments")
async def get_patient_appointments(
    patient_id: str,
    status: str | None = None,
    limit: int = Query(20, le=50),
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Appointment).where(
        Appointment.patient_id == patient_id,
        Appointment.clinic_id == user.clinic_id,
    )
    if status:
        query = query.where(Appointment.status == status)
    query = query.order_by(Appointment.date.desc(), Appointment.start_time.desc()).limit(limit)
    result = await db.execute(query)
    appointments = result.scalars().all()
    return {
        "appointments": [
            {
                "id": str(a.id),
                "appointment_code": a.appointment_code,
                "date": a.date.isoformat(),
                "start_time": a.start_time.isoformat(),
                "status": a.status,
                "type": a.type,
                "doctor_id": str(a.doctor_id),
                "symptoms_summary": a.symptoms_summary,
            }
            for a in appointments
        ]
    }
