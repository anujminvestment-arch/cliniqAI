from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User, ClinicMembership, RefreshToken
from app.models.clinic import Clinic
from app.schemas.auth import LoginRequest, RegisterRequest, AuthResponse, TokenResponse
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_token,
)
from app.core.deps import get_current_user, CurrentUser
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email.lower()))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    # Get memberships
    result = await db.execute(
        select(ClinicMembership).where(ClinicMembership.user_id == user.id, ClinicMembership.is_active == True)
    )
    memberships = result.scalars().all()

    if not memberships:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No clinic membership found")

    membership = memberships[0]

    access_token = create_access_token({
        "userId": str(user.id),
        "clinicId": str(membership.clinic_id),
        "role": membership.role,
        "email": user.email,
    })

    raw_refresh = create_refresh_token({"userId": str(user.id)})

    # Store refresh token hash
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hash_token(raw_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    ))
    await db.commit()

    return {
        "user": {"id": str(user.id), "name": user.name, "email": user.email},
        "membership": {"clinic_id": str(membership.clinic_id), "role": membership.role},
        "access_token": access_token,
        "refresh_token": raw_refresh,
    }


@router.post("/register")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check existing
    result = await db.execute(select(User).where(User.email == body.email.lower()))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        name=body.name,
        email=body.email.lower(),
        phone=body.phone,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    await db.flush()

    role = "patient"
    if body.clinic_name and body.clinic_slug:
        clinic = Clinic(name=body.clinic_name, slug=body.clinic_slug, owner_id=user.id)
        db.add(clinic)
        await db.flush()
        clinic_id = clinic.id
        role = "clinic_owner"
    else:
        result = await db.execute(select(Clinic).limit(1))
        clinic = result.scalar_one_or_none()
        if not clinic:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No clinic available")
        clinic_id = clinic.id

    db.add(ClinicMembership(user_id=user.id, clinic_id=clinic_id, role=role))

    access_token = create_access_token({
        "userId": str(user.id),
        "clinicId": str(clinic_id),
        "role": role,
        "email": user.email,
    })
    raw_refresh = create_refresh_token({"userId": str(user.id)})

    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hash_token(raw_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    ))
    await db.commit()

    return {
        "user": {"id": str(user.id), "name": user.name, "email": user.email},
        "membership": {"clinic_id": str(clinic_id), "role": role},
        "access_token": access_token,
        "refresh_token": raw_refresh,
    }


@router.post("/refresh")
async def refresh_token(body: TokenResponse, db: AsyncSession = Depends(get_db)):
    payload = decode_refresh_token(body.refresh_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    token_hash = hash_token(body.refresh_token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == payload["userId"],
            RefreshToken.token_hash == token_hash,
        )
    )
    stored = result.scalar_one_or_none()
    if not stored or stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired or revoked")

    # Rotate
    await db.delete(stored)

    result = await db.execute(
        select(ClinicMembership).where(
            ClinicMembership.user_id == payload["userId"],
            ClinicMembership.is_active == True,
        )
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No membership")

    new_access = create_access_token({
        "userId": payload["userId"],
        "clinicId": str(membership.clinic_id),
        "role": membership.role,
        "email": "",
    })
    new_refresh = create_refresh_token({"userId": payload["userId"]})

    db.add(RefreshToken(
        user_id=payload["userId"],
        token_hash=hash_token(new_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    ))
    await db.commit()

    return {"access_token": new_access, "refresh_token": new_refresh}


@router.post("/logout")
async def logout(user: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Delete all refresh tokens for this user
    result = await db.execute(select(RefreshToken).where(RefreshToken.user_id == user.user_id))
    for token in result.scalars().all():
        await db.delete(token)
    await db.commit()
    return {"success": True}


@router.get("/me")
async def me(user: CurrentUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user.user_id))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    result = await db.execute(
        select(ClinicMembership, Clinic)
        .join(Clinic, ClinicMembership.clinic_id == Clinic.id)
        .where(ClinicMembership.user_id == db_user.id)
    )
    memberships = [
        {
            "clinic_id": str(m.clinic_id),
            "role": m.role,
            "clinic_name": c.name,
            "clinic_slug": c.slug,
        }
        for m, c in result.all()
    ]

    return {
        "user": {
            "id": str(db_user.id),
            "name": db_user.name,
            "email": db_user.email,
            "phone": db_user.phone,
        },
        "memberships": memberships,
        "current_clinic_id": user.clinic_id,
        "current_role": user.role,
    }


@router.post("/change-password")
async def change_password(
    body: dict,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user.user_id))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(body.get("current_password", ""), db_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    db_user.password_hash = hash_password(body["new_password"])
    await db.commit()
    return {"success": True}


@router.post("/forgot-password")
async def forgot_password(body: dict, db: AsyncSession = Depends(get_db)):
    """Send password reset link. In production, sends email. For now, returns reset token."""
    email = body.get("email", "").lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        # Don't reveal whether email exists
        return {"success": True, "message": "If the email exists, a reset link has been sent."}

    # Generate reset token (using refresh token mechanism)
    reset_token = create_refresh_token({"userId": str(user.id), "purpose": "reset"})
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hash_token(reset_token),
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    ))
    await db.commit()
    # In production: send email with reset link containing reset_token
    return {"success": True, "message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(body: dict, db: AsyncSession = Depends(get_db)):
    """Reset password using token from forgot-password."""
    token = body.get("token", "")
    new_password = body.get("new_password", "")

    payload = decode_refresh_token(token)
    if not payload or payload.get("purpose") != "reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    token_hash_val = hash_token(token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == payload["userId"],
            RefreshToken.token_hash == token_hash_val,
        )
    )
    stored = result.scalar_one_or_none()
    if not stored or stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    await db.delete(stored)

    result = await db.execute(select(User).where(User.id == payload["userId"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(new_password)
    await db.commit()
    return {"success": True}
