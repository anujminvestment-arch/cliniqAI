from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.db.session import AsyncSessionLocal
from app.models.audit import AuditLog
from app.core.security import decode_access_token
import logging

logger = logging.getLogger(__name__)

MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
SKIP_PATHS = {"/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/health"}


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        # Only log mutating requests that succeeded
        if request.method not in MUTATING_METHODS:
            return response
        if response.status_code >= 400:
            return response

        path = request.url.path
        if path in SKIP_PATHS:
            return response

        # Extract user from token
        user_id = None
        clinic_id = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.removeprefix("Bearer ")
            payload = decode_access_token(token)
            if payload:
                user_id = payload.get("userId")
                clinic_id = payload.get("clinicId")

        # Determine resource type from path
        parts = path.strip("/").split("/")
        resource_type = parts[1] if len(parts) > 1 else "unknown"
        resource_id = parts[2] if len(parts) > 2 else None

        try:
            async with AsyncSessionLocal() as db:
                db.add(AuditLog(
                    clinic_id=clinic_id,
                    user_id=user_id,
                    action=request.method,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    ip_address=request.client.host if request.client else None,
                    user_agent=request.headers.get("User-Agent", "")[:500],
                ))
                await db.commit()
        except Exception as e:
            logger.error(f"Audit log failed: {e}")

        return response
