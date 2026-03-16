from pydantic import BaseModel


class QueueCheckIn(BaseModel):
    appointment_id: str | None = None
    patient_id: str
    doctor_id: str
    type: str = "appointment"  # appointment, walkin
