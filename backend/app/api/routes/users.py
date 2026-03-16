from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.core.deps import get_current_user, CurrentUser
from app.schemas.users import UserProfileUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/profile")
async def get_profile(user: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user.user_id))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(db_user.id),
        "name": db_user.name,
        "email": db_user.email,
        "phone": db_user.phone,
        "is_active": db_user.is_active,
        "created_at": db_user.created_at.isoformat() if db_user.created_at else None,
    }


@router.put("/me/profile")
async def update_profile(
    body: UserProfileUpdate,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user.user_id))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.name is not None:
        db_user.name = body.name
    if body.phone is not None:
        db_user.phone = body.phone
    if body.email is not None:
        db_user.email = body.email
    await db.commit()
    return {
        "id": str(db_user.id),
        "name": db_user.name,
        "email": db_user.email,
        "phone": db_user.phone,
    }
