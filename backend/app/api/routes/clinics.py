from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.clinic import Clinic
from app.models.branch import ClinicBranch
from app.core.deps import get_current_user, CurrentUser, require_roles

router = APIRouter(prefix="/clinics", tags=["clinics"])


@router.get("/me")
async def get_my_clinic(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Clinic).where(Clinic.id == user.clinic_id))
    clinic = result.scalar_one_or_none()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return {
        "id": str(clinic.id),
        "name": clinic.name,
        "slug": clinic.slug,
        "phone": clinic.phone,
        "email": clinic.email,
        "address": clinic.address,
        "city": clinic.city,
        "state": clinic.state,
        "pincode": clinic.pincode,
        "timings": clinic.timings,
        "settings": clinic.settings,
        "logo_url": clinic.logo_url,
        "is_active": clinic.is_active,
    }


@router.put("/me")
async def update_my_clinic(
    body: dict,
    user: CurrentUser = Depends(require_roles("clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Clinic).where(Clinic.id == user.clinic_id))
    clinic = result.scalar_one_or_none()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    for field in ["name", "phone", "email", "address", "city", "state", "pincode", "timings", "settings", "logo_url"]:
        if field in body:
            setattr(clinic, field, body[field])
    await db.commit()
    return {"id": str(clinic.id), "name": clinic.name}


@router.get("/branches")
async def list_branches(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ClinicBranch).where(ClinicBranch.clinic_id == user.clinic_id)
    )
    branches = result.scalars().all()
    return {
        "branches": [
            {
                "id": str(b.id),
                "name": b.name,
                "address": b.address,
                "city": b.city,
                "state": b.state,
                "pincode": b.pincode,
                "phone": b.phone,
                "timings": b.timings,
                "is_active": b.is_active,
            }
            for b in branches
        ],
    }


@router.post("/branches")
async def create_branch(
    body: dict,
    user: CurrentUser = Depends(require_roles("clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    branch = ClinicBranch(
        clinic_id=user.clinic_id,
        name=body["name"],
        address=body.get("address"),
        city=body.get("city"),
        state=body.get("state"),
        pincode=body.get("pincode"),
        phone=body.get("phone"),
        timings=body.get("timings"),
    )
    db.add(branch)
    await db.commit()
    await db.refresh(branch)
    return {"id": str(branch.id), "name": branch.name}


@router.put("/branches/{branch_id}")
async def update_branch(
    branch_id: str,
    body: dict,
    user: CurrentUser = Depends(require_roles("clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ClinicBranch).where(ClinicBranch.id == branch_id, ClinicBranch.clinic_id == user.clinic_id)
    )
    branch = result.scalar_one_or_none()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    for field in ["name", "address", "city", "state", "pincode", "phone", "timings", "is_active"]:
        if field in body:
            setattr(branch, field, body[field])
    await db.commit()
    return {"id": str(branch.id), "name": branch.name}
