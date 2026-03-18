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
    engine = create_async_engine(settings.DATABASE_URL, echo=False)

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
        # Hindi / regional symptom keywords
        hindi_symptom_data = [
            # Dental — Hindi
            ("dant dard", "Dentist", 10), ("dant me dard", "Dentist", 10),
            ("daant dard", "Dentist", 10), ("masudo se khoon", "Dentist", 9),
            ("masude me sujan", "Dentist", 9), ("thanda garam lagna", "Dentist", 8),
            ("daant toot gaya", "Dentist", 10), ("daant hil raha hai", "Dentist", 9),
            ("muh me chale", "Dentist", 7), ("muh se badbu", "Dentist", 7),
            # General — Hindi
            ("bukhar", "General Physician", 8), ("sardi", "General Physician", 7),
            ("khansi", "General Physician", 8), ("sir dard", "General Physician", 7),
            ("badan dard", "General Physician", 7), ("kamzori", "General Physician", 6),
            ("ulti", "General Physician", 7), ("dast", "General Physician", 7),
            ("pet dard", "General Physician", 8), ("gas ki problem", "General Physician", 7),
            ("acidity", "General Physician", 7), ("sugar ki bimari", "General Physician", 8),
            ("bp high", "General Physician", 8), ("bp low", "General Physician", 7),
            ("thyroid", "General Physician", 8), ("sans ki taklif", "General Physician", 8),
            ("chakkar aana", "General Physician", 7), ("neend nahi aati", "General Physician", 6),
            ("bhook nahi lagti", "General Physician", 6), ("wajan badh raha hai", "General Physician", 6),
            ("khoon ki kami", "General Physician", 7), ("peshab me jalan", "General Physician", 7),
            # Skin — Hindi
            ("chamdi pe dane", "Dermatologist", 9), ("khujli", "Dermatologist", 8),
            ("baal jhadna", "Dermatologist", 9), ("daag dhabbe", "Dermatologist", 8),
            ("chamdi pe lal nishan", "Dermatologist", 9),
            # Bone — Hindi
            ("ghutne me dard", "Orthopedic", 10), ("kamar dard", "Orthopedic", 9),
            ("jodo me dard", "Orthopedic", 9), ("haddi toot gayi", "Orthopedic", 10),
            ("kandhe me dard", "Orthopedic", 8), ("reedh ki haddi", "Orthopedic", 9),
            # Eye — Hindi
            ("aankh me dard", "Ophthalmologist", 10), ("dhundla dikhta hai", "Ophthalmologist", 10),
            ("aankh lal hai", "Ophthalmologist", 9), ("aankh se paani", "Ophthalmologist", 8),
            # ENT — Hindi
            ("kaan me dard", "ENT Specialist", 10), ("gala kharab", "ENT Specialist", 8),
            ("sunai nahi deta", "ENT Specialist", 10), ("naak se khoon", "ENT Specialist", 9),
            # Child — Hindi
            ("bacche ko bukhar", "Pediatrician", 10), ("bacche ko khansi", "Pediatrician", 9),
            ("bacche ke daant", "Pediatrician", 8), ("bacche ka vaccination", "Pediatrician", 10),
            # Heart — Hindi
            ("seene me dard", "Cardiologist", 10), ("dil ki dhadkan tez", "Cardiologist", 10),
            # Stomach — Hindi
            ("pet me gas", "Gastroenterologist", 8), ("kabz", "Gastroenterologist", 7),
            ("pet phulna", "Gastroenterologist", 7), ("khana hazam nahi hota", "Gastroenterologist", 7),
        ]

        all_symptom_data = symptom_data + hindi_symptom_data
        db.add_all([
            SymptomSpecializationMap(symptom_keyword=s, specialization=sp, priority=p)
            for s, sp, p in all_symptom_data
        ])
        print(f"Created {len(all_symptom_data)} symptom mappings ({len(symptom_data)} English + {len(hindi_symptom_data)} Hindi)")

        # 7. Knowledge base — comprehensive data for AI voice receptionist
        kb_entries = [
            # ── Clinic Info ──────────────────────────────────────────
            KnowledgeBase(
                clinic_id=clinic.id, category="clinic_info", priority=10,
                title="Welcome & Clinic Introduction",
                content="Namaste! Welcome to City Dental & Multi-Specialty Clinic. We are a multi-specialty clinic located in Indiranagar, Bangalore. We have expert doctors for dental care, general medicine, skin care, eye care, ENT, orthopedic, and more. How can I help you today?",
                tags=["welcome", "greeting", "introduction"],
                language="en",
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="clinic_info", priority=10,
                title="Welcome & Clinic Introduction (Hindi)",
                content="नमस्ते! सिटी डेंटल एंड मल्टी-स्पेशियलिटी क्लिनिक में आपका स्वागत है। हम इंदिरानगर, बैंगलोर में स्थित एक मल्टी-स्पेशियलिटी क्लिनिक हैं। हमारे पास डेंटल केयर, जनरल मेडिसिन, स्किन केयर, आँखों, ENT, हड्डियों और अन्य बीमारियों के विशेषज्ञ डॉक्टर हैं। मैं आपकी कैसे मदद कर सकता/सकती हूँ?",
                tags=["welcome", "greeting", "introduction", "hindi"],
                language="hi",
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="clinic_info", priority=9,
                title="What are the clinic timings?",
                content="City Dental & Multi-Specialty Clinic is open Monday to Friday from 10:00 AM to 6:00 PM, and Saturday from 10:00 AM to 2:00 PM. The clinic is closed on Sundays and public holidays. Morning OPD is 10:00 AM to 1:00 PM. Afternoon OPD is 2:00 PM to 6:00 PM. Lunch break is 1:00 PM to 2:00 PM.",
                tags=["timings", "schedule", "hours", "opd"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="clinic_info", priority=9,
                title="Clinic timings (Hindi)",
                content="क्लिनिक सोमवार से शुक्रवार सुबह 10 बजे से शाम 6 बजे तक खुला है। शनिवार को सुबह 10 बजे से दोपहर 2 बजे तक। रविवार और सार्वजनिक छुट्टियों को बंद रहता है। सुबह OPD: 10 से 1 बजे। दोपहर OPD: 2 से 6 बजे। लंच ब्रेक: 1 से 2 बजे।",
                tags=["timings", "schedule", "hours", "hindi"],
                language="hi",
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="clinic_info", priority=8,
                title="How to reach the clinic / Location & Directions",
                content="City Dental & Multi-Specialty Clinic is located at 123, MG Road, Indiranagar, Bangalore - 560038. Nearest metro station: Indiranagar Metro (500m walk, Purple Line). By bus: BMTC buses 500A, 500D stop at Indiranagar BDA Complex (200m). By auto: Tell 'MG Road, Indiranagar' — any auto driver will know. Landmark: Opposite to SBI Indiranagar Branch.",
                tags=["directions", "location", "address", "metro", "bus"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="clinic_info", priority=7,
                title="Parking facility",
                content="Yes, free parking is available for patients. There is a dedicated parking area behind the clinic building with space for 20 cars and 50 two-wheelers. Valet parking is also available during peak hours (10 AM - 12 PM).",
                tags=["parking", "directions", "facilities"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="clinic_info", priority=7,
                title="Languages we speak",
                content="Our staff and doctors can communicate in English, Hindi, Kannada, Tamil, Telugu, and Marathi. Our AI phone receptionist supports Hindi and English. Please let us know your preferred language at the start of the call.",
                tags=["language", "hindi", "kannada", "english", "marathi", "tamil", "telugu"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="clinic_info", priority=6,
                title="Koramangala Branch",
                content="We also have a branch at 456, 80 Feet Road, Koramangala, Bangalore - 560034. Phone: +918012345679. Timings: Monday-Friday 9:00 AM to 5:00 PM, Saturday 9:00 AM to 1:00 PM. Closed Sundays.",
                tags=["branch", "koramangala", "location"],
            ),

            # ── Doctor Profiles ──────────────────────────────────────
            KnowledgeBase(
                clinic_id=clinic.id, category="doctor", priority=10,
                title="Dr. Rajesh Sharma — Dentist (Clinic Owner)",
                content="Dr. Rajesh Sharma is our senior dentist and clinic owner with 12 years of experience. Qualification: BDS, MDS Orthodontics from Rajiv Gandhi University. Specialization: Dental care, root canal, orthodontics (braces), dental implants, cosmetic dentistry, teeth whitening. Consultation fee: ₹500. Available: Monday to Friday 10 AM - 6 PM, Saturday 10 AM - 2 PM. Rating: 4.8/5 from 156 patient reviews. He has treated over 1200 patients.",
                tags=["dentist", "orthodontics", "root canal", "braces", "implants", "dr rajesh"],
                doctor_id=doctors[0].id,
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="doctor", priority=9,
                title="Dr. Priya Mehta — Dentist",
                content="Dr. Priya Mehta is a dentist with 5 years of experience. Qualification: BDS from Manipal University. Specialization: General dentistry, dental cleaning, fillings, tooth extraction, pediatric dentistry (children's dental care). Consultation fee: ₹300. Available: Monday to Friday 10 AM - 6 PM. Rating: 4.5/5 from 89 patient reviews. She has treated over 650 patients. Best for: Children's dental care and routine dental checkups.",
                tags=["dentist", "cleaning", "filling", "extraction", "children", "dr priya"],
                doctor_id=doctors[1].id,
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="doctor", priority=9,
                title="Dr. Amit Kumar — General Physician / Internal Medicine",
                content="Dr. Amit Kumar is a general physician with 8 years of experience. Qualification: MBBS, MD Internal Medicine from AIIMS Delhi. Specialization: Fever, cold, cough, headache, body pain, diabetes, blood pressure, thyroid, infections, viral fever, stomach problems. Consultation fee: ₹400. Available: Monday to Friday 10 AM - 6 PM, Saturday 10 AM - 2 PM. Rating: 4.6/5 from 112 reviews. He has treated over 890 patients. Best for: General health issues, chronic disease management.",
                tags=["general physician", "fever", "cold", "cough", "diabetes", "bp", "dr amit"],
                doctor_id=doctors[2].id,
            ),

            # ── Services & Procedures ─────────────────────────────────
            KnowledgeBase(
                clinic_id=clinic.id, category="services", priority=8,
                title="Dental Services & Procedures",
                content="Our dental services include: 1) Dental Consultation - ₹500 (Dr. Rajesh) / ₹300 (Dr. Priya), 2) Dental Cleaning/Scaling - ₹1,500, 3) Dental Filling - ₹800 to ₹2,000, 4) Root Canal Treatment (RCT) - ₹5,000 to ₹8,000, 5) Tooth Extraction - ₹500 to ₹2,000, 6) Dental X-Ray - ₹300, 7) Teeth Whitening - ₹3,000 to ₹5,000, 8) Braces/Orthodontics - ₹30,000 to ₹60,000, 9) Dental Implants - ₹25,000 to ₹50,000, 10) Crown/Cap - ₹3,000 to ₹8,000.",
                tags=["dental", "services", "rct", "root canal", "cleaning", "filling", "braces", "implant", "whitening", "fees"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="services", priority=8,
                title="General Medicine Services",
                content="Our general medicine services include: 1) General Consultation - ₹400, 2) Blood Test (CBC, Sugar, Thyroid) - ₹600 to ₹1,500, 3) Urine Test - ₹200, 4) ECG - ₹500, 5) Blood Pressure Check - Free with consultation, 6) Diabetes Screening - ₹800, 7) Health Checkup Package (Basic) - ₹2,500, 8) Health Checkup Package (Comprehensive) - ₹5,000, 9) Vaccination - ₹300 to ₹2,000 depending on vaccine.",
                tags=["general medicine", "blood test", "ecg", "health checkup", "vaccination", "fees"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="services", priority=7,
                title="Lab & Diagnostic Services",
                content="We have an in-house lab for basic tests. Available tests: CBC (Complete Blood Count) - ₹300, Blood Sugar (Fasting/PP) - ₹200, Lipid Profile - ₹500, Thyroid Panel - ₹600, Liver Function Test - ₹500, Kidney Function Test - ₹500, Urine Routine - ₹200, HbA1c - ₹500, Dental X-Ray - ₹300, OPG (Full Mouth X-Ray) - ₹800. Reports available same day for most tests. For advanced tests (MRI, CT Scan), we refer to partner diagnostic centers.",
                tags=["lab", "test", "blood test", "x-ray", "diagnostic", "report", "fees"],
            ),

            # ── Symptom → Doctor Routing (for AI) ─────────────────────
            KnowledgeBase(
                clinic_id=clinic.id, category="symptom_routing", priority=10,
                title="Dental Symptoms → Which Doctor?",
                content="If you have any of these problems, you should see our Dentist (Dr. Rajesh Sharma or Dr. Priya Mehta): tooth pain, toothache, dant dard, cavity, gum pain, gum bleeding, masudo se khoon, jaw pain, tooth sensitivity, thanda garam lagna, broken tooth, loose tooth, bad breath, mouth ulcer, teeth alignment (braces needed). For children's dental issues, Dr. Priya Mehta is recommended.",
                tags=["symptom", "dental", "tooth", "routing", "dant", "dard"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="symptom_routing", priority=10,
                title="General Health Symptoms → Which Doctor?",
                content="If you have any of these problems, you should see Dr. Amit Kumar (General Physician): fever (bukhar), cold (sardi), cough (khansi), headache (sir dard), body pain (badan dard), weakness (kamzori), vomiting (ulti), diarrhea (dast), stomach pain (pet dard), acidity, gas, blood pressure issue, diabetes (sugar ki bimari), thyroid, skin infection, allergy, breathing problem (sans ki taklif). For emergency: chest pain, severe breathlessness, high fever above 104°F — please go to hospital emergency.",
                tags=["symptom", "fever", "cold", "cough", "general", "routing", "bukhar", "sardi"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="symptom_routing", priority=9,
                title="Symptom Routing — Hindi Guide",
                content="दांत दर्द, कैविटी, मसूड़ों से खून → Dr. Rajesh या Dr. Priya (Dentist)। बुखार, सर्दी, खांसी, सिर दर्द, पेट दर्द, कमजोरी, उल्टी, दस्त, शुगर, BP → Dr. Amit (General Physician)। बच्चों के दांत → Dr. Priya। अगर आपको नहीं पता कौन सा डॉक्टर सही है, तो अपनी तकलीफ़ बताइए, हम सही डॉक्टर सुझाव देंगे।",
                tags=["symptom", "routing", "hindi"],
                language="hi",
            ),

            # ── Appointment & Queue Info ──────────────────────────────
            KnowledgeBase(
                clinic_id=clinic.id, category="appointment", priority=9,
                title="How to book an appointment?",
                content="You can book an appointment in 4 ways: 1) Call our AI receptionist at +918012345678 — just tell your problem, it will suggest the right doctor and book for you. 2) WhatsApp 'Book' to +918012345678. 3) Use the CliniqAI patient portal at app.cliniqai.com. 4) Walk in directly — we accept walk-ins but appointment patients get priority. Booking is free. You can also ask me to book right now!",
                tags=["booking", "appointment", "how-to", "walk-in"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="appointment", priority=8,
                title="How does the queue / token system work?",
                content="When you book an appointment or arrive at the clinic, you get a token number. You can check your queue position by: 1) Calling this number and asking 'What is my queue status?', 2) Checking the CliniqAI patient portal, 3) Looking at the TV display in the waiting area. Average wait time is 15 minutes per patient. If your token is 5 and currently token 2 is being seen, your estimated wait is about 45 minutes. We will send you a WhatsApp notification when you are next in line.",
                tags=["queue", "token", "wait time", "position"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="appointment", priority=8,
                title="Token System Explained (Hindi)",
                content="जब आप अपॉइंटमेंट बुक करते हैं या क्लिनिक आते हैं, तो आपको एक टोकन नंबर मिलता है। आप अपनी क्यू पोजिशन जानने के लिए: 1) इस नंबर पर कॉल करें और पूछें 'मेरा क्यू स्टेटस क्या है?', 2) CliniqAI पेशेंट पोर्टल चेक करें, 3) वेटिंग एरिया में TV डिस्प्ले देखें। हर मरीज का औसत समय 15 मिनट है। जब आपकी बारी आएगी तो हम WhatsApp पर सूचना भेजेंगे।",
                tags=["queue", "token", "hindi"],
                language="hi",
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="appointment", priority=7,
                title="Can I cancel or reschedule my appointment?",
                content="Yes, you can cancel or reschedule your appointment by: 1) Calling this number and saying 'Cancel my appointment' or 'Reschedule my appointment', 2) Using the patient portal, 3) WhatsApp 'Cancel' to +918012345678. Please cancel at least 2 hours before your appointment time. No cancellation fee is charged.",
                tags=["cancel", "reschedule", "appointment"],
            ),

            # ── Payment & Billing ─────────────────────────────────────
            KnowledgeBase(
                clinic_id=clinic.id, category="payment", priority=8,
                title="Payment methods accepted",
                content="We accept the following payment methods: 1) Cash, 2) UPI (Google Pay, PhonePe, Paytm, BHIM — scan QR at reception), 3) Debit/Credit Card (Visa, MasterCard, RuPay), 4) Net Banking, 5) Online payment via Razorpay link (sent to your WhatsApp/SMS). Payment is due at the time of consultation. For procedures above ₹5,000, EMI options are available.",
                tags=["payment", "upi", "card", "cash", "razorpay", "emi"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="payment", priority=7,
                title="Fee structure overview",
                content="Consultation fees: Dr. Rajesh Sharma (Dentist, Senior) - ₹500, Dr. Priya Mehta (Dentist) - ₹300, Dr. Amit Kumar (General Physician) - ₹400. Follow-up within 7 days is free. Procedure costs are additional. Detailed cost will be explained before any procedure. We provide printed/digital receipts for all payments.",
                tags=["fees", "cost", "consultation", "price", "charges"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="payment", priority=7,
                title="Insurance accepted",
                content="We accept major health insurance providers for cashless and reimbursement claims: Star Health, ICICI Lombard, Max Bupa, HDFC Ergo, Bajaj Allianz, United India, New India Assurance, and Religare Health. Please bring your insurance card, a valid photo ID, and a pre-authorization letter if required. Our staff will help with the claim process.",
                tags=["insurance", "cashless", "claim", "reimbursement"],
            ),

            # ── FAQ ───────────────────────────────────────────────────
            KnowledgeBase(
                clinic_id=clinic.id, category="faq", priority=6,
                title="Is this an emergency? When to go to hospital instead",
                content="Our clinic handles non-emergency cases. For the following emergencies, please go directly to the nearest hospital ER: severe chest pain, difficulty breathing, unconsciousness, heavy uncontrolled bleeding, high fever above 104°F in children, severe allergic reaction, accident/trauma with fractures. Nearest hospital: Manipal Hospital Indiranagar (1.5 km). Ambulance: call 108.",
                tags=["emergency", "hospital", "ambulance", "108"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="faq", priority=6,
                title="Do I need to bring any documents?",
                content="For your first visit, please bring: 1) A valid photo ID (Aadhaar, PAN, Passport), 2) Previous medical records/prescriptions if any, 3) Insurance card (if using insurance), 4) List of current medications you are taking. For follow-up visits, just bring your previous prescription from our clinic.",
                tags=["documents", "first visit", "id", "records"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="faq", priority=6,
                title="Can I get my prescription online?",
                content="Yes! After your consultation, your doctor will create a digital prescription. It will be sent to your WhatsApp number and is also available in your patient portal at app.cliniqai.com. You can show this digital prescription at any pharmacy to buy medicines.",
                tags=["prescription", "digital", "online", "whatsapp"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="faq", priority=5,
                title="After-hours / Emergency contact",
                content="Our clinic is closed on Sundays and after 6 PM on weekdays. For after-hours dental emergency, you can WhatsApp Dr. Rajesh at +919876543210. For medical emergencies, call 108 (ambulance) or visit Manipal Hospital Indiranagar. For non-urgent queries, leave a message and we will call you back the next working day.",
                tags=["after hours", "emergency", "closed", "sunday", "night"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="faq", priority=5,
                title="COVID-19 Safety Measures",
                content="We follow all COVID-19 safety protocols: 1) Temperature screening at entry, 2) Hand sanitizer stations at reception and all rooms, 3) Masks provided if needed, 4) Instruments are autoclave-sterilized, 5) Waiting area seating is socially distanced, 6) Rooms are UV-sanitized between patients. If you have COVID symptoms (fever + cough + breathing difficulty), please inform us before visiting.",
                tags=["covid", "safety", "mask", "sanitizer", "protocol"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="faq", priority=5,
                title="Patient feedback and complaints",
                content="We value your feedback! After your visit, you will receive a feedback form via WhatsApp. You can also: 1) Share feedback in the patient portal, 2) Email info@cityclinic.in, 3) Speak to our receptionist. If you have any complaints, please contact our clinic owner Dr. Rajesh Sharma directly at +919876543210.",
                tags=["feedback", "complaint", "review", "rating"],
            ),

            # ── AI Voice Call Flow Guide ──────────────────────────────
            KnowledgeBase(
                clinic_id=clinic.id, category="ai_guide", priority=10,
                title="AI Call Flow — What the AI receptionist can do",
                content="When a patient calls, the AI receptionist can: 1) Greet in Hindi or English (ask patient's language preference), 2) Ask what problem/bimari they have, 3) Suggest the right doctor based on symptoms, 4) Tell doctor availability, fees, and queue length, 5) Book appointment and give token number with estimated time, 6) Check existing queue status — tell position and wait time, 7) Cancel or reschedule appointment, 8) Answer clinic info questions (timings, location, parking, services, fees), 9) Register new patient (name, phone, age/DOB, gender), 10) Transfer to human receptionist if needed.",
                tags=["ai", "call flow", "voice", "receptionist", "guide"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="ai_guide", priority=9,
                title="AI Response — When patient asks about wait time",
                content="When a patient asks 'kitna time lagega' or 'how long is the wait': Check the queue for that doctor. If queue has 0 patients: 'Abhi koi queue nahi hai, aap turant doctor se mil sakte hain.' If 1-3 patients: 'Aapke aage [X] patient hain, lagbhag [X*15] minute ka wait hoga.' If 4+ patients: 'Abhi [X] patient queue mein hain, lagbhag [X*15] minute lagenge. Kya aap baad mein aana chahenge ya abhi appointment book karein?' Always give estimated time: each patient takes approximately 15 minutes.",
                tags=["wait time", "queue", "kitna time", "ai response"],
            ),
            KnowledgeBase(
                clinic_id=clinic.id, category="ai_guide", priority=9,
                title="AI Response — When patient describes symptoms",
                content="When a patient describes their problem: 1) Listen to symptoms, 2) Map to specialization using symptom_specialization_map, 3) Find available doctors with that specialization, 4) Respond: 'Aapki taklif ke liye [Doctor Name] ([Specialization]) best rahenge. Unki consultation fee ₹[fee] hai. Abhi unke paas [X] patient queue mein hain. Kya aap appointment book karna chahenge?' If no matching doctor: 'Is taklif ke liye humare clinic mein specialist available nahi hai. Main aapko [nearest hospital/specialist] refer kar sakta hoon.' Always confirm before booking.",
                tags=["symptoms", "routing", "ai response", "bimari"],
            ),
        ]
        db.add_all(kb_entries)
        await db.flush()
        print(f"Created {len(kb_entries)} knowledge base entries")

        # Generate embeddings for knowledge base (if OpenAI key available)
        try:
            from app.services.embedding_service import embed_knowledge_base_entry
            embedded_count = 0
            for entry in kb_entries:
                if await embed_knowledge_base_entry(db, entry):
                    embedded_count += 1
            print(f"Embedded {embedded_count}/{len(kb_entries)} KB entries (requires OPENAI_API_KEY)")
        except Exception as e:
            print(f"KB embedding skipped: {e}")

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
        print(f"  Symptom Mappings:       {len(all_symptom_data)} ({len(symptom_data)} EN + {len(hindi_symptom_data)} HI)")
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
