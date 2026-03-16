from pydantic import BaseModel
from datetime import date


class PatientCreate(BaseModel):
    name: str
    phone: str
    email: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    blood_group: str | None = None
    address: str | None = None
    emergency_contact: str | None = None
    registration_source: str | None = "portal"


class PatientUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    blood_group: str | None = None
    address: str | None = None
    emergency_contact: str | None = None
