from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta

from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.core.deps import get_current_user, CurrentUser

router = APIRouter(prefix="/follow-ups", tags=["follow-ups"])


@router.get("")
async def list_follow_ups(
    days: int = Query(7, le=30),
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    end = today + timedelta(days=days)
    query = (
        select(Appointment, Doctor.name.label("doctor_name"), Patient.name.label("patient_name"))
        .join(Doctor, Appointment.doctor_id == Doctor.id)
        .join(Patient, Appointment.patient_id == Patient.id)
        .where(
            Appointment.clinic_id == user.clinic_id,
            Appointment.follow_up_date != None,
            Appointment.follow_up_date >= today,
            Appointment.follow_up_date <= end,
        )
        .order_by(Appointment.follow_up_date)
    )
    result = await db.execute(query)
    rows = result.all()

    return {
        "follow_ups": [
            {
                "id": str(a.id),
                "appointment_code": a.appointment_code,
                "patient_name": pn,
                "patient_id": str(a.patient_id),
                "doctor_name": dn,
                "follow_up_date": a.follow_up_date.isoformat(),
                "follow_up_notes": a.follow_up_notes,
                "original_date": a.date.isoformat(),
                "diagnosis": a.diagnosis,
            }
            for a, dn, pn in rows
        ],
    }
