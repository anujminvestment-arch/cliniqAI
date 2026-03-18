from typing import Optional

from pydantic import BaseModel
from datetime import date as DateType, time as TimeType


class AppointmentCreate(BaseModel):
    doctor_id: str
    patient_id: str
    date: DateType
    start_time: TimeType
    duration_minutes: int = 15
    type: str = "consultation"
    symptoms_summary: Optional[str] = None
    booking_source: str = "portal"


class AppointmentUpdate(BaseModel):
    date: Optional[DateType] = None
    start_time: Optional[TimeType] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None
    symptoms_summary: Optional[str] = None
    consultation_notes: Optional[str] = None
    diagnosis: Optional[str] = None
    follow_up_date: Optional[DateType] = None
    follow_up_notes: Optional[str] = None
    cancellation_reason: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: str
    cancellation_reason: Optional[str] = None
