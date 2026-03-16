from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, desc, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.deps import get_current_user, CurrentUser
from app.models import Conversation, ConversationMessage, ConversationExtraction, Patient

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("")
async def list_conversations(
    channel: str | None = None,
    search: str | None = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Conversation, Patient.name.label("patient_name"), Patient.phone.label("patient_phone"))
        .outerjoin(Patient, Conversation.patient_id == Patient.id)
        .where(Conversation.clinic_id == user.clinic_id)
        .order_by(desc(Conversation.created_at))
        .limit(limit)
        .offset(offset)
    )

    if channel:
        query = query.where(Conversation.channel == channel)

    if search:
        query = query.where(
            or_(
                Conversation.ai_summary.ilike(f"%{search}%"),
                Conversation.transcript.ilike(f"%{search}%"),
            )
        )

    # If patient role, only show their own
    if user.role == "patient":
        query = query.where(
            Conversation.patient_id.in_(
                select(Patient.id).where(
                    Patient.user_id == user.user_id,
                    Patient.clinic_id == user.clinic_id,
                )
            )
        )

    result = await db.execute(query)
    rows = result.all()

    return [
        {
            "id": str(conv.id),
            "channel": conv.channel,
            "caller_phone": conv.caller_phone,
            "status": conv.status,
            "duration": conv.duration,
            "ai_summary": conv.ai_summary,
            "sentiment": conv.sentiment,
            "language": conv.language,
            "created_at": conv.created_at.isoformat() if conv.created_at else None,
            "patient_name": patient_name,
            "patient_phone": patient_phone,
        }
        for conv, patient_name, patient_phone in rows
    ]


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: UUID,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation, Patient.name.label("patient_name"), Patient.phone.label("patient_phone"))
        .outerjoin(Patient, Conversation.patient_id == Patient.id)
        .where(
            Conversation.id == conversation_id,
            Conversation.clinic_id == user.clinic_id,
        )
    )
    row = result.one_or_none()
    if not row:
        return None

    conv, patient_name, patient_phone = row

    # Get messages
    msg_result = await db.execute(
        select(ConversationMessage)
        .where(ConversationMessage.conversation_id == conversation_id)
        .order_by(ConversationMessage.timestamp)
    )
    messages = [
        {
            "id": str(m.id),
            "role": m.role,
            "content": m.content,
            "timestamp": m.timestamp.isoformat() if m.timestamp else None,
        }
        for m in msg_result.scalars().all()
    ]

    # Get extractions
    ext_result = await db.execute(
        select(ConversationExtraction)
        .where(ConversationExtraction.conversation_id == conversation_id)
    )
    extractions = [
        {
            "id": str(e.id),
            "type": e.extraction_type,
            "data": e.data,
            "confidence": e.confidence,
        }
        for e in ext_result.scalars().all()
    ]

    return {
        "id": str(conv.id),
        "channel": conv.channel,
        "caller_phone": conv.caller_phone,
        "status": conv.status,
        "duration": conv.duration,
        "recording_url": conv.recording_url,
        "transcript": conv.transcript,
        "ai_summary": conv.ai_summary,
        "sentiment": conv.sentiment,
        "language": conv.language,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "patient_name": patient_name,
        "patient_phone": patient_phone,
        "messages": messages,
        "extractions": extractions,
    }
