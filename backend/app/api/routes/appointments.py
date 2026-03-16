import uuid as uuid_mod
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, time, timedelta

from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.core.deps import get_current_user, CurrentUser
from app.schemas.appointments import AppointmentCreate, AppointmentUpdate, AppointmentStatusUpdate

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _apt_to_dict(a: Appointment, doctor_name: str | None = None, patient_name: str | None = None) -> dict:
    return {
        "id": str(a.id),
        "appointment_code": a.appointment_code,
        "doctor_id": str(a.doctor_id),
        "patient_id": str(a.patient_id),
        "date": a.date.isoformat(),
        "start_time": a.start_time.isoformat(),
        "end_time": a.end_time.isoformat() if a.end_time else None,
        "duration_minutes": a.duration_minutes,
        "type": a.type,
        "status": a.status,
        "booking_source": a.booking_source,
        "symptoms_summary": a.symptoms_summary,
        "consultation_notes": a.consultation_notes,
        "diagnosis": a.diagnosis,
        "follow_up_date": a.follow_up_date.isoformat() if a.follow_up_date else None,
        "doctor_name": doctor_name,
        "patient_name": patient_name,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


@router.get("")
async def list_appointments(
    appointment_date: date | None = None,
    status: str | None = None,
    doctor_id: str | None = None,
    patient_id: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Appointment, Doctor.name.label("doctor_name"), Patient.name.label("patient_name"))
        .join(Doctor, Appointment.doctor_id == Doctor.id)
        .join(Patient, Appointment.patient_id == Patient.id)
        .where(Appointment.clinic_id == user.clinic_id)
    )
    if appointment_date:
        query = query.where(Appointment.date == appointment_date)
    if status:
        query = query.where(Appointment.status == status)
    if doctor_id:
        query = query.where(Appointment.doctor_id == doctor_id)
    if patient_id:
        query = query.where(Appointment.patient_id == patient_id)
    query = query.order_by(Appointment.date.desc(), Appointment.start_time).offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    count_q = select(func.count(Appointment.id)).where(Appointment.clinic_id == user.clinic_id)
    if appointment_date:
        count_q = count_q.where(Appointment.date == appointment_date)
    if status:
        count_q = count_q.where(Appointment.status == status)
    total = (await db.execute(count_q)).scalar() or 0

    return {
        "appointments": [_apt_to_dict(a, dn, pn) for a, dn, pn in rows],
        "total": total,
    }


