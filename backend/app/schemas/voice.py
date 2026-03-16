from pydantic import BaseModel
from uuid import UUID


class SearchDoctorsRequest(BaseModel):
    clinic_id: UUID
    symptoms: list[str]
    caller_phone: str | None = None


class DoctorSuggestion(BaseModel):
    doctor_id: UUID
    name: str
    specialization: str | None
    fee: float | None
    rating: float
    experience_years: int | None
    queue_length: int
    next_token: int
    estimated_wait: int
    next_slot: str | None


class SearchDoctorsResponse(BaseModel):
    doctors: list[DoctorSuggestion]


class BookAppointmentRequest(BaseModel):
    clinic_id: UUID
    doctor_id: UUID
    patient_phone: str
    patient_name: str
    date: str
    start_time: str
    symptoms: str | None = None


class BookAppointmentResponse(BaseModel):
    appointment_code: str
    token_number: int
    estimated_wait: int
    doctor_name: str
    fee: float | None
    date: str
    time: str


class CheckQueueRequest(BaseModel):
    clinic_id: UUID
    doctor_id: UUID | None = None
    patient_phone: str | None = None


class CheckQueueResponse(BaseModel):
    queue_length: int
    patient_position: int | None
    estimated_wait: int | None
    current_token: int | None


class ClinicInfoRequest(BaseModel):
    clinic_id: UUID
    query: str | None = None


class ClinicInfoResponse(BaseModel):
    name: str
    address: str | None
    phone: str | None
    timings: dict | None
    answer: str | None = None


class RegisterPatientRequest(BaseModel):
    clinic_id: UUID
    name: str
    phone: str
    date_of_birth: str | None = None
    gender: str | None = None


class RegisterPatientResponse(BaseModel):
    patient_id: UUID
    unique_code: str
    is_new: bool
    name: str


class CancelAppointmentRequest(BaseModel):
    clinic_id: UUID
    appointment_code: str | None = None
    patient_phone: str | None = None


class CancelAppointmentResponse(BaseModel):
    success: bool
    appointment_code: str | None
    message: str


class SimulateRequest(BaseModel):
    clinic_id: UUID
    action: str
    params: dict
