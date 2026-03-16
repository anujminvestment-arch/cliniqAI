"""Seed database with test data."""
import asyncio
import uuid
from datetime import date, datetime, time, timezone
from decimal import Decimal

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.models import *  # noqa: F401, F403 — import all models to register them


async def seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        print("Seeding database...")

        # 1. Create clinic owner user
        owner = User(
            name="Dr. Rajesh Sharma",
            email="rajesh@cityclinic.in",
            phone="+919876543210",
            password_hash=hash_password("Admin@123"),
        )
        db.add(owner)
        await db.flush()
        print(f"Created user: {owner.email}")

        # 2. Create clinic
        clinic = Clinic(
            name="City Dental & Multi-Specialty Clinic",
            slug="city-dental-bangalore",
            owner_id=owner.id,
            phone="+918012345678",
            email="info@cityclinic.in",
            address="123, MG Road, Indiranagar",
            city="Bangalore",
            state="Karnataka",
            pincode="560038",
            timings={
                "mon": {"open": "10:00", "close": "18:00"},
                "tue": {"open": "10:00", "close": "18:00"},
                "wed": {"open": "10:00", "close": "18:00"},
                "thu": {"open": "10:00", "close": "18:00"},
                "fri": {"open": "10:00", "close": "18:00"},
                "sat": {"open": "10:00", "close": "14:00"},
            },
            settings={"aiVoiceEnabled": True, "language": "hi", "avgConsultationMinutes": 15},
        )
        db.add(clinic)
        await db.flush()
        print(f"Created clinic: {clinic.name}")

        # 3. Clinic membership for owner
        db.add(ClinicMembership(user_id=owner.id, clinic_id=clinic.id, role="clinic_owner"))

        # 4. Doctors
        doctors = [
            Doctor(
                clinic_id=clinic.id, user_id=owner.id, name="Dr. Rajesh Sharma",
                specialization="Dentist", qualification="BDS, MDS Orthodontics",
                experience_years=12, phone="+919876543210", email="rajesh@cityclinic.in",
                consultation_fee=Decimal("500.00"), avg_rating=Decimal("4.80"),
                total_reviews=156, total_patients=1200,
            ),
            Doctor(
                clinic_id=clinic.id, name="Dr. Priya Mehta",
                specialization="Dentist", qualification="BDS",
                experience_years=5, phone="+919876543211", email="priya@cityclinic.in",
                consultation_fee=Decimal("300.00"), avg_rating=Decimal("4.50"),
                total_reviews=89, total_patients=650,
            ),
            Doctor(
                clinic_id=clinic.id, name="Dr. Amit Kumar",
                specialization="General Physician", qualification="MBBS, MD Internal Medicine",
                experience_years=8, phone="+919876543212", email="amit@cityclinic.in",
                consultation_fee=Decimal("400.00"), avg_rating=Decimal("4.60"),
                total_reviews=112, total_patients=890,
            ),
        ]
        db.add_all(doctors)
        await db.flush()
        print(f"Created {len(doctors)} doctors")

        # Create users + memberships for other doctors
        for doc in doctors[1:]:
            doc_user = User(
                name=doc.name, email=doc.email, phone=doc.phone,
                password_hash=hash_password("Admin@123"),
            )
            db.add(doc_user)
            await db.flush()
            doc.user_id = doc_user.id
            db.add(ClinicMembership(user_id=doc_user.id, clinic_id=clinic.id, role="doctor"))

        # 5. Patients
        patients_data = [
            {"name": "Vikram Singh", "phone": "+919812345001", "email": "vikram@patient.com",
             "gender": "male", "date_of_birth": date(1990, 5, 15), "registration_source": "portal", "unique_code": "PAT-2026-0001"},
            {"name": "Ananya Gupta", "phone": "+919812345002", "email": "ananya@patient.com",
             "gender": "female", "date_of_birth": date(1985, 8, 22), "registration_source": "ai_call", "unique_code": "PAT-2026-0002"},
            {"name": "Mohammed Faisal", "phone": "+919812345003",
             "gender": "male", "date_of_birth": date(1978, 12, 1), "registration_source": "manual", "unique_code": "PAT-2026-0003"},
            {"name": "Priti Deshmukh", "phone": "+919812345004",
             "gender": "female", "date_of_birth": date(1995, 3, 18), "registration_source": "whatsapp", "unique_code": "PAT-2026-0004"},
            {"name": "Ravi Krishnan", "phone": "+919812345005", "email": "ravi@patient.com",
             "gender": "male", "date_of_birth": date(1982, 11, 7), "registration_source": "qr_code", "unique_code": "PAT-2026-0005"},
        ]
        patients = [Patient(clinic_id=clinic.id, **p) for p in patients_data]
        db.add_all(patients)
        await db.flush()
        print(f"Created {len(patients)} patients")

        # Create patient users
        for p in patients:
            if p.email:
                p_user = User(name=p.name, email=p.email, phone=p.phone, password_hash=hash_password("Admin@123"))
                db.add(p_user)
                await db.flush()
                p.user_id = p_user.id
                db.add(ClinicMembership(user_id=p_user.id, clinic_id=clinic.id, role="patient"))

        # 6. Symptom mappings (global)
        symptom_data = [
            ("tooth pain", "Dentist", 10), ("toothache", "Dentist", 10),
            ("gum pain", "Dentist", 9), ("jaw pain", "Dentist", 8),
            ("cavity", "Dentist", 10), ("tooth sensitivity", "Dentist", 9),
            ("bleeding gums", "Dentist", 9), ("jaw swelling", "Oral Surgeon", 8),
            ("fever", "General Physician", 8), ("cold", "General Physician", 7),
            ("cough", "General Physician", 8), ("headache", "General Physician", 7),
            ("body pain", "General Physician", 7), ("weakness", "General Physician", 6),
            ("vomiting", "General Physician", 7), ("diarrhea", "General Physician", 7),
            ("skin rash", "Dermatologist", 10), ("acne", "Dermatologist", 10),
            ("itching", "Dermatologist", 8), ("hair loss", "Dermatologist", 9),
            ("skin infection", "Dermatologist", 9), ("eczema", "Dermatologist", 10),
            ("pigmentation", "Dermatologist", 8),
            ("knee pain", "Orthopedic", 10), ("back pain", "Orthopedic", 9),
            ("joint pain", "Orthopedic", 9), ("fracture", "Orthopedic", 10),
            ("shoulder pain", "Orthopedic", 8), ("spine pain", "Orthopedic", 9),
            ("eye pain", "Ophthalmologist", 10), ("blurry vision", "Ophthalmologist", 10),
            ("eye redness", "Ophthalmologist", 9), ("watery eyes", "Ophthalmologist", 8),
            ("child fever", "Pediatrician", 10), ("child cough", "Pediatrician", 9),
            ("baby rash", "Pediatrician", 9), ("child vaccination", "Pediatrician", 10),
            ("chest pain", "Cardiologist", 10), ("heart palpitations", "Cardiologist", 10),
            ("high blood pressure", "Cardiologist", 9), ("breathlessness", "Cardiologist", 8),
            ("ear pain", "ENT Specialist", 10), ("sore throat", "ENT Specialist", 8),
            ("hearing loss", "ENT Specialist", 10), ("nose bleeding", "ENT Specialist", 9),
            ("sinus", "ENT Specialist", 9),
            ("pregnancy", "Gynecologist", 10), ("irregular periods", "Gynecologist", 10),
            ("pelvic pain", "Gynecologist", 9),
            ("stomach pain", "Gastroenterologist", 9), ("acidity", "Gastroenterologist", 8),
            ("bloating", "Gastroenterologist", 7), ("constipation", "Gastroenterologist", 7),
        ]
        db.add_all([
            SymptomSpecializationMap(symptom_keyword=s, specialization=sp, priority=p)
            for s, sp, p in symptom_data
        ])
        print(f"Created {len(symptom_data)} symptom mappings")

        # 7. Knowledge base
        kb_entries = [
            KnowledgeBase(
                clinic_id=clinic.id, category="clinic_info",
                title="What are the clinic timings?",
                content="City Dental & Multi-Specialty Clinic is open Monday to Friday from 10:00 AM to 6:00 PM, and Saturday from 10:00 AM to 2:00 PM. The clinic is closed on Sundays and public holidays.",
                tags=["timings", "schedule", "hours"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="clinic_info",
                title="Is parking available?",
                content="Yes, free parking is available for patients. There is a dedicated parking area behind the clinic building with space for 20 cars and 50 two-wheelers.",
                tags=["parking", "directions", "facilities"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="faq",
                title="Do you accept insurance?",
                content="We accept major insurance providers including Star Health, ICICI Lombard, Max Bupa, and HDFC Ergo. Please bring your insurance card and a valid ID.",
                tags=["insurance", "payment", "cashless"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="clinic_info",
                title="How to reach the clinic?",
                content="City Dental & Multi-Specialty Clinic is located at 123, MG Road, Indiranagar, Bangalore - 560038. Nearest metro station: Indiranagar (500m walk).",
                tags=["directions", "location", "address"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="faq",
                title="How do I book an appointment?",
                content="You can book an appointment by: 1) Calling our AI receptionist at +918012345678, 2) Using the CliniqAI patient portal, 3) WhatsApp to +918012345678, 4) Walk in.",
                tags=["booking", "appointment", "how-to"],
            ),
        ]
        db.add_all(kb_entries)
        print(f"Created {len(kb_entries)} knowledge base entries")

        # 8. Sample appointments for today
        today = date.today()
        appts = [
            Appointment(
                clinic_id=clinic.id, doctor_id=doctors[0].id, patient_id=patients[0].id,
                appointment_code="APT-2026-0001", date=today, start_time=time(10, 0),
                status="in_progress", booking_source="portal",
                symptoms_summary="Tooth pain in lower left molar, sensitivity to cold",
            ),
            Appointment(
                clinic_id=clinic.id, doctor_id=doctors[0].id, patient_id=patients[1].id,
                appointment_code="APT-2026-0002", date=today, start_time=time(10, 30),
                status="scheduled", booking_source="ai_call",
                symptoms_summary="Routine dental checkup and cleaning",
            ),
            Appointment(
                clinic_id=clinic.id, doctor_id=doctors[2].id, patient_id=patients[2].id,
                appointment_code="APT-2026-0003", date=today, start_time=time(11, 0),
                status="scheduled", booking_source="whatsapp",
                symptoms_summary="Persistent headache and mild fever for 3 days",
            ),
        ]
        db.add_all(appts)
        await db.flush()
        print(f"Created {len(appts)} appointments")

        # 9. Queue entries
        queue = [
            QueueEntry(
                clinic_id=clinic.id, doctor_id=doctors[0].id, patient_id=patients[0].id,
                appointment_id=appts[0].id, date=today,
                token_number=1, position=1, status="in_progress", estimated_wait=0,
            ),
            QueueEntry(
                clinic_id=clinic.id, doctor_id=doctors[0].id, patient_id=patients[1].id,
                appointment_id=appts[1].id, date=today,
                token_number=2, position=2, status="waiting", estimated_wait=15,
            ),
            QueueEntry(
                clinic_id=clinic.id, doctor_id=doctors[2].id, patient_id=patients[2].id,
                appointment_id=appts[2].id, date=today,
                token_number=1, position=1, status="waiting", estimated_wait=0,
            ),
        ]
        db.add_all(queue)
        print(f"Created {len(queue)} queue entries")

        # 10. Clinic branch
        branch = ClinicBranch(
            clinic_id=clinic.id,
            name="City Dental - Koramangala Branch",
            address="456, 80 Feet Road, Koramangala",
            city="Bangalore",
            state="Karnataka",
            pincode="560034",
            phone="+918012345679",
            timings={
                "mon": {"open": "09:00", "close": "17:00"},
                "tue": {"open": "09:00", "close": "17:00"},
                "wed": {"open": "09:00", "close": "17:00"},
                "thu": {"open": "09:00", "close": "17:00"},
                "fri": {"open": "09:00", "close": "17:00"},
                "sat": {"open": "09:00", "close": "13:00"},
            },
        )
        db.add(branch)
        print("Created 1 clinic branch")

        # 11. Invoices
        invoices = [
            Invoice(
                clinic_id=clinic.id,
                patient_id=patients[0].id,
                appointment_id=appts[0].id,
                invoice_number="INV-20260316-001",
                date=today,
                items=[
                    {"description": "Dental Consultation", "quantity": 1, "unit_price": "500.00", "total": "500.00"},
                    {"description": "Dental X-Ray", "quantity": 1, "unit_price": "300.00", "total": "300.00"},
                ],
                subtotal=Decimal("800.00"),
                tax=Decimal("0.00"),
                discount=Decimal("0.00"),
                total=Decimal("800.00"),
                status="paid",
            ),
            Invoice(
                clinic_id=clinic.id,
                patient_id=patients[1].id,
                invoice_number="INV-20260316-002",
                date=today,
                items=[
                    {"description": "Dental Cleaning", "quantity": 1, "unit_price": "1500.00", "total": "1500.00"},
                ],
                subtotal=Decimal("1500.00"),
                tax=Decimal("0.00"),
                discount=Decimal("100.00"),
                total=Decimal("1400.00"),
                status="pending",
            ),
            Invoice(
                clinic_id=clinic.id,
                patient_id=patients[2].id,
                appointment_id=appts[2].id,
                invoice_number="INV-20260316-003",
                date=today,
                items=[
                    {"description": "General Consultation", "quantity": 1, "unit_price": "400.00", "total": "400.00"},
                    {"description": "Blood Test", "quantity": 1, "unit_price": "600.00", "total": "600.00"},
                ],
                subtotal=Decimal("1000.00"),
                tax=Decimal("0.00"),
                discount=Decimal("0.00"),
                total=Decimal("1000.00"),
                status="pending",
            ),
        ]
        db.add_all(invoices)
        await db.flush()
        print(f"Created {len(invoices)} invoices")

        # 12. Payment for first invoice
        payment = Payment(
            clinic_id=clinic.id,
            invoice_id=invoices[0].id,
            patient_id=patients[0].id,
            amount=Decimal("800.00"),
            method="upi",
            status="completed",
            paid_at=datetime.now(timezone.utc),
        )
        db.add(payment)
        print("Created 1 payment")

        # 13. Prescriptions
        prescriptions = [
            Prescription(
                clinic_id=clinic.id,
                doctor_id=doctors[0].id,
                patient_id=patients[0].id,
                appointment_id=appts[0].id,
                prescription_code="RX-2026-0001",
                date=today,
                diagnosis="Dental caries in lower left second molar",
                medications=[
                    {"name": "Amoxicillin 500mg", "dosage": "500mg", "frequency": "3 times a day", "duration": "5 days", "instructions": "After food"},
                    {"name": "Ibuprofen 400mg", "dosage": "400mg", "frequency": "Twice a day", "duration": "3 days", "instructions": "After food, for pain"},
                    {"name": "Chlorhexidine Mouthwash", "dosage": "10ml", "frequency": "Twice a day", "duration": "7 days", "instructions": "Gargle for 30 seconds after brushing"},
                ],
                instructions="Avoid hard and sticky food for 48 hours. Follow up in 1 week for restoration.",
                follow_up_date=date(2026, 3, 23),
                is_signed=True,
                signed_at=datetime.now(timezone.utc),
            ),
            Prescription(
                clinic_id=clinic.id,
                doctor_id=doctors[2].id,
                patient_id=patients[2].id,
                appointment_id=appts[2].id,
                prescription_code="RX-2026-0002",
                date=today,
                diagnosis="Viral fever with mild pharyngitis",
                medications=[
                    {"name": "Paracetamol 650mg", "dosage": "650mg", "frequency": "3 times a day", "duration": "3 days", "instructions": "After food, SOS for fever > 100\u00b0F"},
                    {"name": "Cetirizine 10mg", "dosage": "10mg", "frequency": "Once at bedtime", "duration": "5 days", "instructions": "At night"},
                ],
                instructions="Plenty of fluids. Rest for 2-3 days. Return if fever persists beyond 3 days.",
                is_signed=False,
            ),
        ]
        db.add_all(prescriptions)
        await db.flush()
        print(f"Created {len(prescriptions)} prescriptions")

        # 14. Consultation notes
        consultation_notes = [
            ConsultationNote(
                clinic_id=clinic.id,
                doctor_id=doctors[0].id,
                patient_id=patients[0].id,
                appointment_id=appts[0].id,
                date=today,
                chief_complaint="Pain in lower left back tooth for 2 days, aggravated by cold food",
                subjective="Patient reports sharp shooting pain in lower left molar area since 2 days. Pain increases with cold food/beverages. No swelling. No history of trauma.",
                objective="Clinical exam: Cavity visible in #36 (lower left first molar), tenderness on percussion. Gingiva appears normal. No swelling.",
                assessment="Dental caries in #36 with possible pulpitis. X-ray advised for extent.",
                plan="1. Prescribed antibiotics and analgesics\n2. X-ray ordered\n3. Temporary restoration if needed\n4. Follow up in 1 week for permanent restoration",
                vitals={"blood_pressure": "120/80", "pulse": "72", "temperature": "98.6\u00b0F"},
                follow_up_date=date(2026, 3, 23),
            ),
        ]
        db.add_all(consultation_notes)
        print(f"Created {len(consultation_notes)} consultation notes")

        # 15. Notification templates (global)
        from app.db.seed_templates import DEFAULT_TEMPLATES
        for tmpl in DEFAULT_TEMPLATES:
            db.add(NotificationTemplate(
                clinic_id=None,
                name=tmpl["name"],
                event=tmpl["event"],
                channel=tmpl["channel"],
                template_text=tmpl["template_text"],
            ))
        print(f"Created {len(DEFAULT_TEMPLATES)} notification templates")

        # 16. Sample notifications
        notifications_data = [
            Notification(
                clinic_id=clinic.id,
                patient_id=patients[0].id,
                channel="whatsapp",
                recipient_phone=patients[0].phone,
                content=f"Hi {patients[0].name}, your appointment with Dr. Rajesh Sharma is confirmed for today. Token #1.",
                status="sent",
                event="appointment_booked",
                sent_at=datetime.now(timezone.utc),
            ),
            Notification(
                clinic_id=clinic.id,
                patient_id=patients[1].id,
                channel="whatsapp",
                recipient_phone=patients[1].phone,
                content=f"Hi {patients[1].name}, your appointment with Dr. Rajesh Sharma is confirmed for today. Token #2.",
                status="sent",
                event="appointment_booked",
                sent_at=datetime.now(timezone.utc),
            ),
        ]
        db.add_all(notifications_data)
        print(f"Created {len(notifications_data)} notifications")

        # 17. Consent records
        consents = [
            ConsentRecord(
                clinic_id=clinic.id,
                patient_id=patients[0].id,
                consent_type="data_processing",
                granted=True,
            ),
            ConsentRecord(
                clinic_id=clinic.id,
                patient_id=patients[0].id,
                consent_type="treatment",
                granted=True,
            ),
            ConsentRecord(
                clinic_id=clinic.id,
                patient_id=patients[1].id,
                consent_type="data_processing",
                granted=True,
            ),
        ]
        db.add_all(consents)
        print(f"Created {len(consents)} consent records")

        # 18. Audit log entries
        audit_logs = [
            AuditLog(
                clinic_id=clinic.id,
                user_id=owner.id,
                action="POST",
                resource_type="appointments",
                resource_id=str(appts[0].id),
                details={"patient": patients[0].name, "doctor": doctors[0].name},
                ip_address="127.0.0.1",
            ),
            AuditLog(
                clinic_id=clinic.id,
                user_id=owner.id,
                action="POST",
                resource_type="prescriptions",
                resource_id=str(prescriptions[0].id) if prescriptions else None,
                details={"patient": patients[0].name},
                ip_address="127.0.0.1",
            ),
        ]
        db.add_all(audit_logs)
        print(f"Created {len(audit_logs)} audit logs")

        # 19. Feedback
        feedback_entries = [
            Feedback(
                clinic_id=clinic.id,
                patient_id=patients[0].id,
                doctor_id=doctors[0].id,
                rating=5,
                comment="Excellent treatment by Dr. Rajesh. Very thorough examination and clear explanation.",
                category="consultation",
            ),
            Feedback(
                clinic_id=clinic.id,
                patient_id=patients[1].id,
                doctor_id=doctors[0].id,
                rating=4,
                comment="Good dental cleaning. Slightly long wait but worth it.",
                category="procedure",
            ),
            Feedback(
                clinic_id=clinic.id,
                patient_id=patients[4].id,
                doctor_id=doctors[2].id,
                rating=5,
                comment="Dr. Amit is very patient and knowledgeable. Highly recommended.",
                category="consultation",
            ),
        ]
        db.add_all(feedback_entries)
        print(f"Created {len(feedback_entries)} feedback entries")

        # 20. Staff user (receptionist)
        staff_user = User(
            name="Meena Kumari",
            email="meena@cityclinic.in",
            phone="+919876543220",
            password_hash=hash_password("Admin@123"),
        )
        db.add(staff_user)
        await db.flush()
        db.add(ClinicMembership(user_id=staff_user.id, clinic_id=clinic.id, role="receptionist"))
        print("Created 1 staff user (receptionist)")

        # 21. Super Admin user
        admin_user = User(
            name="Platform Admin",
            email="admin@cliniqai.com",
            phone="+919876543200",
            password_hash=hash_password("Admin@123"),
        )
        db.add(admin_user)
        await db.flush()
        db.add(ClinicMembership(user_id=admin_user.id, clinic_id=clinic.id, role="super_admin"))
        print("Created 1 super admin user")

        await db.commit()

        # Summary
        print("\n" + "=" * 50)
        print("SEED DATA SUMMARY")
        print("=" * 50)
        print(f"  Users:                  {3 + len([p for p in patients if p.email]) + 2} (owner + {len(doctors) - 1} doctors + {len([p for p in patients if p.email])} patients + staff + admin)")
        print(f"  Clinic:                 1")
        print(f"  Clinic Branches:        1")
        print(f"  Doctors:                {len(doctors)}")
        print(f"  Patients:               {len(patients)}")
        print(f"  Symptom Mappings:       {len(symptom_data)}")
        print(f"  Knowledge Base:         {len(kb_entries)}")
        print(f"  Appointments:           {len(appts)}")
        print(f"  Queue Entries:          {len(queue)}")
        print(f"  Invoices:               {len(invoices)}")
        print(f"  Payments:               1")
        print(f"  Prescriptions:          {len(prescriptions)}")
        print(f"  Consultation Notes:     {len(consultation_notes)}")
        print(f"  Notification Templates: {len(DEFAULT_TEMPLATES)}")
        print(f"  Notifications:          {len(notifications_data)}")
        print(f"  Consent Records:        {len(consents)}")
        print(f"  Audit Logs:             {len(audit_logs)}")
        print(f"  Feedback:               {len(feedback_entries)}")
        print("=" * 50)
        print("Seed completed successfully!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
