from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User, ClinicMembership
from app.core.deps import get_current_user, CurrentUser, require_roles
from app.core.security import hash_password
from app.schemas.staff import StaffCreate, StaffUpdate

router = APIRouter(prefix="/staff", tags=["staff"])

STAFF_ROLES = ("staff", "nurse", "receptionist")


@router.get("")
async def list_staff(
    role: str | None = None,
    search: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(require_roles("clinic_owner", "doctor")),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(User, ClinicMembership)
        .join(ClinicMembership, ClinicMembership.user_id == User.id)
        .where(
            ClinicMembership.clinic_id == user.clinic_id,
            ClinicMembership.role.in_(STAFF_ROLES),
            ClinicMembership.is_active == True,
        )
    )
    if role:
        query = query.where(ClinicMembership.role == role)
    if search:
        query = query.where(User.name.ilike(f"%{search}%"))
    query = query.order_by(User.name).offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    count_q = (
        select(func.count(ClinicMembership.id))
        .where(
            ClinicMembership.clinic_id == user.clinic_id,
            ClinicMembership.role.in_(STAFF_ROLES),
            ClinicMembership.is_active == True,
        )
    )
    total = (await db.execute(count_q)).scalar() or 0

    return {
        "staff": [
            {
                "id": str(u.id),
                "name": u.name,
                "email": u.email,
                "phone": u.phone,
                "role": m.role,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u, m in rows
        ],
        "total": total,
    }


@router.post("")
async def create_staff(
    body: StaffCreate,
    user: CurrentUser = Depends(require_roles("clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    # Check existing email
    result = await db.execute(select(User).where(User.email == body.email.lower()))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    new_user = User(
        name=body.name,
        email=body.email.lower(),
        phone=body.phone,
        password_hash=hash_password(body.password),
    )
    db.add(new_user)
    await db.flush()

    membership = ClinicMembership(
        user_id=new_user.id,
        clinic_id=user.clinic_id,
        role=body.role if body.role in STAFF_ROLES else "staff",
    )
    db.add(membership)
    await db.commit()
    return {"id": str(new_user.id), "name": new_user.name, "role": membership.role}


@router.put("/{staff_id}")
async def update_staff(
    staff_id: str,
    body: StaffUpdate,
    user: CurrentUser = Depends(require_roles("clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == staff_id))
    staff_user = result.scalar_one_or_none()
    if not staff_user:
        raise HTTPException(status_code=404, detail="Staff not found")

    if body.name is not None:
        staff_user.name = body.name
    if body.phone is not None:
        staff_user.phone = body.phone
    if body.is_active is not None:
        staff_user.is_active = body.is_active

    if body.role is not None and body.role in STAFF_ROLES:
        result = await db.execute(
            select(ClinicMembership).where(
                ClinicMembership.user_id == staff_id,
                ClinicMembership.clinic_id == user.clinic_id,
            )
        )
        membership = result.scalar_one_or_none()
        if membership:
            membership.role = body.role

    await db.commit()
    return {"id": str(staff_user.id), "name": staff_user.name}


@router.delete("/{staff_id}")
async def delete_staff(
    staff_id: str,
    user: CurrentUser = Depends(require_roles("clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ClinicMembership).where(
            ClinicMembership.user_id == staff_id,
            ClinicMembership.clinic_id == user.clinic_id,
        )
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=404, detail="Staff not found")
    membership.is_active = False
    await db.commit()
    return {"success": True}
