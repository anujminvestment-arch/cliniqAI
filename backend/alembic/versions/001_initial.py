"""Initial migration - all Phase 1 tables

Revision ID: 001_initial
Revises:
Create Date: 2026-03-16
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # ── users ──────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # ── clinics ────────────────────────────────────────────────────────
    op.create_table(
        "clinics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), unique=True, nullable=False),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("state", sa.String(100), nullable=True),
        sa.Column("pincode", sa.String(10), nullable=True),
        sa.Column("timings", postgresql.JSONB(), nullable=True),
        sa.Column("settings", postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column("logo_url", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # ── clinic_memberships ─────────────────────────────────────────────
    op.create_table(
        "clinic_memberships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("role", sa.String(50), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.UniqueConstraint("user_id", "clinic_id", name="idx_membership_user_clinic"),
    )

    # ── refresh_tokens ─────────────────────────────────────────────────
    op.create_table(
        "refresh_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # ── doctors ────────────────────────────────────────────────────────
    op.create_table(
        "doctors",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("specialization", sa.String(255), nullable=True),
        sa.Column("qualification", sa.String(500), nullable=True),
        sa.Column("experience_years", sa.Integer(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("photo_url", sa.Text(), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("consultation_fee", sa.Numeric(10, 2), nullable=True),
        sa.Column("avg_rating", sa.Numeric(3, 2), server_default=sa.text("0")),
        sa.Column("total_reviews", sa.Integer(), server_default=sa.text("0")),
        sa.Column("total_patients", sa.Integer(), server_default=sa.text("0")),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_doctors_clinic_id", "doctors", ["clinic_id"])
    op.create_index("idx_doctors_user_id", "doctors", ["user_id"])

    # ── patients ───────────────────────────────────────────────────────
    op.create_table(
        "patients",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("gender", sa.String(20), nullable=True),
        sa.Column("blood_group", sa.String(10), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("emergency_contact", sa.String(20), nullable=True),
        sa.Column("abha_id", sa.String(50), nullable=True),
        sa.Column("aadhaar_hash", sa.String(64), nullable=True),
        sa.Column("medical_history", postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column("registration_source", sa.String(50), nullable=True),
        sa.Column("unique_code", sa.String(20), unique=True, nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.UniqueConstraint("clinic_id", "phone", name="idx_patients_clinic_phone"),
    )

    # ── doctor_patient_relationships ───────────────────────────────────
    op.create_table(
        "doctor_patient_relationships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("first_visit", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("last_visit", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("total_visits", sa.Integer(), server_default=sa.text("1")),
        sa.Column("total_spent", sa.Numeric(10, 2), server_default=sa.text("0")),
        sa.Column("primary_diagnosis", sa.String(500), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(50), server_default=sa.text("'active'")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.UniqueConstraint("clinic_id", "doctor_id", "patient_id", name="idx_dpr_unique"),
    )
    op.create_index("idx_dpr_clinic", "doctor_patient_relationships", ["clinic_id"])

    # ── appointments ───────────────────────────────────────────────────
    op.create_table(
        "appointments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("appointment_code", sa.String(20), unique=True, nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=True),
        sa.Column("duration_minutes", sa.Integer(), server_default=sa.text("15")),
        sa.Column("type", sa.String(50), server_default=sa.text("'consultation'")),
        sa.Column("status", sa.String(50), server_default=sa.text("'scheduled'")),
        sa.Column("booking_source", sa.String(50), nullable=True),
        sa.Column("symptoms_summary", sa.Text(), nullable=True),
        sa.Column("consultation_notes", sa.Text(), nullable=True),
        sa.Column("diagnosis", sa.Text(), nullable=True),
        sa.Column("follow_up_date", sa.Date(), nullable=True),
        sa.Column("follow_up_notes", sa.Text(), nullable=True),
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_appointments_clinic_date", "appointments", ["clinic_id", "date"])
    op.create_index("idx_appointments_doctor_date", "appointments", ["doctor_id", "date"])
    op.create_index("idx_appointments_patient", "appointments", ["clinic_id", "patient_id"])

    # ── queue_entries ──────────────────────────────────────────────────
    op.create_table(
        "queue_entries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("appointment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("appointments.id"), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("token_number", sa.Integer(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(50), server_default=sa.text("'waiting'")),
        sa.Column("type", sa.String(50), server_default=sa.text("'appointment'")),
        sa.Column("check_in_time", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("called_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("estimated_wait", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.UniqueConstraint("clinic_id", "doctor_id", "date", "token_number", name="idx_queue_doctor_date_token"),
    )
    op.create_index("idx_queue_live", "queue_entries", ["clinic_id", "doctor_id", "date", "status"])

    # ── clinic_branches ────────────────────────────────────────────────
    op.create_table(
        "clinic_branches",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("state", sa.String(100), nullable=True),
        sa.Column("pincode", sa.String(10), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("timings", postgresql.JSONB(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # ── conversations ──────────────────────────────────────────────────
    op.create_table(
        "conversations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=True),
        sa.Column("external_id", sa.String(255), unique=True, nullable=True),
        sa.Column("channel", sa.String(50), nullable=False),
        sa.Column("caller_phone", sa.String(20), nullable=True),
        sa.Column("status", sa.String(50), server_default=sa.text("'completed'")),
        sa.Column("duration", sa.Integer(), nullable=True),
        sa.Column("recording_url", sa.Text(), nullable=True),
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("sentiment", sa.String(50), nullable=True),
        sa.Column("language", sa.String(10), nullable=True),
        sa.Column("stt_provider", sa.String(50), nullable=True),
        sa.Column("metadata", postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_conversations_clinic", "conversations", ["clinic_id"])
    op.create_index("idx_conversations_patient", "conversations", ["clinic_id", "patient_id"])
    op.create_index("idx_conversations_channel", "conversations", ["clinic_id", "channel"])

    # ── conversation_messages ──────────────────────────────────────────
    op.create_table(
        "conversation_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("conversations.id"), nullable=False),
        sa.Column("role", sa.String(50), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("metadata", postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
    )
    op.create_index("idx_conv_messages_conversation", "conversation_messages", ["conversation_id"])

    # ── conversation_extractions ───────────────────────────────────────
    op.create_table(
        "conversation_extractions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("conversations.id"), nullable=False),
        sa.Column("extraction_type", sa.String(100), nullable=False),
        sa.Column("data", postgresql.JSONB(), nullable=False),
        sa.Column("confidence", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_conv_extractions_conversation", "conversation_extractions", ["conversation_id"])

    # ── symptom_specialization_map ─────────────────────────────────────
    op.create_table(
        "symptom_specialization_map",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=True),
        sa.Column("symptom_keyword", sa.String(255), nullable=False),
        sa.Column("specialization", sa.String(255), nullable=False),
        sa.Column("priority", sa.Integer(), server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # ── embeddings ─────────────────────────────────────────────────────
    op.create_table(
        "embeddings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=True),
        sa.Column("doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("doctors.id"), nullable=True),
        sa.Column("source_type", sa.String(50), nullable=False),
        sa.Column("source_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("content_text", sa.Text(), nullable=False),
        sa.Column("embedding", sa.Text(), nullable=True),  # placeholder for vector(1536)
        sa.Column("metadata", postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_embeddings_patient", "embeddings", ["clinic_id", "patient_id"])
    op.create_index("idx_embeddings_source", "embeddings", ["source_type", "source_id"])

    # Convert embedding column to vector(1536)
    op.execute("ALTER TABLE embeddings ALTER COLUMN embedding TYPE vector(1536) USING embedding::vector(1536)")

    # ── knowledge_base ─────────────────────────────────────────────────
    op.create_table(
        "knowledge_base",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=True),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("language", sa.String(10), server_default=sa.text("'en'")),
        sa.Column("tags", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("sub_category", sa.String(100), nullable=True),
        sa.Column("priority", sa.Integer(), server_default=sa.text("0")),
        sa.Column("doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("doctors.id"), nullable=True),
        sa.Column("is_published", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("valid_from", sa.DateTime(timezone=True), nullable=True),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("content_hash", sa.String(64), nullable=True),
        sa.Column("last_embedded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_kb_clinic_category", "knowledge_base", ["clinic_id", "category", "is_published"])
    op.create_index("idx_kb_doctor", "knowledge_base", ["doctor_id"])

    # ── invoices ───────────────────────────────────────────────────────
    op.create_table(
        "invoices",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("appointment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("appointments.id"), nullable=True),
        sa.Column("invoice_number", sa.String(50), unique=True, nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("items", postgresql.JSONB(), server_default=sa.text("'[]'::jsonb")),
        sa.Column("subtotal", sa.Numeric(10, 2), server_default=sa.text("0")),
        sa.Column("tax", sa.Numeric(10, 2), server_default=sa.text("0")),
        sa.Column("discount", sa.Numeric(10, 2), server_default=sa.text("0")),
        sa.Column("total", sa.Numeric(10, 2), server_default=sa.text("0")),
        sa.Column("status", sa.String(50), server_default=sa.text("'pending'")),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_invoices_clinic", "invoices", ["clinic_id"])
    op.create_index("idx_invoices_patient", "invoices", ["clinic_id", "patient_id"])

    # ── payments ───────────────────────────────────────────────────────
    op.create_table(
        "payments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("invoice_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("invoices.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("method", sa.String(50), server_default=sa.text("'razorpay'")),
        sa.Column("razorpay_order_id", sa.String(100), nullable=True),
        sa.Column("razorpay_payment_id", sa.String(100), nullable=True),
        sa.Column("status", sa.String(50), server_default=sa.text("'pending'")),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_payments_invoice", "payments", ["invoice_id"])

    # ── prescriptions ──────────────────────────────────────────────────
    op.create_table(
        "prescriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("appointment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("appointments.id"), nullable=True),
        sa.Column("prescription_code", sa.String(20), unique=True, nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("diagnosis", sa.Text(), nullable=True),
        sa.Column("medications", postgresql.JSONB(), server_default=sa.text("'[]'::jsonb")),
        sa.Column("instructions", sa.Text(), nullable=True),
        sa.Column("follow_up_date", sa.Date(), nullable=True),
        sa.Column("is_signed", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("signed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_prescriptions_clinic", "prescriptions", ["clinic_id"])
    op.create_index("idx_prescriptions_patient", "prescriptions", ["clinic_id", "patient_id"])

    # ── consultation_notes ─────────────────────────────────────────────
    op.create_table(
        "consultation_notes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("appointment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("appointments.id"), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("chief_complaint", sa.Text(), nullable=True),
        sa.Column("subjective", sa.Text(), nullable=True),
        sa.Column("objective", sa.Text(), nullable=True),
        sa.Column("assessment", sa.Text(), nullable=True),
        sa.Column("plan", sa.Text(), nullable=True),
        sa.Column("vitals", postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column("follow_up_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_consultation_clinic", "consultation_notes", ["clinic_id"])
    op.create_index("idx_consultation_patient", "consultation_notes", ["patient_id"])

    # ── notification_templates ─────────────────────────────────────────
    op.create_table(
        "notification_templates",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("event", sa.String(100), nullable=False),
        sa.Column("channel", sa.String(50), server_default=sa.text("'whatsapp'")),
        sa.Column("template_text", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # ── notifications ──────────────────────────────────────────────────
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=True),
        sa.Column("template_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("notification_templates.id"), nullable=True),
        sa.Column("channel", sa.String(50), server_default=sa.text("'whatsapp'")),
        sa.Column("recipient_phone", sa.String(20), nullable=True),
        sa.Column("recipient_email", sa.String(255), nullable=True),
        sa.Column("subject", sa.String(500), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("status", sa.String(50), server_default=sa.text("'pending'")),
        sa.Column("event", sa.String(100), nullable=True),
        sa.Column("metadata", postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_notifications_clinic", "notifications", ["clinic_id"])
    op.create_index("idx_notifications_recipient", "notifications", ["recipient_phone"])

    # ── audit_logs ─────────────────────────────────────────────────────
    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("resource_type", sa.String(100), nullable=False),
        sa.Column("resource_id", sa.String(100), nullable=True),
        sa.Column("details", postgresql.JSONB(), server_default=sa.text("'{}'::jsonb")),
        sa.Column("ip_address", sa.String(50), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_audit_clinic", "audit_logs", ["clinic_id"])
    op.create_index("idx_audit_user", "audit_logs", ["user_id"])
    op.create_index("idx_audit_created", "audit_logs", ["created_at"])

    # ── consent_records ────────────────────────────────────────────────
    op.create_table(
        "consent_records",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("consent_type", sa.String(100), nullable=False),
        sa.Column("granted", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("ip_address", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("idx_consent_patient", "consent_records", ["patient_id"])

    # ── feedback ───────────────────────────────────────────────────────
    op.create_table(
        "feedback",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("appointment_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("appointments.id"), nullable=True),
        sa.Column("doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("doctors.id"), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("category", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_feedback_clinic", "feedback", ["clinic_id"])


def downgrade() -> None:
    op.drop_table("feedback")
    op.drop_table("consent_records")
    op.drop_table("audit_logs")
    op.drop_table("notifications")
    op.drop_table("notification_templates")
    op.drop_table("consultation_notes")
    op.drop_table("prescriptions")
    op.drop_table("payments")
    op.drop_table("invoices")
    op.drop_table("knowledge_base")
    op.drop_table("embeddings")
    op.drop_table("symptom_specialization_map")
    op.drop_table("conversation_extractions")
    op.drop_table("conversation_messages")
    op.drop_table("conversations")
    op.drop_table("clinic_branches")
    op.drop_table("queue_entries")
    op.drop_table("appointments")
    op.drop_table("doctor_patient_relationships")
    op.drop_table("patients")
    op.drop_table("doctors")
    op.drop_table("refresh_tokens")
    op.drop_table("clinic_memberships")
    op.drop_table("clinics")
    op.drop_table("users")
    op.execute("DROP EXTENSION IF EXISTS vector")
