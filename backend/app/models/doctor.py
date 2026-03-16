import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import String, Text, Boolean, DateTime, Integer, Numeric, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Doctor(Base):
    __tablename__ = "doctors"
    __table_args__ = (
        Index("idx_doctors_clinic_id", "clinic_id"),
        Index("idx_doctors_user_id", "user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=False)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    specialization: Mapped[str | None] = mapped_column(String(255))
    qualification: Mapped[str | None] = mapped_column(String(500))
    experience_years: Mapped[int | None] = mapped_column(Integer)
    bio: Mapped[str | None] = mapped_column(Text)
    photo_url: Mapped[str | None] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(255))
    consultation_fee: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    avg_rating: Mapped[Decimal] = mapped_column(Numeric(3, 2), default=Decimal("0"))
    total_reviews: Mapped[int] = mapped_column(Integer, default=0)
    total_patients: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
