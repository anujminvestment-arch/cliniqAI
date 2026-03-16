from pydantic import BaseModel
from decimal import Decimal


class DoctorCreate(BaseModel):
    name: str
    specialization: str | None = None
    qualification: str | None = None
    experience_years: int | None = None
    bio: str | None = None
    phone: str | None = None
    email: str | None = None
    consultation_fee: Decimal | None = None
    user_id: str | None = None


class DoctorUpdate(BaseModel):
    name: str | None = None
    specialization: str | None = None
    qualification: str | None = None
    experience_years: int | None = None
    bio: str | None = None
    phone: str | None = None
    email: str | None = None
    consultation_fee: Decimal | None = None
    is_active: bool | None = None
