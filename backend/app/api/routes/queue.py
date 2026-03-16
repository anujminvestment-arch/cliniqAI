from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, datetime, timezone

from app.db.session import get_db
from app.models.queue import QueueEntry
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.core.deps import get_current_user, CurrentUser
from app.schemas.queue import QueueCheckIn

router = APIRouter(prefix="/queue", tags=["queue"])

AVG_CONSULTATION_MINUTES = 15


async def _recalculate_positions(db: AsyncSession, clinic_id, doctor_id, today):
    """Recalculate position and estimated_wait for all waiting patients of a doctor."""
    result = await db.execute(
        select(QueueEntry)
        .where(
            QueueEntry.clinic_id == clinic_id,
            QueueEntry.doctor_id == doctor_id,
            QueueEntry.date == today,
            QueueEntry.status == "waiting",
        )
        .order_by(QueueEntry.position)
    )
    entries = result.scalars().all()
    for i, entry in enumerate(entries):
        entry.position = i + 1
        entry.estimated_wait = i * AVG_CONSULTATION_MINUTES


async def _get_remaining_summary(db: AsyncSession, clinic_id, doctor_id, today) -> dict:
    """Get summary counts for a specific doctor's queue."""
    waiting = (await db.execute(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.clinic_id == clinic_id,
            QueueEntry.doctor_id == doctor_id,
            QueueEntry.date == today,
            QueueEntry.status == "waiting",
        )
    )).scalar() or 0

    in_progress = (await db.execute(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.clinic_id == clinic_id,
            QueueEntry.doctor_id == doctor_id,
            QueueEntry.date == today,
            QueueEntry.status == "in_progress",
        )
    )).scalar() or 0

    completed = (await db.execute(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.clinic_id == clinic_id,
            QueueEntry.doctor_id == doctor_id,
            QueueEntry.date == today,
            QueueEntry.status == "completed",
        )
    )).scalar() or 0

    return {
        "remaining": waiting,
        "in_progress": in_progress,
        "completed": completed,
        "total": waiting + in_progress + completed,
    }


@router.get("")
async def get_queue(
    doctor_id: str | None = None,
    queue_date: date | None = None,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target_date = queue_date or date.today()
    query = (
        select(QueueEntry, Patient.name.label("patient_name"), Doctor.name.label("doctor_name"))
        .join(Patient, QueueEntry.patient_id == Patient.id)
        .join(Doctor, QueueEntry.doctor_id == Doctor.id)
        .where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.date == target_date,
            QueueEntry.status.in_(["waiting", "in_progress"]),
        )
    )
    if doctor_id:
        query = query.where(QueueEntry.doctor_id == doctor_id)
    query = query.order_by(QueueEntry.position)
    result = await db.execute(query)
    rows = result.all()

    return {
        "queue": [
            {
                "id": str(q.id),
                "token_number": q.token_number,
                "position": q.position,
                "status": q.status,
                "type": q.type,
                "patient_id": str(q.patient_id),
                "patient_name": pn,
                "doctor_id": str(q.doctor_id),
                "doctor_name": dn,
                "check_in_time": q.check_in_time.isoformat() if q.check_in_time else None,
                "estimated_wait": q.estimated_wait,
                "appointment_id": str(q.appointment_id) if q.appointment_id else None,
            }
            for q, pn, dn in rows
        ],
        "total": len(rows),
    }


@router.get("/stats")
async def get_queue_stats(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    base = select(QueueEntry).where(
        QueueEntry.clinic_id == user.clinic_id,
        QueueEntry.date == today,
    )
    waiting = (await db.execute(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.date == today,
            QueueEntry.status == "waiting",
        )
    )).scalar() or 0

    in_progress = (await db.execute(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.date == today,
            QueueEntry.status == "in_progress",
        )
    )).scalar() or 0

    completed = (await db.execute(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.date == today,
            QueueEntry.status == "completed",
        )
    )).scalar() or 0

    avg_wait_result = await db.execute(
        select(func.avg(QueueEntry.estimated_wait)).where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.date == today,
            QueueEntry.status == "waiting",
        )
    )
    avg_wait = avg_wait_result.scalar() or 0

    return {
        "waiting": waiting,
        "in_progress": in_progress,
        "completed": completed,
        "avg_wait_minutes": round(float(avg_wait), 1),
        "total_today": waiting + in_progress + completed,
    }


