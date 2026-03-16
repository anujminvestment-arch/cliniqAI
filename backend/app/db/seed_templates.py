from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.notification import NotificationTemplate


DEFAULT_TEMPLATES = [
    {
        "name": "Appointment Booked",
        "event": "appointment_booked",
        "channel": "whatsapp",
        "template_text": "Hi {patient_name}, your appointment with {doctor_name} is confirmed for {date} at {time}. Token #{token_number}.",
    },
    {
        "name": "Appointment Cancelled",
        "event": "appointment_cancelled",
        "channel": "whatsapp",
        "template_text": "Hi {patient_name}, your appointment with {doctor_name} on {date} has been cancelled.",
    },
    {
        "name": "Appointment Reminder",
        "event": "appointment_reminder",
        "channel": "whatsapp",
        "template_text": "Reminder: {patient_name}, you have an appointment with {doctor_name} tomorrow at {time}.",
    },
    {
        "name": "Queue Update - Next",
        "event": "queue_next",
        "channel": "whatsapp",
        "template_text": "Hi {patient_name}, you are NEXT! Please proceed to the consultation room.",
    },
    {
        "name": "Queue Update - Position",
        "event": "queue_update",
        "channel": "whatsapp",
        "template_text": "Hi {patient_name}, your queue position is #{position}. Estimated wait: {wait_time} minutes.",
    },
    {
        "name": "Payment Received",
        "event": "payment_received",
        "channel": "whatsapp",
        "template_text": "Hi {patient_name}, payment of \u20b9{amount} received for invoice {invoice_number}. Thank you!",
    },
    {
        "name": "Payment Reminder",
        "event": "payment_reminder",
        "channel": "whatsapp",
        "template_text": "Hi {patient_name}, you have a pending payment of \u20b9{amount} for invoice {invoice_number}. Please pay at your earliest convenience.",
    },
    {
        "name": "Prescription Ready",
        "event": "prescription_ready",
        "channel": "whatsapp",
        "template_text": "Hi {patient_name}, Dr. {doctor_name} has sent your prescription ({prescription_code}). View it in your patient portal.",
    },
]


async def seed_notification_templates(db: AsyncSession):
    """Seed default notification templates if they don't exist."""
    for tmpl in DEFAULT_TEMPLATES:
        result = await db.execute(
            select(NotificationTemplate).where(
                NotificationTemplate.event == tmpl["event"],
                NotificationTemplate.clinic_id == None,
            )
        )
        if not result.scalar_one_or_none():
            db.add(NotificationTemplate(
                clinic_id=None,
                name=tmpl["name"],
                event=tmpl["event"],
                channel=tmpl["channel"],
                template_text=tmpl["template_text"],
            ))
    await db.commit()
