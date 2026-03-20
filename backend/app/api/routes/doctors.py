from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from app.db.session import get_db
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.queue import QueueEntry
from app.core.deps import get_current_user, CurrentUser, require_roles
from app.schemas.doctors import DoctorCreate, DoctorUpdate

router = APIRouter(prefix="/doctors", tags=["doctors"])


@router.get("")
async def list_doctors(
    search: str | None = None,
    specialization: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Doctor).where(Doctor.clinic_id == user.clinic_id, Doctor.is_active == True)
    if search:
        query = query.where(Doctor.name.ilike(f"%{search}%"))
    if specialization:
        query = query.where(Doctor.specialization == specialization)
    query = query.order_by(Doctor.name).offset(offset).limit(limit)
    result = await db.execute(query)
    doctors = result.scalars().all()

    # Get total count
    count_q = select(func.count(Doctor.id)).where(Doctor.clinic_id == user.clinic_id, Doctor.is_active == True)
    total = (await db.execute(count_q)).scalar() or 0

    return {
        "doctors": [
            {
                "id": str(d.id),
                "name": d.name,
                "specialization": d.specialization,
                "qualification": d.qualification,
                "experience_years": d.experience_years,
                "consultation_fee": float(d.consultation_fee) if d.consultation_fee else None,
                "schedule": d.schedule,
                "treatments": d.treatments,
                "avg_rating": float(d.avg_rating) if d.avg_rating else 0,
                "total_patients": d.total_patients,
                "phone": d.phone,
                "email": d.email,
                "is_active": d.is_active,
            }
            for d in doctors
        ],
        "total": total,
    }


@router.get("/{doctor_id}")
async def get_doctor(
    doctor_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Doctor).where(Doctor.id == doctor_id, Doctor.clinic_id == user.clinic_id)
    )
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {
        "id": str(d.id),
        "name": d.name,
        "specialization": d.specialization,
        "qualification": d.qualification,
        "experience_years": d.experience_years,
        "bio": d.bio,
        "consultation_fee": float(d.consultation_fee) if d.consultation_fee else None,
        "avg_rating": float(d.avg_rating) if d.avg_rating else 0,
        "total_reviews": d.total_reviews,
        "total_patients": d.total_patients,
        "phone": d.phone,
        "email": d.email,
        "is_active": d.is_active,
        "created_at": d.created_at.isoformat() if d.created_at else None,
    }


@router.post("")
async def create_doctor(
    body: DoctorCreate,
    user: CurrentUser = Depends(require_roles("clinic_owner", "doctor")),
    db: AsyncSession = Depends(get_db),
):
    doctor = Doctor(
        clinic_id=user.clinic_id,
        name=body.name,
        specialization=body.specialization,
        qualification=body.qualification,
        experience_years=body.experience_years,
        bio=body.bio,
        phone=body.phone,
        email=body.email,
        consultation_fee=body.consultation_fee,
        user_id=body.user_id if body.user_id else None,
    )
    db.add(doctor)
    await db.commit()
    await db.refresh(doctor)
    return {"id": str(doctor.id), "name": doctor.name}


@router.put("/{doctor_id}")
async def update_doctor(
    doctor_id: str,
    body: DoctorUpdate,
    user: CurrentUser = Depends(require_roles("clinic_owner", "doctor")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Doctor).where(Doctor.id == doctor_id, Doctor.clinic_id == user.clinic_id)
    )
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(doctor, field, value)
    await db.commit()
    return {"id": str(doctor.id), "name": doctor.name}


@router.delete("/{doctor_id}")
async def delete_doctor(
    doctor_id: str,
    user: CurrentUser = Depends(require_roles("clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Doctor).where(Doctor.id == doctor_id, Doctor.clinic_id == user.clinic_id)
    )
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.is_active = False
    await db.commit()
    return {"success": True}


@router.get("/{doctor_id}/schedule")
async def get_doctor_schedule(
    doctor_id: str,
    schedule_date: date = None,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target_date = schedule_date or date.today()
    result = await db.execute(
        select(Appointment).where(
            Appointment.doctor_id == doctor_id,
            Appointment.clinic_id == user.clinic_id,
            Appointment.date == target_date,
            Appointment.status != "cancelled",
        ).order_by(Appointment.start_time)
    )
    appointments = result.scalars().all()
    return {
        "date": target_date.isoformat(),
        "appointments": [
            {
                "id": str(a.id),
                "start_time": a.start_time.isoformat(),
                "end_time": a.end_time.isoformat() if a.end_time else None,
                "status": a.status,
                "patient_id": str(a.patient_id),
                "appointment_code": a.appointment_code,
            }
            for a in appointments
        ],
    }