@router.post("/check-in")
async def check_in(
    body: QueueCheckIn,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    # Get next token number
    max_token = (await db.execute(
        select(func.max(QueueEntry.token_number)).where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.doctor_id == body.doctor_id,
            QueueEntry.date == today,
        )
    )).scalar() or 0

    # Get current queue length for position
    queue_length = (await db.execute(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.doctor_id == body.doctor_id,
            QueueEntry.date == today,
            QueueEntry.status.in_(["waiting", "in_progress"]),
        )
    )).scalar() or 0

    entry = QueueEntry(
        clinic_id=user.clinic_id,
        doctor_id=body.doctor_id,
        patient_id=body.patient_id,
        appointment_id=body.appointment_id if body.appointment_id else None,
        date=today,
        token_number=max_token + 1,
        position=queue_length + 1,
        type=body.type,
        estimated_wait=queue_length * 15,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    # Real-time broadcast
    try:
        from app.core.socketio import emit_queue_updated
        from app.models.clinic import Clinic
        slug_result = await db.execute(select(Clinic.slug).where(Clinic.id == user.clinic_id))
        slug = slug_result.scalar_one_or_none()
        await emit_queue_updated(str(user.clinic_id), slug, {"doctor_id": body.doctor_id})
    except Exception:
        pass

    return {
        "id": str(entry.id),
        "token_number": entry.token_number,
        "position": entry.position,
        "estimated_wait": entry.estimated_wait,
    }


@router.post("/call-next")
async def call_next(
    doctor_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()

    # Complete current in_progress
    result = await db.execute(
        select(QueueEntry).where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.doctor_id == doctor_id,
            QueueEntry.date == today,
            QueueEntry.status == "in_progress",
        )
    )
    current = result.scalar_one_or_none()
    if current:
        current.status = "completed"
        current.completed_at = datetime.now(timezone.utc)

    # Get next waiting
    result = await db.execute(
        select(QueueEntry).where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.doctor_id == doctor_id,
            QueueEntry.date == today,
            QueueEntry.status == "waiting",
        ).order_by(QueueEntry.position).limit(1)
    )
    next_entry = result.scalar_one_or_none()
    if not next_entry:
        await db.commit()
        summary = await _get_remaining_summary(db, user.clinic_id, doctor_id, today)
        return {"message": "No more patients in queue", "next": None, **summary}

    next_entry.status = "in_progress"
    next_entry.called_at = datetime.now(timezone.utc)

    # Recalculate positions for remaining patients
    await _recalculate_positions(db, user.clinic_id, doctor_id, today)

    await db.commit()

    # Send WhatsApp notification to the called patient
    try:
        from app.services.notification_service import notify_queue_update
        patient_result = await db.execute(select(Patient).where(Patient.id == next_entry.patient_id))
        called_patient = patient_result.scalar_one_or_none()
        if called_patient:
            await notify_queue_update(
                db, clinic_id=str(user.clinic_id), patient_id=str(called_patient.id),
                patient_phone=called_patient.phone, patient_name=called_patient.name, position=0,
            )

        # Also notify position-2 patient ("you're next!")
        second_result = await db.execute(
            select(QueueEntry, Patient.name, Patient.phone, Patient.id.label("pid"))
            .join(Patient, QueueEntry.patient_id == Patient.id)
            .where(
                QueueEntry.clinic_id == user.clinic_id,
                QueueEntry.doctor_id == doctor_id,
                QueueEntry.date == today,
                QueueEntry.status == "waiting",
            ).order_by(QueueEntry.position).limit(1)
        )
        second_row = second_result.one_or_none()
        if second_row:
            await notify_queue_update(
                db, clinic_id=str(user.clinic_id), patient_id=str(second_row[3]),
                patient_phone=second_row[2], patient_name=second_row[1], position=1,
            )
        await db.commit()
    except Exception:
        pass  # Don't fail queue operation if notification fails

    summary = await _get_remaining_summary(db, user.clinic_id, doctor_id, today)

    # Real-time broadcast
    try:
        from app.core.socketio import emit_queue_updated
        from app.models.clinic import Clinic
        slug_result = await db.execute(select(Clinic.slug).where(Clinic.id == user.clinic_id))
        slug = slug_result.scalar_one_or_none()
        await emit_queue_updated(str(user.clinic_id), slug, {"doctor_id": doctor_id, **summary})
    except Exception:
        pass

    return {
        "next": {
            "id": str(next_entry.id),
            "token_number": next_entry.token_number,
            "patient_id": str(next_entry.patient_id),
        },
        **summary,
    }


