from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification, NotificationTemplate
from app.services.whatsapp_client import whatsapp_client
from datetime import datetime, timezone
from sqlalchemy import select
import logging

logger = logging.getLogger(__name__)


async def send_notification(
    db: AsyncSession,
    *,
    clinic_id: str,
    patient_id: str | None = None,
    recipient_phone: str | None = None,
    recipient_email: str | None = None,
    event: str,
    content: str,
    subject: str | None = None,
    channel: str = "whatsapp",
    metadata: dict | None = None,
) -> Notification:
    """Send a notification via the appropriate channel."""
    notification = Notification(
        clinic_id=clinic_id,
        patient_id=patient_id,
        channel=channel,
        recipient_phone=recipient_phone,
        recipient_email=recipient_email,
        subject=subject,
        content=content,
        status="pending",
        event=event,
        extra_data=metadata or {},
    )
    db.add(notification)

    # Try WhatsApp first
    if channel == "whatsapp" and recipient_phone:
        try:
            result = await whatsapp_client.send_message(recipient_phone, content)
            if result.get("status") == "skipped":
                notification.status = "skipped"
            else:
                notification.status = "sent"
                notification.sent_at = datetime.now(timezone.utc)
        except Exception as e:
            logger.error(f"WhatsApp send failed: {e}")
            notification.status = "failed"
            notification.extra_data = {**(metadata or {}), "error": str(e)}

    # SMS fallback if WhatsApp failed
    if notification.status == "failed" and recipient_phone:
        notification.channel = "sms"
        # SMS integration placeholder - would call SMS API here
        notification.status = "pending"
        logger.info(f"SMS fallback for {recipient_phone}: {content[:50]}...")

    await db.flush()

    # Also emit real-time in-app notification via Socket.IO
    try:
        from app.core.socketio import emit_notification
        if patient_id:
            # Find user_id for this patient
            from app.models.patient import Patient as PatientModel
            patient_result = await db.execute(
                select(PatientModel.user_id).where(PatientModel.id == patient_id)
            )
            user_id = patient_result.scalar_one_or_none()
            if user_id:
                await emit_notification(str(user_id), {
                    "id": str(notification.id),
                    "event": event,
                    "content": content,
                    "channel": "in_app",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })
    except Exception as e:
        logger.debug(f"Socket.IO emit failed (non-critical): {e}")

    return notification


async def render_template(
    db: AsyncSession,
    event: str,
    clinic_id: str | None = None,
    params: dict | None = None,
) -> str | None:
    """Find and render a notification template for the given event."""
    result = await db.execute(
        select(NotificationTemplate).where(
            NotificationTemplate.event == event,
            NotificationTemplate.is_active == True,
            (NotificationTemplate.clinic_id == clinic_id) | (NotificationTemplate.clinic_id == None),
        ).order_by(NotificationTemplate.clinic_id.desc().nullslast()).limit(1)
    )
    template = result.scalar_one_or_none()
    if not template:
        return None

    text = template.template_text
    if params:
        for key, value in params.items():
            text = text.replace(f"{{{key}}}", str(value))
    return text


async def notify_appointment_booked(
    db: AsyncSession,
    clinic_id: str,
    patient_id: str,
    patient_phone: str,
    patient_name: str,
    doctor_name: str,
    date: str,
    time: str,
    token_number: int | None = None,
):
    content = await render_template(db, "appointment_booked", clinic_id, {
        "patient_name": patient_name,
        "doctor_name": doctor_name,
        "date": date,
        "time": time,
        "token_number": str(token_number or ""),
    })
    if not content:
        content = f"Hi {patient_name}, your appointment with {doctor_name} is confirmed for {date} at {time}."
        if token_number:
            content += f" Token #{token_number}."

    await send_notification(
        db, clinic_id=clinic_id, patient_id=patient_id,
        recipient_phone=patient_phone, event="appointment_booked", content=content,
    )


async def notify_appointment_cancelled(
    db: AsyncSession, clinic_id: str, patient_id: str, patient_phone: str,
    patient_name: str, doctor_name: str, date: str,
):
    content = f"Hi {patient_name}, your appointment with {doctor_name} on {date} has been cancelled."
    await send_notification(
        db, clinic_id=clinic_id, patient_id=patient_id,
        recipient_phone=patient_phone, event="appointment_cancelled", content=content,
    )


async def notify_queue_update(
    db: AsyncSession, clinic_id: str, patient_id: str, patient_phone: str,
    patient_name: str, position: int,
):
    if position == 1:
        content = f"Hi {patient_name}, you are NEXT! Please proceed to the doctor's room."
    elif position <= 3:
        content = f"Hi {patient_name}, you are #{position} in queue. Almost your turn!"
    else:
        content = f"Hi {patient_name}, your queue position is #{position}."
    await send_notification(
        db, clinic_id=clinic_id, patient_id=patient_id,
        recipient_phone=patient_phone, event="queue_update", content=content,
    )


async def notify_payment_received(
    db: AsyncSession, clinic_id: str, patient_id: str, patient_phone: str,
    patient_name: str, amount: str, invoice_number: str,
):
    content = f"Hi {patient_name}, payment of \u20b9{amount} received for invoice {invoice_number}. Thank you!"
    await send_notification(
        db, clinic_id=clinic_id, patient_id=patient_id,
        recipient_phone=patient_phone, event="payment_received", content=content,
    )


async def notify_prescription_ready(
    db: AsyncSession, clinic_id: str, patient_id: str, patient_phone: str,
    patient_name: str, doctor_name: str, prescription_code: str,
):
    content = f"Hi {patient_name}, Dr. {doctor_name} has sent your prescription ({prescription_code}). View it in your patient portal."
    await send_notification(
        db, clinic_id=clinic_id, patient_id=patient_id,
        recipient_phone=patient_phone, event="prescription_ready", content=content,
    )


async def notify_payment_reminder(
    db: AsyncSession, clinic_id: str, patient_id: str, patient_phone: str,
    patient_name: str, amount: str, invoice_number: str,
):
    content = f"Hi {patient_name}, you have a pending payment of \u20b9{amount} for invoice {invoice_number}. Please pay at your earliest convenience."
    await send_notification(
        db, clinic_id=clinic_id, patient_id=patient_id,
        recipient_phone=patient_phone, event="payment_reminder", content=content,
    )
