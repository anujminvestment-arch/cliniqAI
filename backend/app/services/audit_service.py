from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog


async def log_action(
    db: AsyncSession,
    *,
    clinic_id: str | None = None,
    user_id: str | None = None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    details: dict | None = None,
    ip_address: str | None = None,
):
    log = AuditLog(
        clinic_id=clinic_id,
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {},
        ip_address=ip_address,
    )
    db.add(log)
