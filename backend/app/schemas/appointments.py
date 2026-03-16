from pydantic import BaseModel
from datetime import date, time


class AppointmentCreate(BaseModel):
    doctor_id: str
    patient_id: str
    date: date
    start_time: time
    duration_minutes: int = 15
    type: str = "consultation"
    symptoms_summary: str | None = None
    booking_source: str = "portal"


class AppointmentUpdate(BaseModel):
    date: date | None = None
    start_time: time | None = None
    duration_minutes: int | None = None
    status: str | None = None
    symptoms_summary: str | None = None
    consultation_notes: str | None = None
    diagnosis: str | None = None
    follow_up_date: date | None = None
    follow_up_notes: str | None = None
    cancellation_reason: str | None = None


class AppointmentStatusUpdate(BaseModel):
    status: str  # scheduled, in_progress, completed, cancelled
    cancellation_reason: str | None = None
