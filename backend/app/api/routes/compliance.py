from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
import json

from app.db.session import get_db
from app.models.audit import AuditLog, ConsentRecord
from app.models.patient import Patient
from app.models.user import User
from app.core.deps import get_current_user, CurrentUser, require_roles

router = APIRouter(prefix="/compliance", tags=["compliance"])


@router.get("/audit-logs")
async def list_audit_logs(
    action: str | None = None,
    resource_type: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(require_roles("clinic_owner", "super_admin")),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(AuditLog, User.name.label("user_name"))
        .outerjoin(User, AuditLog.user_id == User.id)
        .where(AuditLog.clinic_id == user.clinic_id)
    )
    if action:
        query = query.where(AuditLog.action == action)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    query = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    return {
        "audit_logs": [
            {
                "id": str(log.id),
                "user_name": un,
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "details": log.details,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log, un in rows
        ],
    }


@router.get("/consents")
async def list_consents(
    patient_id: str | None = None,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(ConsentRecord).where(ConsentRecord.clinic_id == user.clinic_id)
    if patient_id:
        query = query.where(ConsentRecord.patient_id == patient_id)
    query = query.order_by(ConsentRecord.created_at.desc())
    result = await db.execute(query)
    records = result.scalars().all()

    return {
        "consents": [
            {
                "id": str(c.id),
                "patient_id": str(c.patient_id),
                "consent_type": c.consent_type,
                "granted": c.granted,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "revoked_at": c.revoked_at.isoformat() if c.revoked_at else None,
            }
            for c in records
        ],
    }


@router.post("/consents")
async def create_consent(
    body: dict,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    consent = ConsentRecord(
        clinic_id=user.clinic_id,
        patient_id=body["patient_id"],
        consent_type=body["consent_type"],
        granted=body.get("granted", True),
    )
    db.add(consent)
    await db.commit()
    return {"id": str(consent.id), "consent_type": consent.consent_type}


@router.post("/consents/{consent_id}/revoke")
async def revoke_consent(
    consent_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ConsentRecord).where(ConsentRecord.id == consent_id, ConsentRecord.clinic_id == user.clinic_id)
    )
    consent = result.scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    consent.granted = False
    consent.revoked_at = datetime.now(timezone.utc)
    await db.commit()
    return {"id": str(consent.id), "granted": False}


@router.get("/export/{patient_id}")
async def export_patient_data(
    patient_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.models.appointment import Appointment
    from app.models.prescription import Prescription

    result = await db.execute(
        select(Patient).where(Patient.id == patient_id, Patient.clinic_id == user.clinic_id)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Get appointments (filtered by clinic_id for tenant isolation)
    apts = (await db.execute(
        select(Appointment).where(
            Appointment.patient_id == patient_id,
            Appointment.clinic_id == user.clinic_id,
        )
    )).scalars().all()

    # Get prescriptions (filtered by clinic_id for tenant isolation)
    rxs = (await db.execute(
        select(Prescription).where(
            Prescription.patient_id == patient_id,
            Prescription.clinic_id == user.clinic_id,
        )
    )).scalars().all()

    return {
        "patient": {
            "name": patient.name,
            "phone": patient.phone,
            "email": patient.email,
            "date_of_birth": patient.date_of_birth.isoformat() if patient.date_of_birth else None,
            "gender": patient.gender,
        },
        "appointments": [
            {
                "date": a.date.isoformat(),
                "status": a.status,
                "type": a.type,
                "diagnosis": a.diagnosis,
            }
            for a in apts
        ],
        "prescriptions": [
            {
                "date": rx.date.isoformat(),
                "medications": rx.medications,
                "diagnosis": rx.diagnosis,
            }
            for rx in rxs
        ],
    }
