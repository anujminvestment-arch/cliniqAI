import uuid
from datetime import datetime, date, timezone

from sqlalchemy import String, Text, Boolean, DateTime, Date, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Prescription(Base):
    __tablename__ = "prescriptions"
    __table_args__ = (
        Index("idx_prescriptions_clinic", "clinic_id"),
        Index("idx_prescriptions_patient", "clinic_id", "patient_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=False)
    doctor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    appointment_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("appointments.id"))
    prescription_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    diagnosis: Mapped[str | None] = mapped_column(Text)
    medications: Mapped[list] = mapped_column(JSONB, default=list)
    instructions: Mapped[str | None] = mapped_column(Text)
    follow_up_date: Mapped[date | None] = mapped_column(Date)
    is_signed: Mapped[bool] = mapped_column(Boolean, default=False)
    signed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