@router.get("/today")
async def get_today_appointments(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    query = (
        select(Appointment, Doctor.name.label("doctor_name"), Patient.name.label("patient_name"))
        .join(Doctor, Appointment.doctor_id == Doctor.id)
        .join(Patient, Appointment.patient_id == Patient.id)
        .where(Appointment.clinic_id == user.clinic_id, Appointment.date == today)
        .order_by(Appointment.start_time)
    )
    result = await db.execute(query)
    rows = result.all()

    # Stats
    total = len(rows)
    completed = sum(1 for a, _, _ in rows if a.status == "completed")
    in_progress = sum(1 for a, _, _ in rows if a.status == "in_progress")
    scheduled = sum(1 for a, _, _ in rows if a.status == "scheduled")

    return {
        "appointments": [_apt_to_dict(a, dn, pn) for a, dn, pn in rows],
        "stats": {
            "total": total,
            "completed": completed,
            "in_progress": in_progress,
            "scheduled": scheduled,
        },
    }


@router.get("/slots")
async def get_available_slots(
    doctor_id: str,
    slot_date: date,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get existing appointments for the doctor on that date
    result = await db.execute(
        select(Appointment).where(
            Appointment.doctor_id == doctor_id,
            Appointment.clinic_id == user.clinic_id,
            Appointment.date == slot_date,
            Appointment.status != "cancelled",
        )
    )
    booked = result.scalars().all()
    booked_times = {a.start_time for a in booked}

    # Generate 15-min slots from 9:00 to 18:00
    slots = []
    current = time(9, 0)
    end = time(18, 0)
    while current < end:
        available = current not in booked_times
        slots.append({"time": current.isoformat(), "available": available})
        dt = (timedelta(hours=current.hour, minutes=current.minute) + timedelta(minutes=15))
        h, m = divmod(int(dt.total_seconds()) // 60, 60)
        if h >= 18:
            break
        current = time(h, m)

    return {"date": slot_date.isoformat(), "doctor_id": doctor_id, "slots": slots}


@router.post("")
async def create_appointment(
    body: AppointmentCreate,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    code = f"APT{uuid_mod.uuid4().hex[:6].upper()}"
    end_t = None
    if body.start_time:
        dt = timedelta(hours=body.start_time.hour, minutes=body.start_time.minute) + timedelta(minutes=body.duration_minutes)
        h, m = divmod(int(dt.total_seconds()) // 60, 60)
        if h < 24:
            end_t = time(h, m)

    appointment = Appointment(
        clinic_id=user.clinic_id,
        doctor_id=body.doctor_id,
        patient_id=body.patient_id,
        appointment_code=code,
        date=body.date,
        start_time=body.start_time,
        end_time=end_t,
        duration_minutes=body.duration_minutes,
        type=body.type,
        symptoms_summary=body.symptoms_summary,
        booking_source=body.booking_source,
    )
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)

    # Send notification to patient
    try:
        from app.services.notification_service import notify_appointment_booked
        patient_result = await db.execute(select(Patient).where(Patient.id == body.patient_id))
        patient = patient_result.scalar_one_or_none()
        doctor_result = await db.execute(select(Doctor).where(Doctor.id == body.doctor_id))
        doctor = doctor_result.scalar_one_or_none()
        if patient and doctor and patient.phone:
            await notify_appointment_booked(
                db, clinic_id=str(user.clinic_id), patient_id=str(body.patient_id),
                patient_phone=patient.phone, patient_name=patient.name,
                doctor_name=doctor.name, date=appointment.date.isoformat(),
                time=appointment.start_time.isoformat(),
            )
    except Exception:
        pass  # Don't fail the appointment creation if notification fails

    return {
        "id": str(appointment.id),
        "appointment_code": appointment.appointment_code,
        "date": appointment.date.isoformat(),
        "start_time": appointment.start_time.isoformat(),
    }


@router.put("/{appointment_id}")
async def update_appointment(
    appointment_id: str,
    body: AppointmentUpdate,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id, Appointment.clinic_id == user.clinic_id)
    )
    apt = result.scalar_one_or_none()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(apt, field, value)
    await db.commit()
    # Real-time broadcast
    try:
        from app.core.socketio import emit_appointment_updated
        await emit_appointment_updated(str(user.clinic_id), {"appointment_id": appointment_id, "status": apt.status})
    except Exception:
        pass

    return {"id": str(apt.id), "status": apt.status}


@router.patch("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    body: AppointmentStatusUpdate,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id, Appointment.clinic_id == user.clinic_id)
    )
    apt = result.scalar_one_or_none()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    apt.status = body.status
    if body.cancellation_reason:
        apt.cancellation_reason = body.cancellation_reason
    await db.commit()

    # Send cancellation notification
    if body.status == "cancelled":
        try:
            from app.services.notification_service import notify_appointment_cancelled
            patient_result = await db.execute(select(Patient).where(Patient.id == apt.patient_id))
            patient = patient_result.scalar_one_or_none()
            doctor_result = await db.execute(select(Doctor).where(Doctor.id == apt.doctor_id))
            doctor = doctor_result.scalar_one_or_none()
            if patient and doctor and patient.phone:
                await notify_appointment_cancelled(
                    db, clinic_id=str(user.clinic_id), patient_id=str(apt.patient_id),
                    patient_phone=patient.phone, patient_name=patient.name,
                    doctor_name=doctor.name, date=apt.date.isoformat(),
                )
        except Exception:
            pass  # Don't fail the status update if notification fails

    # Real-time broadcast
    try:
        from app.core.socketio import emit_appointment_updated
        await emit_appointment_updated(str(user.clinic_id), {"appointment_id": appointment_id, "status": body.status})
    except Exception:
        pass

    return {"id": str(apt.id), "status": apt.status}
