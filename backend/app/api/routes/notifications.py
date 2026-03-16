from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.notification import Notification, NotificationTemplate
from app.core.deps import get_current_user, CurrentUser

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(
    channel: str | None = None,
    status: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Notification).where(Notification.clinic_id == user.clinic_id)
    if channel:
        query = query.where(Notification.channel == channel)
    if status:
        query = query.where(Notification.status == status)
    query = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    notifications = result.scalars().all()

    return {
        "notifications": [
            {
                "id": str(n.id),
                "channel": n.channel,
                "recipient_phone": n.recipient_phone,
                "subject": n.subject,
                "content": n.content,
                "status": n.status,
                "event": n.event,
                "sent_at": n.sent_at.isoformat() if n.sent_at else None,
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in notifications
        ],
    }


@router.get("/templates")
async def list_templates(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(NotificationTemplate).where(
            (NotificationTemplate.clinic_id == user.clinic_id) | (NotificationTemplate.clinic_id == None)
        )
    )
    templates = result.scalars().all()
    return {
        "templates": [
            {
                "id": str(t.id),
                "name": t.name,
                "event": t.event,
                "channel": t.channel,
                "template_text": t.template_text,
                "is_active": t.is_active,
            }
            for t in templates
        ],
    }
