from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta

from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.queue import QueueEntry
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.billing import Invoice, Payment
from app.core.deps import get_current_user, CurrentUser, require_roles

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
async def dashboard_stats(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    clinic_id = user.clinic_id

    total_patients = (await db.execute(
        select(func.count(Patient.id)).where(Patient.clinic_id == clinic_id, Patient.is_active == True)
    )).scalar() or 0

    total_doctors = (await db.execute(
        select(func.count(Doctor.id)).where(Doctor.clinic_id == clinic_id, Doctor.is_active == True)
    )).scalar() or 0

    today_appointments = (await db.execute(
        select(func.count(Appointment.id)).where(
            Appointment.clinic_id == clinic_id, Appointment.date == today
        )
    )).scalar() or 0

    completed_today = (await db.execute(
        select(func.count(Appointment.id)).where(
            Appointment.clinic_id == clinic_id, Appointment.date == today, Appointment.status == "completed"
        )
    )).scalar() or 0

    queue_waiting = (await db.execute(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.clinic_id == clinic_id, QueueEntry.date == today, QueueEntry.status == "waiting"
        )
    )).scalar() or 0

    # Revenue this month
    month_start = today.replace(day=1)
    monthly_revenue = (await db.execute(
        select(func.sum(Payment.amount)).where(
            Payment.clinic_id == clinic_id,
            Payment.status == "completed",
            Payment.paid_at >= month_start,
        )
    )).scalar() or 0

    today_revenue = (await db.execute(
        select(func.sum(Payment.amount)).where(
            Payment.clinic_id == clinic_id,
            Payment.status == "completed",
            func.date(Payment.paid_at) == today,
        )
    )).scalar() or 0

    # Pending follow-ups
    follow_ups = (await db.execute(
        select(func.count(Appointment.id)).where(
            Appointment.clinic_id == clinic_id,
            Appointment.follow_up_date != None,
            Appointment.follow_up_date >= today,
            Appointment.follow_up_date <= today + timedelta(days=7),
        )
    )).scalar() or 0

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "today_appointments": today_appointments,
        "completed_today": completed_today,
        "queue_waiting": queue_waiting,
        "monthly_revenue": float(monthly_revenue),
        "today_revenue": float(today_revenue),
        "pending_follow_ups": follow_ups,
    }


@router.get("/trends")
async def appointment_trends(
    days: int = Query(7, le=30),
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    start = today - timedelta(days=days - 1)
    result = await db.execute(
        select(Appointment.date, func.count(Appointment.id))
        .where(
            Appointment.clinic_id == user.clinic_id,
            Appointment.date >= start,
            Appointment.date <= today,
        )
        .group_by(Appointment.date)
        .order_by(Appointment.date)
    )
    rows = result.all()
    data = {r[0].isoformat(): r[1] for r in rows}
    # Fill missing dates
    trend = []
    for i in range(days):
        d = start + timedelta(days=i)
        trend.append({"date": d.isoformat(), "count": data.get(d.isoformat(), 0)})
    return {"trends": trend}


@router.get("/doctor-performance")
async def doctor_performance(
    user: CurrentUser = Depends(require_roles("clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    month_start = today.replace(day=1)
    result = await db.execute(
        select(
            Doctor.id, Doctor.name, Doctor.specialization,
            func.count(Appointment.id).label("appointments"),
        )
        .join(Appointment, Appointment.doctor_id == Doctor.id)
        .where(
            Doctor.clinic_id == user.clinic_id,
            Appointment.date >= month_start,
        )
        .group_by(Doctor.id, Doctor.name, Doctor.specialization)
        .order_by(func.count(Appointment.id).desc())
    )
    rows = result.all()
    return {
        "doctors": [
            {
                "id": str(r[0]),
                "name": r[1],
                "specialization": r[2],
                "appointments_this_month": r[3],
            }
            for r in rows
        ],
    }
