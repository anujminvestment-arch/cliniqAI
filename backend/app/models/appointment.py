import uuid
from datetime import datetime, date, time, timezone

from sqlalchemy import String, Text, DateTime, Date, Time, Integer, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (
        Index("idx_appointments_clinic_date", "clinic_id", "date"),
        Index("idx_appointments_doctor_date", "doctor_id", "date"),
        Index("idx_appointments_patient", "clinic_id", "patient_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=False)
    doctor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    appointment_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time | None] = mapped_column(Time)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=15)
    type: Mapped[str] = mapped_column(String(50), default="consultation")
    status: Mapped[str] = mapped_column(String(50), default="scheduled")
    booking_source: Mapped[str | None] = mapped_column(String(50))
    symptoms_summary: Mapped[str | None] = mapped_column(Text)
    consultation_notes: Mapped[str | None] = mapped_column(Text)
    diagnosis: Mapped[str | None] = mapped_column(Text)
    follow_up_date: Mapped[date | None] = mapped_column(Date)
    follow_up_notes: Mapped[str | None] = mapped_column(Text)
    cancellation_reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
