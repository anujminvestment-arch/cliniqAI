from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import decode_access_token
from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser:
    def __init__(self, user_id: str, clinic_id: str, role: str, email: str):
        self.user_id = user_id
        self.clinic_id = clinic_id
        self.role = role
        self.email = email


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    return CurrentUser(
        user_id=payload["userId"],
        clinic_id=payload["clinicId"],
        role=payload["role"],
        email=payload.get("email", ""),
    )


async def verify_voice_api_key(request: Request):
    """Verify API key for voice endpoints (called by Sarvam Samvaad, not JWT-authenticated)."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing API key")

    token = auth_header.removeprefix("Bearer ")
    if token != settings.SARVAM_WEBHOOK_SECRET:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")


def require_roles(*allowed_roles: str):
    """Dependency factory that checks if current user has one of the allowed roles."""
    async def _check(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.role}' not authorized. Required: {', '.join(allowed_roles)}"
            )
        return user
    return _check
