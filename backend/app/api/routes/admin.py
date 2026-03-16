from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.clinic import Clinic
from app.models.user import User, ClinicMembership
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.billing import Payment
from app.core.deps import get_current_user, CurrentUser, require_roles

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/clinics")
async def list_all_clinics(
    search: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(require_roles("super_admin", "clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Clinic)
    if search:
        query = query.where(Clinic.name.ilike(f"%{search}%"))
    query = query.order_by(Clinic.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    clinics = result.scalars().all()

    total = (await db.execute(select(func.count(Clinic.id)))).scalar() or 0

    return {
        "clinics": [
            {
                "id": str(c.id),
                "name": c.name,
                "slug": c.slug,
                "city": c.city,
                "is_active": c.is_active,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in clinics
        ],
        "total": total,
    }


@router.get("/stats")
async def platform_stats(
    user: CurrentUser = Depends(require_roles("super_admin", "clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    total_clinics = (await db.execute(select(func.count(Clinic.id)))).scalar() or 0
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_patients = (await db.execute(select(func.count(Patient.id)))).scalar() or 0
    total_appointments = (await db.execute(select(func.count(Appointment.id)))).scalar() or 0

    return {
        "total_clinics": total_clinics,
        "total_users": total_users,
        "total_patients": total_patients,
        "total_appointments": total_appointments,
    }


@router.get("/users")
async def list_all_users(
    search: str | None = None,
    role: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(require_roles("super_admin", "clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(User, ClinicMembership.role, ClinicMembership.clinic_id)
        .outerjoin(ClinicMembership, ClinicMembership.user_id == User.id)
    )
    if search:
        query = query.where(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
    if role:
        query = query.where(ClinicMembership.role == role)
    query = query.order_by(User.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    total = (await db.execute(select(func.count(User.id)))).scalar() or 0

    return {
        "users": [
            {
                "id": str(u.id),
                "name": u.name,
                "email": u.email,
                "phone": u.phone,
                "role": r,
                "clinic_id": str(cid) if cid else None,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u, r, cid in rows
        ],
        "total": total,
    }
