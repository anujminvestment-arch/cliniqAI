from pydantic import BaseModel
from datetime import date as DateType


class MedicationSchema(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: str | None = None


class PrescriptionCreate(BaseModel):
    patient_id: str
    appointment_id: str | None = None
    date: DateType
    diagnosis: str | None = None
    medications: list[MedicationSchema]
    instructions: str | None = None
    follow_up_date: DateType | None = None


class PrescriptionUpdate(BaseModel):
    diagnosis: str | None = None
    medications: list[MedicationSchema] | None = None
    instructions: str | None = None
    follow_up_date: DateType | None = None