@router.post("/skip")
async def skip_patient(
    entry_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(QueueEntry).where(
            QueueEntry.id == entry_id,
            QueueEntry.clinic_id == user.clinic_id,
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Queue entry not found")

    doctor_id = entry.doctor_id
    entry.status = "no_show"
    entry.completed_at = datetime.now(timezone.utc)

    # Recalculate positions for remaining patients
    today = date.today()
    await _recalculate_positions(db, user.clinic_id, doctor_id, today)
    await db.commit()

    summary = await _get_remaining_summary(db, user.clinic_id, doctor_id, today)

    # Real-time broadcast
    try:
        from app.core.socketio import emit_queue_updated
        from app.models.clinic import Clinic
        slug_result = await db.execute(select(Clinic.slug).where(Clinic.id == user.clinic_id))
        slug = slug_result.scalar_one_or_none()
        await emit_queue_updated(str(user.clinic_id), slug, {"doctor_id": str(doctor_id), **summary})
    except Exception:
        pass

    return {"success": True, **summary}


@router.get("/my-queue")
async def get_doctor_queue(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Doctor sees their own queue with remaining count. Works on doctor's phone/tablet."""
    today = date.today()

    # Find the doctor record for this user
    result = await db.execute(
        select(Doctor).where(Doctor.user_id == user.user_id, Doctor.clinic_id == user.clinic_id)
    )
    doctor = result.scalar_one_or_none()
    if not doctor:
        # If clinic_owner, show all doctors' queues
        if user.role in ("clinic_owner", "staff", "receptionist"):
            all_doctors_result = await db.execute(
                select(Doctor).where(Doctor.clinic_id == user.clinic_id, Doctor.is_active == True)
            )
            all_doctors = all_doctors_result.scalars().all()
            doctors_queues = []
            for doc in all_doctors:
                q_result = await db.execute(
                    select(QueueEntry, Patient.name.label("patient_name"))
                    .join(Patient, QueueEntry.patient_id == Patient.id)
                    .where(
                        QueueEntry.clinic_id == user.clinic_id,
                        QueueEntry.doctor_id == doc.id,
                        QueueEntry.date == today,
                        QueueEntry.status.in_(["waiting", "in_progress"]),
                    )
                    .order_by(QueueEntry.position)
                )
                q_rows = q_result.all()
                current = None
                waiting = []
                for q, pn in q_rows:
                    entry_data = {
                        "id": str(q.id),
                        "token_number": q.token_number,
                        "position": q.position,
                        "patient_name": pn,
                        "patient_id": str(q.patient_id),
                        "status": q.status,
                        "estimated_wait": q.estimated_wait,
                    }
                    if q.status == "in_progress":
                        current = entry_data
                    else:
                        waiting.append(entry_data)

                completed_count = (await db.execute(
                    select(func.count(QueueEntry.id)).where(
                        QueueEntry.clinic_id == user.clinic_id,
                        QueueEntry.doctor_id == doc.id,
                        QueueEntry.date == today,
                        QueueEntry.status == "completed",
                    )
                )).scalar() or 0

                doctors_queues.append({
                    "doctor_id": str(doc.id),
                    "doctor_name": doc.name,
                    "specialization": doc.specialization,
                    "current_patient": current,
                    "waiting": waiting,
                    "remaining": len(waiting),
                    "completed": completed_count,
                })
            return {"role": user.role, "doctors": doctors_queues}

        return {"role": user.role, "error": "No doctor profile found"}

    # Doctor sees their own queue
    q_result = await db.execute(
        select(QueueEntry, Patient.name.label("patient_name"), Patient.phone.label("patient_phone"))
        .join(Patient, QueueEntry.patient_id == Patient.id)
        .where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.doctor_id == doctor.id,
            QueueEntry.date == today,
            QueueEntry.status.in_(["waiting", "in_progress"]),
        )
        .order_by(QueueEntry.position)
    )
    q_rows = q_result.all()

    current = None
    waiting = []
    for q, pn, pp in q_rows:
        entry_data = {
            "id": str(q.id),
            "token_number": q.token_number,
            "position": q.position,
            "patient_name": pn,
            "patient_phone": pp,
            "patient_id": str(q.patient_id),
            "status": q.status,
            "estimated_wait": q.estimated_wait,
            "check_in_time": q.check_in_time.isoformat() if q.check_in_time else None,
        }
        if q.status == "in_progress":
            current = entry_data
        else:
            waiting.append(entry_data)

    completed_count = (await db.execute(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.doctor_id == doctor.id,
            QueueEntry.date == today,
            QueueEntry.status == "completed",
        )
    )).scalar() or 0

    return {
        "role": "doctor",
        "doctor_id": str(doctor.id),
        "doctor_name": doctor.name,
        "current_patient": current,
        "waiting": waiting,
        "remaining": len(waiting),
        "completed": completed_count,
        "total_today": len(waiting) + (1 if current else 0) + completed_count,
    }


@router.get("/tv/{clinic_slug}")
async def get_tv_queue(clinic_slug: str, db: AsyncSession = Depends(get_db)):
    """Public endpoint for TV display. No auth required. Returns queue grouped by doctor."""
    from app.models.clinic import Clinic
    result = await db.execute(select(Clinic).where(Clinic.slug == clinic_slug, Clinic.is_active == True))
    clinic = result.scalar_one_or_none()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    today = date.today()
    query = (
        select(QueueEntry, Patient.name.label("patient_name"), Doctor.name.label("doctor_name"),
               Doctor.specialization.label("doctor_specialization"), Doctor.id.label("doc_id"))
        .join(Patient, QueueEntry.patient_id == Patient.id)
        .join(Doctor, QueueEntry.doctor_id == Doctor.id)
        .where(
            QueueEntry.clinic_id == clinic.id,
            QueueEntry.date == today,
            QueueEntry.status.in_(["waiting", "in_progress"]),
        )
        .order_by(Doctor.name, QueueEntry.position)
    )
    result = await db.execute(query)
    rows = result.all()

    # Group by doctor
    doctors_map: dict = {}
    for q, pn, dn, ds, did in rows:
        doc_key = str(did)
        if doc_key not in doctors_map:
            doctors_map[doc_key] = {
                "doctor_id": doc_key,
                "doctor_name": dn,
                "specialization": ds,
                "current_patient": None,
                "queue": [],
                "total_waiting": 0,
            }
        entry = {
            "token_number": q.token_number,
            "position": q.position,
            "patient_name": pn,
            "status": q.status,
            "estimated_wait": q.estimated_wait,
            "check_in_time": q.check_in_time.isoformat() if q.check_in_time else None,
        }
        if q.status == "in_progress":
            doctors_map[doc_key]["current_patient"] = entry
        else:
            doctors_map[doc_key]["queue"].append(entry)
            doctors_map[doc_key]["total_waiting"] += 1

    # Also get completed count for each doctor
    completed_result = await db.execute(
        select(QueueEntry.doctor_id, func.count(QueueEntry.id))
        .where(
            QueueEntry.clinic_id == clinic.id,
            QueueEntry.date == today,
            QueueEntry.status == "completed",
        )
        .group_by(QueueEntry.doctor_id)
    )
    for doc_id, count in completed_result.all():
        doc_key = str(doc_id)
        if doc_key in doctors_map:
            doctors_map[doc_key]["completed"] = count

    return {
        "clinic_name": clinic.name,
        "clinic_slug": clinic.slug,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "doctors": list(doctors_map.values()),
    }


@router.get("/my-position")
async def get_my_queue_position(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current patient's queue position with doctor info. Used by patient portal."""
    today = date.today()

    # Find patient record for this user
    result = await db.execute(
        select(Patient).where(Patient.user_id == user.user_id, Patient.clinic_id == user.clinic_id)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        return {"in_queue": False}

    # Find active queue entry for this patient
    result = await db.execute(
        select(QueueEntry, Doctor.name.label("doctor_name"), Doctor.specialization, Doctor.id.label("doc_id"))
        .join(Doctor, QueueEntry.doctor_id == Doctor.id)
        .where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.patient_id == patient.id,
            QueueEntry.date == today,
            QueueEntry.status.in_(["waiting", "in_progress"]),
        )
        .limit(1)
    )
    row = result.one_or_none()
    if not row:
        return {"in_queue": False}

    entry, doctor_name, doctor_spec, doctor_id = row

    # Count patients ahead in the same doctor's queue
    ahead = (await db.execute(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.doctor_id == doctor_id,
            QueueEntry.date == today,
            QueueEntry.status == "waiting",
            QueueEntry.position < entry.position,
        )
    )).scalar() or 0

    # Get all entries for this doctor's queue (for the queue list view)
    queue_result = await db.execute(
        select(QueueEntry, Patient.name.label("patient_name"))
        .join(Patient, QueueEntry.patient_id == Patient.id)
        .where(
            QueueEntry.clinic_id == user.clinic_id,
            QueueEntry.doctor_id == doctor_id,
            QueueEntry.date == today,
            QueueEntry.status.in_(["waiting", "in_progress"]),
        )
        .order_by(QueueEntry.position)
    )
    queue_rows = queue_result.all()

    queue_list = []
    for q, pn in queue_rows:
        queue_list.append({
            "id": str(q.id),
            "token_number": q.token_number,
            "position": q.position,
            "patient_name": pn,
            "status": q.status,
            "estimated_wait": q.estimated_wait,
            "is_you": q.patient_id == patient.id,
        })

    return {
        "in_queue": True,
        "position": entry.position,
        "token_number": entry.token_number,
        "status": entry.status,
        "doctor_name": doctor_name,
        "doctor_specialization": doctor_spec,
        "doctor_id": str(doctor_id),
        "estimated_wait": entry.estimated_wait,
        "patients_ahead": ahead,
        "queue": queue_list,
    }
