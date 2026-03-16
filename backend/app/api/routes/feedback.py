from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.feedback import Feedback
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.core.deps import get_current_user, CurrentUser

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.get("")
async def list_feedback(
    doctor_id: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Feedback, Patient.name.label("patient_name"))
        .join(Patient, Feedback.patient_id == Patient.id)
        .where(Feedback.clinic_id == user.clinic_id)
    )
    if doctor_id:
        query = query.where(Feedback.doctor_id == doctor_id)
    query = query.order_by(Feedback.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    avg_rating = (await db.execute(
        select(func.avg(Feedback.rating)).where(Feedback.clinic_id == user.clinic_id)
    )).scalar()

    return {
        "feedback": [
            {
                "id": str(f.id),
                "patient_name": pn,
                "rating": f.rating,
                "comment": f.comment,
                "category": f.category,
                "created_at": f.created_at.isoformat() if f.created_at else None,
            }
            for f, pn in rows
        ],
        "avg_rating": round(float(avg_rating), 1) if avg_rating else 0,
    }


@router.post("")
async def submit_feedback(
    body: dict,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Find patient for this user
    result = await db.execute(
        select(Patient).where(Patient.user_id == user.user_id, Patient.clinic_id == user.clinic_id)
    )
    patient = result.scalar_one_or_none()
    patient_id = str(patient.id) if patient else body.get("patient_id")
    if not patient_id:
        raise HTTPException(status_code=400, detail="Patient not found")

    fb = Feedback(
        clinic_id=user.clinic_id,
        patient_id=patient_id,
        appointment_id=body.get("appointment_id"),
        doctor_id=body.get("doctor_id"),
        rating=body["rating"],
        comment=body.get("comment"),
        category=body.get("category"),
    )
    db.add(fb)
    await db.commit()
    return {"id": str(fb.id)}
