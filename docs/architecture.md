# Architecture — CliniqAI

## System Overview

Multi-tenant SaaS platform for AI-powered clinic management. Each clinic is an independent tenant with fully isolated data. The platform handles the **complete patient journey** — from AI voice call booking to prescription embedding to follow-up reminders.

## Architecture Model

```
Platform (CliniqAI SaaS)
 ├─ Super Admin Portal
 │   ├ Clinic Onboarding & Management
 │   ├ Platform Analytics
 │   ├ Compliance Oversight
 │   └ System Configuration
 │
 ├─ Clinic Tenant A
 │   ├ Doctors
 │   ├ Staff
 │   ├ Patients
 │   ├ Appointments
 │   ├ Prescriptions
 │   ├ Chat Messages
 │   ├ Embeddings (prescriptions, reports, notes)
 │   ├ Transactions
 │   └ AI Voice Call Logs
 │
 ├─ Clinic Tenant B
 │   ├ Doctors
 │   ├ Staff
 │   ├ Patients
 │   └ ...
 └─ ...
```

---
 │   ├ Clinic Owner Dashboard (analytics, settings, staff)
 │   ├ Doctor Dashboard (patients, consultations, prescriptions)
 │   ├ Staff Dashboard (queue, appointments, registration)
 │   ├ Doctors, Nurses, Receptionists
 │   ├ Patients & Family Profiles
 │   ├ Appointments & Queue
 │   ├ Prescriptions & Lab Results
 │   └ Transactions & Payments
 │
 ├─ Clinic Tenant B
 │   └ (same structure, fully isolated)
 │
 ├─ Patient Portal (cross-tenant — patient sees all their clinics)
 │   ├ Appointments & Queue Tracking
 │   ├ Health Records & Prescriptions
 │   ├ Family Health Hub
 │   ├ Billing & Payments
 │   └ Feedback & Ratings
 │
 └─ AI Communication Hub (shared infrastructure)
     ├ Voice AI Receptionist
     ├ WhatsApp Chatbot
     ├ Web Chat Widget
     ├ Notification Engine (WhatsApp, SMS, Push, Email)
     └ AI Triage & Routing
```

## Core Modules

| Module                        | Purpose                                                       | Phase |
|-------------------------------|---------------------------------------------------------------|-------|
| **Auth & RBAC**               | Authentication, role-based access, SSO (future)               | 1     |
| **Multi-Tenant Engine**       | Tenant isolation, clinic provisioning, data boundaries         | 1     |
| **AI Voice Receptionist**     | Inbound call handling, appointment booking, queue info         | 1     |
| **Appointment Engine**        | CRUD, scheduling, waitlist, recurring, buffer management       | 1     |
| **Queue Manager**             | Real-time queue, wait times, no-show detection, priority rules | 1     |
| **Patient Registry**          | Registration (AI, QR, invite, manual), family profiles         | 1     |
| **Prescription Engine**       | Digital Rx generation, e-signature, WhatsApp delivery          | 1     |
| **Billing & Payments**        | Invoice generation, online payment (Razorpay/UPI), receipts    | 1     |
| **Notification Engine**       | WhatsApp, SMS, push, email — templated & triggered             | 1     |
| **Compliance Module**         | Consent capture, audit logs, data export, DPDPA/HIPAA          | 1     |
| **WhatsApp Chatbot**          | Conversational AI on WhatsApp (book, queue, pay, prescriptions)| 2     |
| **Telemedicine**              | Video consultation (Jitsi/Daily/Twilio integration)            | 2     |
| **Waitlist Manager**          | Waitlist, auto-fill on cancellation, priority ordering          | 2     |
| **Feedback & NPS**            | Post-visit surveys, NPS tracking, Google Review prompts         | 2     |
| **i18n Engine**               | Multi-language support (Hindi + regional)                       | 2     |
| **Medication Reminders**      | Push/WhatsApp reminders for medication adherence                | 2     |
| **Clinic Analytics**          | Revenue, no-shows, utilization, satisfaction, benchmarking      | 2     |
| **AI Triage Bot**             | Pre-booking symptom assessment, urgency classification          | 3     |
| **Family Health Hub**         | Multi-member profiles, shared calendar, unified billing         | 3     |
| **Digital Health Card**       | QR-based patient ID, wallet integration                         | 3     |
| **Lab Integration**           | Test ordering, result delivery, lab chain partnerships           | 3     |
| **Campaign Engine**           | Health campaigns, re-engagement, birthday wishes                 | 3     |
| **Referral Manager**          | Doctor-to-specialist referrals with tracking                     | 3     |
| **AI Clinical Notes**         | Ambient documentation from doctor-patient conversation           | 4     |
| **Clinic Marketplace**        | Patient discovery, online booking, ratings                       | 4     |

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15 (App Router) + TypeScript | SSR, portals, real-time UI |
| UI | Tailwind CSS + shadcn/ui | Component library |
| Database | Supabase (PostgreSQL + RLS) | Multi-tenant data storage |
| Vector DB | pgvector (Supabase extension) | Embeddings for AI search |
| ORM | Drizzle ORM | Type-safe DB queries with RLS |
| Auth | Clerk (MVP) / Auth.js v5 (later) | Multi-tenant auth + roles |
| AI LLM | Claude API (via Vercel AI SDK v6) | Chat, analysis, diagnosis hints |
| AI Voice | Retell.ai + Twilio | Voice receptionist + SMS |
| OCR | Claude Vision API | Prescription/report image → JSON |
| Embeddings | OpenAI text-embedding-3-small | Vector embeddings for RAG |
| File Storage | Cloudflare R2 | Prescriptions, reports, images |
| Real-time | Supabase Realtime | Queue updates, chat, notifications |
| WhatsApp | WhatsApp Business API (via Twilio) | Patient notifications + bot |
| Payments | Razorpay (India) / Stripe (global) | UPI, cards, subscriptions |
| Charts | Recharts | Doctor/clinic analytics dashboards |

---

## Complete Database Schema

### Core Entities & Relationships

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   clinics    │────<│   doctors    │────<│  schedules   │
│  (tenants)   │     │              │     │              │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       │     ┌──────────────┼──────────────┐
       │     │              │              │
       ▼     ▼              ▼              ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   patients   │────<│ appointments │>────│   queue      │
│              │     │              │     │   entries    │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       │     ┌──────────────┼──────────────┐
       │     │              │              │
       ▼     ▼              ▼              ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│prescriptions │     │   invoices   │     │consultation  │
│              │     │              │     │   notes      │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│ prescription │     │   payments   │
│    items     │     │              │
└──────────────┘     └──────────────┘
```

### Table Definitions

#### clinics (Tenant)
```sql
CREATE TABLE clinics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,    -- URL-friendly identifier
  owner_id      UUID NOT NULL,                   -- doctor who owns this clinic
  phone         VARCHAR(20),
  email         VARCHAR(255),
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  pincode       VARCHAR(10),
  timings       JSONB,                           -- {"mon": {"open": "09:00", "close": "18:00"}, ...}
  settings      JSONB DEFAULT '{}',              -- AI config, notification prefs, etc.
  logo_url      TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

#### doctors
```sql
CREATE TABLE doctors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  user_id         VARCHAR(255) NOT NULL,          -- Clerk user ID
  name            VARCHAR(255) NOT NULL,
  specialization  VARCHAR(255),                   -- "Dentist", "Dermatologist", etc.
  qualification   VARCHAR(500),                   -- "MBBS, MD Dermatology"
  experience_years INTEGER,
  bio             TEXT,                            -- doctor's description/about
  photo_url       TEXT,
  phone           VARCHAR(20),
  email           VARCHAR(255),
  consultation_fee DECIMAL(10,2),
  avg_rating      DECIMAL(3,2) DEFAULT 0,         -- calculated from reviews
  total_reviews   INTEGER DEFAULT 0,
  total_patients  INTEGER DEFAULT 0,              -- lifetime patient count
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Index for multi-clinic doctor lookup
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_clinic_id ON doctors(clinic_id);
```

#### patients
```sql
CREATE TABLE patients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id     UUID NOT NULL REFERENCES clinics(id),
  user_id       VARCHAR(255),                    -- Clerk user ID (null if registered via AI call)
  name          VARCHAR(255) NOT NULL,
  phone         VARCHAR(20) NOT NULL,
  email         VARCHAR(255),
  date_of_birth DATE,
  gender        VARCHAR(20),
  blood_group   VARCHAR(10),
  address       TEXT,
  emergency_contact VARCHAR(20),
  abha_id       VARCHAR(50),                     -- ABDM health ID
  aadhaar_hash  VARCHAR(64),                     -- hashed, never store raw
  medical_history JSONB DEFAULT '{}',            -- allergies, chronic conditions, etc.
  registration_source VARCHAR(50),               -- 'ai_call', 'qr_code', 'invite_link', 'manual', 'whatsapp'
  unique_code   VARCHAR(20) UNIQUE,              -- patient's unique verification code
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Unique patient per clinic per phone
CREATE UNIQUE INDEX idx_patients_clinic_phone ON patients(clinic_id, phone);
```

#### doctor_patient_relationships
```sql
-- Tracks which doctor has treated which patient, when, and how many times
CREATE TABLE doctor_patient_relationships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  doctor_id       UUID NOT NULL REFERENCES doctors(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  first_visit     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_visit      TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_visits    INTEGER DEFAULT 1,
  total_spent     DECIMAL(10,2) DEFAULT 0,        -- total billing by this patient to this doctor
  primary_diagnosis VARCHAR(500),                  -- most recent/primary diagnosis
  notes           TEXT,                            -- doctor's notes about this patient relationship
  status          VARCHAR(50) DEFAULT 'active',    -- active, discharged, referred
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  UNIQUE(clinic_id, doctor_id, patient_id)
);
```

#### appointments
```sql
CREATE TABLE appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  doctor_id       UUID NOT NULL REFERENCES doctors(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  appointment_code VARCHAR(20) UNIQUE NOT NULL,    -- unique code: "APT-2026-XXXX"
  date            DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME,
  duration_minutes INTEGER DEFAULT 15,
  type            VARCHAR(50) DEFAULT 'consultation', -- consultation, follow_up, procedure, emergency
  status          VARCHAR(50) DEFAULT 'scheduled',    -- scheduled, confirmed, in_progress, completed, cancelled, no_show
  booking_source  VARCHAR(50),                        -- ai_call, portal, whatsapp, walk_in, staff
  symptoms_summary TEXT,                              -- AI-generated from symptom intake
  consultation_notes TEXT,                            -- doctor's notes during visit
  diagnosis       TEXT,
  follow_up_date  DATE,
  follow_up_notes TEXT,
  cancellation_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_appointments_clinic_date ON appointments(clinic_id, date);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, date);
CREATE INDEX idx_appointments_patient ON appointments(clinic_id, patient_id);
```

#### prescriptions
```sql
CREATE TABLE prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  appointment_id  UUID REFERENCES appointments(id),
  doctor_id       UUID NOT NULL REFERENCES doctors(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  diagnosis       TEXT,
  notes           TEXT,
  source          VARCHAR(50) DEFAULT 'manual',   -- manual, voice_to_text, ocr_upload
  original_image_url TEXT,                         -- if uploaded via OCR
  ocr_raw_text    TEXT,                           -- raw OCR output before structuring
  is_verified     BOOLEAN DEFAULT false,          -- doctor verified OCR result
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### prescription_items
```sql
CREATE TABLE prescription_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id),
  medicine_name   VARCHAR(255) NOT NULL,
  generic_name    VARCHAR(255),                  -- e.g., "Paracetamol" for "Dolo 650"
  dosage          VARCHAR(100),                  -- "500mg", "10ml"
  frequency       VARCHAR(100),                  -- "twice daily", "TID", "BD"
  duration        VARCHAR(100),                  -- "7 days", "1 month"
  quantity        INTEGER,
  route           VARCHAR(50),                   -- oral, topical, injection
  instructions    TEXT,                          -- "take after meals", "apply on affected area"
  start_date      DATE,
  end_date        DATE,
  is_active       BOOLEAN DEFAULT true,          -- currently taking or completed
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prescription_items_patient
  ON prescription_items(prescription_id);
```

#### doctor_reviews
```sql
CREATE TABLE doctor_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  doctor_id       UUID NOT NULL REFERENCES doctors(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  appointment_id  UUID REFERENCES appointments(id),
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text     TEXT,
  behavior_rating INTEGER CHECK (behavior_rating BETWEEN 1 AND 5),  -- doctor's behavior
  wait_time_rating INTEGER CHECK (wait_time_rating BETWEEN 1 AND 5), -- how long they waited
  treatment_rating INTEGER CHECK (treatment_rating BETWEEN 1 AND 5), -- treatment effectiveness
  is_anonymous    BOOLEAN DEFAULT false,
  is_verified     BOOLEAN DEFAULT true,          -- verified = had actual appointment
  created_at      TIMESTAMPTZ DEFAULT now(),

  UNIQUE(appointment_id)  -- one review per appointment
);

CREATE INDEX idx_reviews_doctor ON doctor_reviews(doctor_id);
```

#### consultation_notes
```sql
CREATE TABLE consultation_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  appointment_id  UUID NOT NULL REFERENCES appointments(id),
  doctor_id       UUID NOT NULL REFERENCES doctors(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),

  -- SOAP format (standard medical notes)
  subjective      TEXT,     -- what patient says (symptoms, complaints)
  objective       TEXT,     -- doctor's observations, exam findings
  assessment      TEXT,     -- diagnosis, differential diagnosis
  plan            TEXT,     -- treatment plan, follow-up instructions

  source          VARCHAR(50) DEFAULT 'manual',  -- manual, ai_scribe, voice_to_text
  ai_raw_transcript TEXT,                        -- raw AI scribe transcript
  vitals          JSONB,                         -- {"bp": "120/80", "temp": "98.6", "pulse": "72", "weight": "70kg"}

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

#### queue_entries
```sql
CREATE TABLE queue_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  doctor_id       UUID NOT NULL REFERENCES doctors(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  appointment_id  UUID REFERENCES appointments(id),

  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  token_number    INTEGER NOT NULL,               -- daily sequential: #1, #2, #3...
  position        INTEGER NOT NULL,               -- current position in queue (changes as patients complete)
  status          VARCHAR(50) DEFAULT 'waiting',  -- waiting, in_progress, completed, skipped, cancelled
  type            VARCHAR(50) DEFAULT 'appointment', -- appointment, walk_in

  check_in_time   TIMESTAMPTZ DEFAULT now(),      -- when patient checked in
  called_at       TIMESTAMPTZ,                    -- when doctor called the patient
  completed_at    TIMESTAMPTZ,                    -- when consultation ended
  estimated_wait  INTEGER,                        -- estimated wait in minutes

  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Token numbers are unique per doctor per day
CREATE UNIQUE INDEX idx_queue_doctor_date_token
  ON queue_entries(clinic_id, doctor_id, date, token_number);

-- Fast lookup for live queue
CREATE INDEX idx_queue_live
  ON queue_entries(clinic_id, doctor_id, date, status)
  WHERE status IN ('waiting', 'in_progress');
```

#### symptom_specialization_map
```sql
-- Maps symptoms/keywords to doctor specializations
-- Used by AI voice to suggest the right doctor
CREATE TABLE symptom_specialization_map (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID REFERENCES clinics(id),    -- null = global/default mapping
  symptom_keyword VARCHAR(255) NOT NULL,           -- "tooth pain", "cough", "rash"
  specialization  VARCHAR(255) NOT NULL,           -- "Dentist", "General Physician", "Dermatologist"
  priority        INTEGER DEFAULT 1,               -- higher = stronger match
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Default symptom mappings (seeded at platform level)
-- clinic_id = NULL means global defaults; clinics can override
INSERT INTO symptom_specialization_map (clinic_id, symptom_keyword, specialization, priority) VALUES
  -- Dental
  (NULL, 'tooth pain',         'Dentist', 10),
  (NULL, 'toothache',          'Dentist', 10),
  (NULL, 'gum pain',           'Dentist', 9),
  (NULL, 'jaw pain',           'Dentist', 8),
  (NULL, 'cavity',             'Dentist', 10),
  (NULL, 'tooth sensitivity',  'Dentist', 9),
  (NULL, 'bleeding gums',      'Dentist', 9),
  (NULL, 'jaw swelling',       'Oral Surgeon', 8),

  -- General / Internal Medicine
  (NULL, 'fever',              'General Physician', 8),
  (NULL, 'cold',               'General Physician', 7),
  (NULL, 'cough',              'General Physician', 8),
  (NULL, 'headache',           'General Physician', 7),
  (NULL, 'body pain',          'General Physician', 7),
  (NULL, 'weakness',           'General Physician', 6),
  (NULL, 'vomiting',           'General Physician', 7),
  (NULL, 'diarrhea',           'General Physician', 7),

  -- Dermatology
  (NULL, 'skin rash',          'Dermatologist', 10),
  (NULL, 'acne',               'Dermatologist', 10),
  (NULL, 'itching',            'Dermatologist', 8),
  (NULL, 'hair loss',          'Dermatologist', 9),
  (NULL, 'skin infection',     'Dermatologist', 9),
  (NULL, 'eczema',             'Dermatologist', 10),
  (NULL, 'pigmentation',       'Dermatologist', 8),

  -- Orthopedics
  (NULL, 'knee pain',          'Orthopedic', 10),
  (NULL, 'back pain',          'Orthopedic', 9),
  (NULL, 'joint pain',         'Orthopedic', 9),
  (NULL, 'fracture',           'Orthopedic', 10),
  (NULL, 'shoulder pain',      'Orthopedic', 8),
  (NULL, 'spine pain',         'Orthopedic', 9),

  -- Ophthalmology
  (NULL, 'eye pain',           'Ophthalmologist', 10),
  (NULL, 'blurry vision',      'Ophthalmologist', 10),
  (NULL, 'eye redness',        'Ophthalmologist', 9),
  (NULL, 'watery eyes',        'Ophthalmologist', 8),

  -- Pediatrics
  (NULL, 'child fever',        'Pediatrician', 10),
  (NULL, 'child cough',        'Pediatrician', 9),
  (NULL, 'baby rash',          'Pediatrician', 9),
  (NULL, 'child vaccination',  'Pediatrician', 10),

  -- Cardiology
  (NULL, 'chest pain',         'Cardiologist', 10),
  (NULL, 'heart palpitations', 'Cardiologist', 10),
  (NULL, 'high blood pressure','Cardiologist', 9),
  (NULL, 'breathlessness',     'Cardiologist', 8),

  -- ENT
  (NULL, 'ear pain',           'ENT Specialist', 10),
  (NULL, 'sore throat',        'ENT Specialist', 8),
  (NULL, 'hearing loss',       'ENT Specialist', 10),
  (NULL, 'nose bleeding',      'ENT Specialist', 9),
  (NULL, 'sinus',              'ENT Specialist', 9),

  -- Gynecology
  (NULL, 'pregnancy',          'Gynecologist', 10),
  (NULL, 'irregular periods',  'Gynecologist', 10),
  (NULL, 'pelvic pain',        'Gynecologist', 9),

  -- Gastroenterology
  (NULL, 'stomach pain',       'Gastroenterologist', 9),
  (NULL, 'acidity',            'Gastroenterologist', 8),
  (NULL, 'bloating',           'Gastroenterologist', 7),
  (NULL, 'constipation',       'Gastroenterologist', 7);
```

#### lab_reports
```sql
CREATE TABLE lab_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  appointment_id  UUID REFERENCES appointments(id),
  doctor_id       UUID REFERENCES doctors(id),

  report_type     VARCHAR(100) NOT NULL,          -- "blood_test", "urine_test", "xray", "mri", "ecg"
  report_name     VARCHAR(255),                   -- "Complete Blood Count", "Lipid Profile"
  lab_name        VARCHAR(255),
  report_date     DATE NOT NULL,

  -- Original file
  file_url        TEXT NOT NULL,                  -- stored in Cloudflare R2
  file_type       VARCHAR(50),                    -- "pdf", "image/jpeg", "image/png"

  -- AI-extracted structured data
  extracted_data  JSONB,                          -- structured values from OCR
  -- Example extracted_data:
  -- {
  --   "hemoglobin": {"value": 14.2, "unit": "g/dL", "normal_range": "13.5-17.5", "status": "normal"},
  --   "blood_sugar_fasting": {"value": 126, "unit": "mg/dL", "normal_range": "70-100", "status": "high"},
  --   "cholesterol_total": {"value": 220, "unit": "mg/dL", "normal_range": "<200", "status": "high"}
  -- }

  ai_summary      TEXT,                           -- AI-generated plain English summary
  abnormal_flags  JSONB DEFAULT '[]',             -- ["blood_sugar_fasting", "cholesterol_total"]

  ocr_raw_text    TEXT,                           -- raw OCR output
  is_verified     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lab_reports_patient ON lab_reports(clinic_id, patient_id);
CREATE INDEX idx_lab_reports_type ON lab_reports(patient_id, report_type, report_date);
```

---

## Embeddings Architecture

### What Gets Embedded and Why

Everything a patient or doctor might want to **search via natural language** gets embedded.

```
┌─────────────────────────────────────────────────────────┐
│                  EMBEDDING PIPELINE                      │
│                                                         │
│  Source Data              Embedding Text                 │
│  ───────────              ──────────────                 │
│  Prescription    →  "Amoxicillin 500mg twice daily      │
│                      for 7 days, prescribed by           │
│                      Dr. Sharma for throat infection      │
│                      on 2026-01-15"                      │
│                                                         │
│  Consultation    →  "Patient complained of persistent    │
│  Notes               cough for 5 days with mild fever.   │
│                      Diagnosed with URTI. Prescribed     │
│                      antibiotics and cough syrup."       │
│                                                         │
│  Lab Report      →  "Blood test on 2026-02-10: HbA1c    │
│                      7.2% (high), fasting sugar 142      │
│                      mg/dL (high), cholesterol 220       │
│                      mg/dL (borderline high)"            │
│                                                         │
│  Doctor Review   →  "5 stars. Dr. Patel is very patient, │
│                      explains everything clearly.        │
│                      Wait time was only 10 minutes."     │
│                                                         │
│  Visit Summary   →  "Visit on 2026-03-01 to Dr. Kumar   │
│                      at City Clinic for knee pain.       │
│                      X-ray done. Diagnosed with mild     │
│                      arthritis. Advised physiotherapy."  │
│                                                         │
└─────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│           OpenAI text-embedding-3-small                  │
│           Output: 1536-dimension vector                  │
└─────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│              pgvector (Supabase)                         │
│         Stored with metadata for filtering               │
└─────────────────────────────────────────────────────────┘
```

### Embeddings Table

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  doctor_id       UUID REFERENCES doctors(id),

  -- What this embedding represents
  source_type     VARCHAR(50) NOT NULL,           -- 'prescription', 'consultation_note', 'lab_report', 'review', 'visit_summary'
  source_id       UUID NOT NULL,                  -- FK to the source table

  -- The text that was embedded
  content_text    TEXT NOT NULL,                   -- human-readable text chunk

  -- The vector embedding
  embedding       vector(1536) NOT NULL,           -- OpenAI text-embedding-3-small

  -- Metadata for filtering before vector search
  metadata        JSONB DEFAULT '{}',
  -- Example metadata:
  -- {
  --   "date": "2026-01-15",
  --   "doctor_name": "Dr. Sharma",
  --   "category": "prescription",
  --   "medicines": ["Amoxicillin", "Paracetamol"],
  --   "diagnosis": "throat infection"
  -- }

  created_at      TIMESTAMPTZ DEFAULT now()
);

-- HNSW index for fast similarity search
CREATE INDEX idx_embeddings_vector
  ON embeddings USING hnsw (embedding vector_cosine_ops);

-- Filter indexes (always search within a patient's own data)
CREATE INDEX idx_embeddings_patient
  ON embeddings(clinic_id, patient_id);
CREATE INDEX idx_embeddings_source
  ON embeddings(source_type, source_id);
```

### Chunking Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    CHUNKING RULES                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Prescription:                                              │
│    → ONE embedding per prescription (not per medicine)       │
│    → Concatenate all items into one text                     │
│    → Include doctor name, date, diagnosis                    │
│    → Why: Prescriptions are small, context matters together  │
│                                                             │
│  Consultation Notes:                                        │
│    → ONE embedding per consultation                          │
│    → Combine SOAP fields into single text                    │
│    → Include vitals, diagnosis, plan                         │
│    → Why: A consultation is one logical unit                 │
│                                                             │
│  Lab Report:                                                │
│    → ONE embedding per report                                │
│    → Include all extracted values + AI summary               │
│    → Why: Reports are typically 1 page                       │
│                                                             │
│  Doctor Review:                                             │
│    → ONE embedding per review                                │
│    → Include all ratings + text                              │
│    → Why: Reviews are short                                  │
│                                                             │
│  Long Documents (> 2000 tokens):                            │
│    → Split into ~500 token chunks with 50 token overlap      │
│    → Each chunk gets its own embedding row                   │
│    → chunk_index in metadata: {"chunk": 1, "total_chunks": 3}│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### How Embedding Text is Constructed

```typescript
// Example: Prescription → Embedding Text
function buildPrescriptionEmbeddingText(prescription, items, doctor): string {
  const medicines = items.map(item =>
    `${item.medicine_name} ${item.dosage} ${item.frequency} for ${item.duration}`
  ).join(', ');

  return `Prescription by Dr. ${doctor.name} (${doctor.specialization}) ` +
    `on ${prescription.created_at}. ` +
    `Diagnosis: ${prescription.diagnosis}. ` +
    `Medicines: ${medicines}. ` +
    `Notes: ${prescription.notes || 'none'}.`;
}

// Example: Lab Report → Embedding Text
function buildLabReportEmbeddingText(report): string {
  const values = Object.entries(report.extracted_data)
    .map(([key, val]) => `${key}: ${val.value} ${val.unit} (${val.status})`)
    .join(', ');

  return `${report.report_name} from ${report.lab_name} ` +
    `on ${report.report_date}. ` +
    `Results: ${values}. ` +
    `Summary: ${report.ai_summary}. ` +
    `Abnormal: ${report.abnormal_flags.join(', ') || 'none'}.`;
}

// Example: Consultation → Embedding Text
function buildConsultationEmbeddingText(note, appointment, doctor): string {
  return `Consultation with Dr. ${doctor.name} on ${appointment.date}. ` +
    `Symptoms: ${note.subjective}. ` +
    `Examination: ${note.objective}. ` +
    `Diagnosis: ${note.assessment}. ` +
    `Treatment plan: ${note.plan}. ` +
    `Vitals: ${JSON.stringify(note.vitals)}.`;
}
```

---

## Prescription OCR Pipeline

### Flow: Image → JSON → Database → Embedding

```
Patient/Staff uploads prescription photo
              │
              ▼
┌─────────────────────────────────────┐
│  1. UPLOAD TO CLOUDFLARE R2         │
│     Store original image            │
│     Generate signed URL             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. CLAUDE VISION API (OCR)         │
│                                     │
│  Prompt:                            │
│  "Extract all medicines from this   │
│   prescription image. Return JSON:  │
│   {                                 │
│     doctor_name: string,            │
│     date: string,                   │
│     diagnosis: string,              │
│     medicines: [{                   │
│       name: string,                 │
│       generic_name: string,         │
│       dosage: string,               │
│       frequency: string,            │
│       duration: string,             │
│       instructions: string          │
│     }]                              │
│   }"                                │
│                                     │
│  Input: prescription image          │
│  Output: structured JSON            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. STORE IN DATABASE               │
│                                     │
│  → prescriptions table (header)     │
│  → prescription_items table (each   │
│     medicine as separate row)       │
│  → source = 'ocr_upload'           │
│  → original_image_url = R2 URL     │
│  → ocr_raw_text = Claude output    │
│  → is_verified = false             │
│     (doctor must verify)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. GENERATE EMBEDDING              │
│                                     │
│  Build text: "Amoxicillin 500mg     │
│  twice daily for 7 days, prescribed │
│  by Dr. Sharma for throat infection │
│  on 2026-01-15"                     │
│                                     │
│  → OpenAI text-embedding-3-small    │
│  → Store in embeddings table        │
│  → metadata: {medicines, diagnosis, │
│     date, doctor}                   │
└─────────────────────────────────────┘
```

### Lab Report OCR → Trend Analysis

```
Patient uploads lab report (PDF/image)
              │
              ▼
┌─────────────────────────────────────┐
│  CLAUDE VISION: Extract values      │
│                                     │
│  Input: Lab report image            │
│  Output JSON:                       │
│  {                                  │
│    "hemoglobin": {                  │
│      "value": 14.2,                 │
│      "unit": "g/dL",               │
│      "normal_range": "13.5-17.5",  │
│      "status": "normal"            │
│    },                               │
│    "blood_sugar_fasting": {         │
│      "value": 142,                  │
│      "unit": "mg/dL",              │
│      "normal_range": "70-100",     │
│      "status": "high"              │
│    }                                │
│  }                                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  STORE IN lab_reports TABLE         │
│  extracted_data = structured JSON   │
│  abnormal_flags = ["blood_sugar"]   │
│  ai_summary = "Blood sugar is high" │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  TREND QUERY (when patient asks):   │
│                                     │
│  SELECT extracted_data->'blood_     │
│    sugar_fasting'->'value',         │
│    report_date                      │
│  FROM lab_reports                   │
│  WHERE patient_id = $1              │
│    AND clinic_id = $2               │
│    AND report_type = 'blood_test'   │
│  ORDER BY report_date ASC;          │
│                                     │
│  Returns: [(126, Jan), (142, Feb),  │
│            (118, Mar)]              │
│  → Recharts line graph showing      │
│    blood sugar trend over months    │
└─────────────────────────────────────┘
```

---

## AI Smart Doctor Suggestion Engine

### How Symptom → Doctor Matching Works

```
Patient says: "I have tooth pain and jaw swelling since 3 days"
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│ LAYER 1: AI SYMPTOM EXTRACTION (Claude API)                  │
│                                                              │
│ Input: Raw patient speech (any language)                      │
│ Output: Structured symptoms                                  │
│                                                              │
│ {                                                            │
│   "symptoms": ["tooth pain", "jaw swelling"],                │
│   "duration": "3 days",                                      │
│   "severity": "moderate",                                    │
│   "location": "lower jaw",                                   │
│   "language_detected": "en"                                  │
│ }                                                            │
│                                                              │
│ Works in Hindi too:                                          │
│ "मेरे दांत में दर्द है और जबड़ा सूज गया है"                  │
│ → Same JSON output                                           │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ LAYER 2: SYMPTOM → SPECIALIZATION MAPPING                    │
│                                                              │
│ Two approaches (used together):                              │
│                                                              │
│ A. Database lookup (fast, deterministic):                     │
│    SELECT specialization, SUM(priority) AS match_score        │
│    FROM symptom_specialization_map                            │
│    WHERE symptom_keyword IN ('tooth pain', 'jaw swelling')    │
│      AND (clinic_id = $clinic_id OR clinic_id IS NULL)        │
│    GROUP BY specialization                                    │
│    ORDER BY match_score DESC;                                 │
│                                                              │
│    Result: Dentist (18), Oral Surgeon (8)                    │
│                                                              │
│ B. AI fallback (for unknown/complex symptoms):               │
│    If no DB match found, ask Claude:                         │
│    "Patient has: [symptoms]. Which medical specialization    │
│     should they see? Choose from: [list of specializations   │
│     available at this clinic]"                                │
│                                                              │
│ Clinics can ADD CUSTOM mappings:                             │
│   e.g., "teeth whitening" → "Cosmetic Dentist" (clinic-level)│
│                                                              │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ LAYER 3: RANK MATCHING DOCTORS                               │
│                                                              │
│ Query all doctors of matched specialization in THIS clinic:   │
│                                                              │
│ For each doctor, calculate RANK SCORE:                        │
│                                                              │
│   rank_score =                                               │
│     (avg_rating × 20)           -- quality matters most      │
│     + (experience_years × 2)    -- experience bonus          │
│     - (current_queue_length × 5) -- shorter queue = better   │
│     + (available_today ? 10 : 0) -- available today bonus    │
│                                                              │
│ Sort by rank_score DESC                                      │
│                                                              │
│ Example result:                                              │
│ ┌─────────────┬───────┬─────┬────────┬───────┬──────┬──────┐│
│ │ Doctor      │Rating │Exp  │Fee     │Queue  │Token │Wait  ││
│ ├─────────────┼───────┼─────┼────────┼───────┼──────┼──────┤│
│ │ Dr. Sharma  │ 4.8   │12yr │Rs 500  │3 pts  │ #4   │25min ││
│ │ Dr. Priya   │ 4.5   │ 6yr │Rs 300  │1 pt   │ #2   │10min ││
│ │ Dr. Ravi    │ 4.2   │ 3yr │Rs 200  │0 pts  │ #1   │ 0min ││
│ └─────────────┴───────┴─────┴────────┴───────┴──────┴──────┘│
│                                                              │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ LAYER 4: PRESENT TO PATIENT (Voice or Chat)                  │
│                                                              │
│ AI speaks/shows:                                             │
│                                                              │
│ "Based on your tooth pain and jaw swelling, you should see   │
│  a Dentist. Here are the available doctors:                   │
│                                                              │
│  1. Dr. Sharma — Senior Dentist                              │
│     Rating: 4.8 stars | 12 years experience                  │
│     Fee: Rs 500                                              │
│     Queue: 3 patients | Your token will be #4                │
│     Wait time: About 25 minutes                              │
│     Next available: 11:30 AM                                 │
│                                                              │
│  2. Dr. Priya — Dentist                                      │
│     Rating: 4.5 stars | 6 years experience                   │
│     Fee: Rs 300                                              │
│     Queue: 1 patient | Your token will be #2                 │
│     Wait time: About 10 minutes                              │
│     Next available: 10:45 AM                                 │
│                                                              │
│  3. Dr. Ravi — Dentist                                       │
│     Rating: 4.2 stars | 3 years experience                   │
│     Fee: Rs 200                                              │
│     Queue: Empty | You'll be first!                          │
│     Available right now                                      │
│                                                              │
│  Which doctor would you like?"                               │
└──────────────────────────────────────────────────────────────┘
```

### Token Number System

```
┌──────────────────────────────────────────────────────────────┐
│ TOKEN NUMBER GENERATION                                      │
│                                                              │
│ Tokens are sequential PER DOCTOR PER DAY:                    │
│                                                              │
│ Dr. Sharma (March 15):                                       │
│   Token #1 → Ramesh (9:00 AM) ✅ Completed                  │
│   Token #2 → Sunita (9:30 AM) ✅ Completed                  │
│   Token #3 → Amit   (10:00 AM) 🔄 In Progress               │
│   Token #4 → Rajesh (10:30 AM) ⏳ Waiting  ← current queue  │
│   Token #5 → Priya  (11:00 AM) ⏳ Waiting                   │
│   Token #6 → [OPEN] ← next available for booking            │
│                                                              │
│ Dr. Priya (March 15):                                        │
│   Token #1 → Meena  (10:00 AM) 🔄 In Progress               │
│   Token #2 → [OPEN] ← next available for booking            │
│                                                              │
│ Token assignment query:                                      │
│   SELECT COALESCE(MAX(token_number), 0) + 1 AS next_token   │
│   FROM queue_entries                                         │
│   WHERE clinic_id = $1 AND doctor_id = $2                    │
│     AND date = CURRENT_DATE;                                 │
│                                                              │
│ Estimated wait calculation:                                  │
│   waiting_patients = COUNT(*) WHERE status = 'waiting'       │
│   avg_consultation = AVG(completed_at - called_at)           │
│                      FROM last 20 completed entries          │
│   estimated_wait = waiting_patients × avg_consultation       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Live Queue Updates (Real-time via Supabase + WhatsApp)

```
When a patient's position changes:
              │
              ├─→ Supabase Realtime broadcasts to patient portal
              │   → Patient sees live queue position on screen
              │
              ├─→ WhatsApp notification triggered at key moments:
              │   → "You are #3 in queue. Est wait: 20 min"
              │   → "You are NEXT! Please proceed to Room 2"
              │   → "Dr. Sharma is ready for you now"
              │
              └─→ Clinic TV display updates
                  → Shows: Token #3 - In Progress | #4, #5 - Waiting
```

---

## AI Chat System Architecture

### 4 Types of Chat

```
┌──────────────────────────────────────────────────────────────┐
│                     CHAT SYSTEM                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. PATIENT AI CHAT (RAG-powered)                            │
│     Patient ↔ AI Bot                                         │
│     "What medicine did I take 3 months ago?"                 │
│     "When is my next appointment?"                           │
│     "What did the doctor say about my knee?"                 │
│     → AI searches embeddings → answers from patient's data   │
│                                                              │
│  2. DOCTOR AI CHAT (Context-aware assistant)                 │
│     Doctor ↔ AI Bot                                          │
│     "How many patients came to my clinic last 3 days?"       │
│     "What is patient Rajesh's history?"                      │
│     "Drug interactions for Metformin + Amlodipine?"          │
│     → AI queries database + embeddings → answers             │
│                                                              │
│  3. DOCTOR-PATIENT CHAT (Direct messaging)                   │
│     Doctor ↔ Patient                                         │
│     Post-visit instructions, questions, follow-ups           │
│     Attachments: reports, images                             │
│     → Stored in chat_messages table                          │
│                                                              │
│  4. STAFF INTERNAL CHAT                                      │
│     Staff ↔ Doctor / Staff ↔ Staff                           │
│     "Patient X is waiting", "Emergency walk-in"              │
│     → Stored in chat_messages table                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Chat Database Tables

```sql
-- All human-to-human messages
CREATE TABLE chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  conversation_id UUID NOT NULL,                  -- groups messages in a thread
  sender_id       UUID NOT NULL,                  -- doctor, patient, or staff UUID
  sender_type     VARCHAR(20) NOT NULL,           -- 'doctor', 'patient', 'staff'
  receiver_id     UUID,                           -- null for group/broadcast
  receiver_type   VARCHAR(20),
  message_type    VARCHAR(50) DEFAULT 'text',     -- text, image, file, voice_note
  content         TEXT,
  file_url        TEXT,                           -- attachment URL in R2
  file_name       VARCHAR(255),
  is_read         BOOLEAN DEFAULT false,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX idx_chat_receiver ON chat_messages(receiver_id, is_read);

-- AI chat sessions (patient ↔ AI, doctor ↔ AI)
CREATE TABLE ai_chat_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  user_id         UUID NOT NULL,                  -- patient or doctor
  user_type       VARCHAR(20) NOT NULL,           -- 'patient' or 'doctor'
  title           VARCHAR(255),                   -- auto-generated from first message
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
**Considerations from business analysis:**
- **Voice AI:** Sarvam AI (Indian languages), Twilio (telephony), or similar
- **WhatsApp:** WhatsApp Business API via official BSP or Meta Cloud API
- **Video:** Jitsi Meet (open source), Daily.co, or Twilio Video
- **Payments:** Razorpay (India-first, supports UPI, cards, wallets, net banking)
- **i18n:** next-intl or similar for frontend; AI providers with multilingual support
- **Real-time:** WebSocket or SSE for queue updates, notifications

CREATE TABLE ai_chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES ai_chat_sessions(id),
  role            VARCHAR(20) NOT NULL,           -- 'user' or 'assistant'
  content         TEXT NOT NULL,

  -- Track which sources the AI used to answer
  sources         JSONB DEFAULT '[]',
  -- Example: [
  --   {"type": "prescription", "id": "uuid", "date": "2026-01-15", "relevance": 0.92},
  --   {"type": "lab_report", "id": "uuid", "date": "2026-02-10", "relevance": 0.87}
  -- ]

  tokens_used     INTEGER,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Patient AI Chat: How RAG Works

```
Patient asks: "What blood pressure medicine did my doctor give me last year?"
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: EMBED THE QUESTION                                   │
│                                                              │
│ Input: "What blood pressure medicine did my doctor give me   │
│         last year?"                                          │
│ → OpenAI text-embedding-3-small                              │
│ → 1536-dimension query vector                                │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: VECTOR SEARCH (scoped to this patient only)          │
│                                                              │
│ SELECT content_text, source_type, source_id, metadata,       │
│        1 - (embedding <=> query_vector) AS similarity        │
│ FROM embeddings                                              │
│ WHERE clinic_id = $1                                         │
│   AND patient_id = $2                                        │
│   AND source_type IN ('prescription', 'consultation_note')   │
│ ORDER BY embedding <=> query_vector                          │
│ LIMIT 5;                                                     │
│                                                              │
│ Returns top 5 most relevant chunks from patient's history    │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: BUILD PROMPT WITH CONTEXT                            │
│                                                              │
│ System: "You are CliniqAI assistant for {clinic_name}.       │
│          Answer the patient's question using ONLY the        │
│          provided medical records. Never make up information.│
│          Always add: 'This is not medical advice.'           │
│          If you don't know, say so."                         │
│                                                              │
│ Context: [top 5 retrieved chunks with dates and sources]     │
│                                                              │
│ User: "What blood pressure medicine did my doctor give me    │
│        last year?"                                           │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: CLAUDE GENERATES ANSWER (streaming)                  │
│                                                              │
│ "Based on your records, Dr. Patel prescribed Amlodipine 5mg │
│  once daily for high blood pressure on 15 January 2025.     │
│  This was during your visit for a routine checkup at City    │
│  Clinic.                                                     │
│                                                              │
│  Note: This is not medical advice. Please consult your       │
│  doctor for any changes to medication."                      │
└──────────────────────────────────────────────────────────────┘
```

### Doctor AI Chat: How It Works

```
Doctor asks: "How many patients came to my clinic in the last 3 days?"
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: INTENT DETECTION                                     │
│                                                              │
│ AI SDK v6 Agent with TOOLS:                                  │
│                                                              │
│ Tool: query_appointments                                     │
│   → SELECT COUNT(*), date, status                            │
│     FROM appointments                                        │
│     WHERE doctor_id = $1 AND clinic_id = $2                  │
│       AND date >= CURRENT_DATE - INTERVAL '3 days'           │
│     GROUP BY date, status                                    │
│                                                              │
│ Tool: query_patient_details                                  │
│   → Fetch specific patient history                           │
│                                                              │
│ Tool: search_medical_knowledge                               │
│   → Drug interactions, clinical guidelines                   │
│                                                              │
│ Tool: query_revenue                                          │
│   → Revenue, billing, payment stats                          │
│                                                              │
│ Tool: search_patient_records                                 │
│   → Vector search across patient embeddings                  │
│                                                              │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: AI CALLS TOOL → GETS DATA → GENERATES RESPONSE      │
│                                                              │
│ "In the last 3 days at City Clinic:                          │
│                                                              │
│  • March 12: 18 patients (15 completed, 2 no-show, 1 cancel)│
│  • March 13: 22 patients (20 completed, 2 cancelled)        │
│  • March 14: 12 patients so far (8 completed, 4 in queue)   │
│                                                              │
│  Total: 52 patients. Revenue: Rs 78,000.                     │
│  No-show rate: 3.8% (below your average of 5.2%)            │
│  Most common diagnosis: Viral fever (12 cases)"              │
└──────────────────────────────────────────────────────────────┘
```

### Doctor Asking About a Specific Patient

```
Doctor asks: "Show me patient Rajesh Kumar's complete history"
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│ AI Agent calls multiple tools:                               │
│                                                              │
│ 1. query_patient → basic info, medical_history JSONB         │
│ 2. query_appointments → all visits with this doctor          │
│ 3. query_prescriptions → all medicines ever prescribed       │
│ 4. query_lab_reports → all reports + extracted values         │
│ 5. query_consultation_notes → SOAP notes from each visit    │
│ 6. query_relationship → total visits, total spent, status    │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ AI Response:                                                 │
│                                                              │
│ "Patient: Rajesh Kumar (M, 45, Diabetic)                     │
│  Unique Code: PAT-2026-4821                                  │
│  Total Visits: 8 (First: Jan 2025, Last: Mar 2026)           │
│  Total Billed: Rs 12,400                                     │
│                                                              │
│  Current Medications:                                        │
│  • Metformin 500mg BD (since Jan 2025)                       │
│  • Amlodipine 5mg OD (since Mar 2025)                        │
│                                                              │
│  Recent Lab (Feb 2026):                                      │
│  • HbA1c: 7.2% (↑ from 6.8% in Aug 2025)                   │
│  • Fasting Sugar: 142 mg/dL (high)                           │
│  • BP: 130/85 (borderline)                                   │
│                                                              │
│  Trend: Blood sugar control worsening. Consider adjusting    │
│  Metformin dosage or adding Glimepiride.                     │
│                                                              │
│  ⚠ This is an AI suggestion, not a final diagnosis."        │
└──────────────────────────────────────────────────────────────┘
```

---

## Patient Checking Doctor Reviews & Status

### How It Works

```
Patient searches: "Dr. Sharma reviews" or "Best dentist near me"
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│ DOCTOR PROFILE PAGE shows:                                   │
│                                                              │
│ ┌──────────────────────────────────────────┐                 │
│ │ Dr. Sharma                               │                 │
│ │ Dentist | 12 yrs experience              │                 │
│ │ ⭐ 4.7/5 (143 reviews)                   │                 │
│ │                                          │                 │
│ │ Ratings Breakdown:                       │                 │
│ │   Behavior:  ⭐⭐⭐⭐⭐ 4.8              │                 │
│ │   Treatment: ⭐⭐⭐⭐  4.6               │                 │
│ │   Wait Time: ⭐⭐⭐⭐  4.3               │                 │
│ │                                          │                 │
│ │ Recent Reviews:                          │                 │
│ │ "Very gentle, explained everything..."   │                 │
│ │ "Short wait, professional treatment"     │                 │
│ │                                          │                 │
│ │ Stats:                                   │                 │
│ │   Patients treated: 2,340                │                 │
│ │   Avg consultation: 15 min               │                 │
│ │   Avg wait time: 12 min                  │                 │
│ │   Available: Mon-Sat, 10am-6pm           │                 │
│ └──────────────────────────────────────────┘                 │
│                                                              │
│ Computed from:                                               │
│ • doctor_reviews table (ratings, text)                       │
│ • doctors table (avg_rating, total_reviews, total_patients)  │
│ • appointments table (avg duration, avg wait time)           │
│ • schedules table (availability)                             │
└──────────────────────────────────────────────────────────────┘
```

### Review Embeddings (for AI search)

```
Patient AI chat: "Which doctor is best for kids' teeth problems?"
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│ Vector search across doctor review embeddings:               │
│                                                              │
│ WHERE clinic_id = $1                                         │
│   AND source_type = 'review'                                 │
│   AND metadata->>'specialization' = 'Pediatric Dentist'     │
│                                                              │
│ + aggregate avg_rating, total_reviews from doctors table     │
│                                                              │
│ AI Response:                                                 │
│ "For children's dental issues, Dr. Priya Mehta (Pediatric   │
│  Dentist) at your clinic has 4.8/5 rating with 89 reviews.  │
│  Parents frequently mention she's very gentle with kids.     │
│  She's available Mon/Wed/Fri 10am-2pm.                       │
│  Shall I book an appointment?"                               │
└──────────────────────────────────────────────────────────────┘
```

---

## AI Voice Appointment Flow

### Complete Call Flow with Unique Code

```
Patient calls clinic number (Twilio → Retell.ai)
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: AI GREETING                                          │
│ "Namaste! Welcome to City Dental Clinic.                     │
│  How can I help you today?"                                  │
│                                                              │
│ Patient: "I want to book an appointment"                     │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: IDENTIFY PATIENT                                     │
│ "Are you an existing patient? Can you share your             │
│  phone number or patient code?"                              │
│                                                              │
│ Option A: Existing patient                                   │
│   → Patient gives phone/code                                 │
│   → AI looks up in patients table                            │
│   → "Welcome back, Rajesh! I see your records."              │
│                                                              │
│ Option B: New patient                                        │
│   → AI collects: name, phone, DOB, gender                   │
│   → Creates patient record                                   │
│   → Generates UNIQUE CODE: "PAT-2026-7392"                  │
│   → "Your patient code is PAT-2026-7392. Please save it."   │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: COLLECT SYMPTOMS                                     │
│                                                              │
│ "What symptoms are you experiencing?"                        │
│                                                              │
│ Patient: "I have tooth pain in my lower jaw for 3 days,      │
│           and some swelling"                                  │
│                                                              │
│ AI stores symptoms in appointments.symptoms_summary          │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: AI SMART DOCTOR SUGGESTION (KEY FEATURE)             │
│                                                              │
│ AI analyzes symptoms → maps to specialization → queries      │
│ all doctors in THIS clinic → ranks by best match             │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │              SYMPTOM → DOCTOR MATCHING ENGINE             │ │
│ │                                                          │ │
│ │ Input: "tooth pain, lower jaw, swelling, 3 days"         │ │
│ │                                                          │ │
│ │ Step A: Map symptoms to specializations                  │ │
│ │   → tooth pain, jaw → "Dentist"                          │ │
│ │   → swelling + pain → could be "Oral Surgeon"           │ │
│ │   → skin rash → "Dermatologist"                          │ │
│ │   → chest pain → "Cardiologist"                          │ │
│ │   → cough, fever → "General Physician"                   │ │
│ │   → knee pain → "Orthopedic"                             │ │
│ │   → eye irritation → "Ophthalmologist"                   │ │
│ │   → child fever → "Pediatrician"                         │ │
│ │                                                          │ │
│ │ Step B: Query matching doctors in this clinic             │ │
│ │                                                          │ │
│ │   SELECT d.name, d.specialization, d.consultation_fee,   │ │
│ │          d.avg_rating, d.total_patients, d.experience_yrs│ │
│ │   FROM doctors d                                         │ │
│ │   WHERE d.clinic_id = $clinic_id                         │ │
│ │     AND d.specialization ILIKE '%Dentist%'               │ │
│ │     AND d.is_active = true                               │ │
│ │   ORDER BY d.avg_rating DESC;                            │ │
│ │                                                          │ │
│ │ Step C: Get LIVE queue status for each matching doctor    │ │
│ │                                                          │ │
│ │   SELECT doctor_id,                                      │ │
│ │     COUNT(*) AS patients_in_queue,                       │ │
│ │     MAX(position) AS last_token_number,                  │ │
│ │     AVG(estimated_wait) AS avg_wait_minutes              │ │
│ │   FROM queue_entries                                     │ │
│ │   WHERE clinic_id = $clinic_id                           │ │
│ │     AND status IN ('waiting', 'in_progress')             │ │
│ │     AND date = CURRENT_DATE                              │ │
│ │   GROUP BY doctor_id;                                    │ │
│ │                                                          │ │
│ │ Step D: Get next available slot for each doctor           │ │
│ │                                                          │ │
│ │   SELECT start_time FROM appointments                    │ │
│ │   WHERE doctor_id = $1 AND date = $2                     │ │
│ │     AND status NOT IN ('cancelled')                      │ │
│ │   → Calculate gaps → find open slots                     │ │
│ │                                                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ AI RESPONSE ON CALL:                                         │
│                                                              │
│ "Based on your symptoms — tooth pain and jaw swelling —      │
│  I recommend a Dentist. We have 2 dentists available today:  │
│                                                              │
│  1. Dr. Sharma (Senior Dentist)                              │
│     ⭐ 4.8 rating | 12 years experience                     │
│     💰 Consultation fee: Rs 500                              │
│     👥 Current queue: 3 patients waiting                     │
│     🎫 Next token: #4                                        │
│     ⏰ Estimated wait: ~25 minutes                           │
│     📅 Next slot: 11:30 AM today                             │
│                                                              │
│  2. Dr. Priya (Dentist)                                      │
│     ⭐ 4.5 rating | 6 years experience                      │
│     💰 Consultation fee: Rs 300                              │
│     👥 Current queue: 1 patient waiting                      │
│     🎫 Next token: #2                                        │
│     ⏰ Estimated wait: ~10 minutes                           │
│     📅 Next slot: 10:45 AM today                             │
│                                                              │
│  Which doctor would you like to see?"                        │
│                                                              │
│ Patient: "Dr. Sharma, 11:30 AM"                              │
│                                                              │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 5: BOOK & ASSIGN TOKEN                                  │
│                                                              │
│ → Creates appointment with code: "APT-2026-3847"            │
│ → Assigns TOKEN NUMBER: #4 for Dr. Sharma                    │
│ → Creates queue_entry with position = 4                      │
│ → Updates doctor_patient_relationships                       │
│                                                              │
│ "Your appointment is booked!                                 │
│  Doctor: Dr. Sharma (Dentist)                                │
│  Fee: Rs 500                                                 │
│  Token Number: #4                                            │
│  Estimated Wait: ~25 minutes                                 │
│  Time: 11:30 AM today                                        │
│  Appointment Code: APT-2026-3847"                            │
│                                                              │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 5: CONFIRMATION                                         │
│                                                              │
│ "Your appointment is confirmed!                              │
│  Doctor: Dr. Sharma                                          │
│  Date: March 15, 2026 at 11:00 AM                           │
│  Appointment Code: APT-2026-3847                             │
│  Your Patient Code: PAT-2026-7392                            │
│                                                              │
│  Please share this code when you arrive at the clinic.       │
│  You'll receive an SMS confirmation shortly."                │
│                                                              │
│ → Send SMS via Twilio                                        │
│ → Send WhatsApp confirmation                                 │
│ → Log call in ai_voice_calls table                           │
└──────────────────────────────────────────────────────────────┘
```

### At the Clinic (Doctor Verification)

```
Patient arrives at clinic with code: PAT-2026-7392
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│ STAFF/DOCTOR VERIFICATION                                    │
│                                                              │
│ Staff enters code OR patient scans QR at reception           │
│ → System looks up patient by unique_code                     │
│ → Shows: name, appointment details, symptoms summary         │
│ → Adds to live queue                                         │
│ → Patient gets queue position on WhatsApp                    │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ DOCTOR'S SCREEN (during consultation)                        │
│                                                              │
│ ┌────────────────────────────────────────────────────┐       │
│ │ Patient: Rajesh Kumar  Code: PAT-2026-7392         │       │
│ │ Apt: APT-2026-3847     Slot: 11:00 AM              │       │
│ │                                                    │       │
│ │ AI Pre-Visit Summary:                              │       │
│ │ "Patient reported persistent tooth pain, lower     │       │
│ │  left jaw, 3 days duration via AI call"            │       │
│ │                                                    │       │
│ │ Previous Visits (3):                               │       │
│ │ • Jan 2026: Root canal, tooth #36                  │       │
│ │ • Oct 2025: Cleaning + filling, tooth #14          │       │
│ │ • Jun 2025: First visit, general checkup           │       │
│ │                                                    │       │
│ │ Active Medications: Ibuprofen 400mg PRN            │       │
│ │ Allergies: Penicillin                              │       │
│ │                                                    │       │
│ │ [Start Consultation] [AI Scribe: ON]               │       │
│ └────────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

### Post-Consultation Flow

```
Doctor completes consultation
              │
              ├─→ Consultation notes saved (SOAP format)
              │     → Embedding generated
              │
              ├─→ Prescription created
              │     → Each medicine saved in prescription_items
              │     → Embedding generated
              │     → WhatsApp: Rx PDF sent to patient
              │
              ├─→ Lab tests ordered (if any)
              │     → Patient notified via WhatsApp
              │
              ├─→ Invoice generated
              │     → UPI QR code for payment
              │     → WhatsApp: invoice link
              │
              ├─→ Follow-up scheduled (if needed)
              │     → Auto-reminder via SMS/WhatsApp
              │     → AI follow-up call on follow_up_date
              │
              ├─→ Review request sent (WhatsApp)
              │     → "How was your visit? Rate Dr. Sharma"
              │
              └─→ doctor_patient_relationships updated
                    → total_visits++
                    → last_visit = now
                    → total_spent += invoice amount
```

---

## AI Voice Call Log

```sql
CREATE TABLE ai_voice_calls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  call_provider_id VARCHAR(255),                  -- Retell.ai call ID
  phone_number    VARCHAR(20) NOT NULL,           -- caller's number
  patient_id      UUID REFERENCES patients(id),   -- null if unidentified

  direction       VARCHAR(10) DEFAULT 'inbound',  -- inbound, outbound (follow-ups)
  intent          VARCHAR(50),                     -- book_appointment, check_queue, cancel, clinic_info, register, follow_up
  status          VARCHAR(50),                     -- completed, transferred_to_human, failed, abandoned

  duration_seconds INTEGER,
  transcript      TEXT,                            -- full call transcript
  ai_summary      TEXT,                            -- AI-generated call summary

  -- What actions were taken during this call
  actions_taken   JSONB DEFAULT '[]',
  -- Example: [
  --   {"action": "patient_registered", "patient_id": "uuid"},
  --   {"action": "appointment_booked", "appointment_id": "uuid"},
  --   {"action": "queue_status_shared", "position": 5}
  -- ]

  language        VARCHAR(20) DEFAULT 'en',       -- en, hi, ta, te, kn, bn, mr
  sentiment       VARCHAR(20),                    -- positive, neutral, negative

  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_voice_calls_clinic ON ai_voice_calls(clinic_id, created_at);
```

---

## Image & Document Embedding Strategy

### What Gets Embedded vs What Stays as Structured Data

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  STRUCTURED DATA (queryable with SQL):                         │
│  ─────────────────────────────────────                         │
│  • Lab values (hemoglobin: 14.2 g/dL) → JSONB in lab_reports  │
│  • Medicine details (name, dosage) → prescription_items table  │
│  • Appointment data → appointments table                       │
│  • Vitals (BP, temp) → JSONB in consultation_notes             │
│  • Ratings → doctor_reviews table                              │
│                                                                │
│  Use SQL for: exact lookups, aggregations, trends, filtering   │
│  Example: "Show blood sugar trend" → SQL query on lab_reports  │
│                                                                │
│  ──────────────────────────────────────────────────────────     │
│                                                                │
│  EMBEDDINGS (searchable with natural language):                 │
│  ──────────────────────────────────────────────                 │
│  • Prescription TEXT summary → embeddings table                │
│  • Consultation notes TEXT → embeddings table                   │
│  • Lab report AI summary TEXT → embeddings table               │
│  • Doctor review TEXT → embeddings table                        │
│  • AI call transcript TEXT → embeddings table                   │
│                                                                │
│  Use embeddings for: fuzzy search, "what was that medicine     │
│  for my headache?", semantic similarity, AI chat RAG           │
│                                                                │
│  ──────────────────────────────────────────────────────────     │
│                                                                │
│  FILES (stored in Cloudflare R2):                              │
│  ────────────────────────────────                               │
│  • Original prescription images → R2                           │
│  • Lab report PDFs/images → R2                                 │
│  • X-ray/MRI/ECG images → R2                                  │
│  • Chat attachments → R2                                       │
│  • Invoice PDFs → R2                                           │
│                                                                │
│  ⚠ We do NOT embed images directly.                            │
│  We extract TEXT from images (via Claude Vision OCR)            │
│  and embed the extracted TEXT.                                  │
│                                                                │
│  Image → Claude Vision → Structured JSON → Database            │
│                                → Text summary → Embedding      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Complete System Data Flow

```
                          ┌─────────────┐
                          │   PATIENT   │
                          └──────┬──────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
          ┌────────────┐ ┌────────────┐ ┌────────────────┐
          │  AI Voice   │ │  Patient   │ │   WhatsApp     │
          │  Call       │ │  Portal    │ │   Bot          │
          │ (Retell.ai) │ │ (Next.js)  │ │ (Twilio API)   │
          └─────┬──────┘ └─────┬──────┘ └───────┬────────┘
                │              │                │
                └──────────────┼────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Next.js API       │
                    │    (App Router)      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │ Vercel AI    │ │  Supabase    │ │ Cloudflare   │
     │ SDK v6       │ │  PostgreSQL  │ │ R2 Storage   │
     │ (Claude API) │ │  + pgvector  │ │ (files)      │
     │              │ │  + RLS       │ │              │
     │ • Chat RAG   │ │  + Realtime  │ │ • Images     │
     │ • OCR        │ │              │ │ • PDFs       │
     │ • Scribe     │ │ ALL DATA     │ │ • Reports    │
     │ • Analysis   │ │ LIVES HERE   │ │              │
     └──────────────┘ └──────────────┘ └──────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Row Level Security  │
                    │  (Tenant Isolation)  │
                    │                     │
                    │  Every query auto-  │
                    │  filtered by        │
                    │  clinic_id from JWT │
                    └─────────────────────┘
```

---

## Security & Multi-Tenant Isolation

### Row Level Security (RLS) Policy

```sql
-- Every table gets this RLS policy
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON appointments
  USING (clinic_id = auth.jwt()->>'clinic_id');

-- Patients can only see their own data
CREATE POLICY "Patient sees own data" ON appointments
  FOR SELECT USING (
    clinic_id = auth.jwt()->>'clinic_id'
    AND patient_id = auth.jwt()->>'patient_id'
  );

-- Doctors see all patients in their clinic
CREATE POLICY "Doctor sees clinic data" ON appointments
  FOR SELECT USING (
    clinic_id = auth.jwt()->>'clinic_id'
    AND auth.jwt()->>'role' IN ('doctor', 'staff')
  );
```

### Embedding Security

```
⚠ CRITICAL: Embeddings must ALWAYS be filtered by clinic_id + patient_id

Patient A must NEVER see Patient B's data in AI chat responses.
Doctor must NEVER see patients from another clinic.

Every embedding query includes:
  WHERE clinic_id = [from JWT] AND patient_id = [from session]
```

---

## Design Decisions

| Date       | Decision                          | Rationale                         |
|------------|-----------------------------------|-----------------------------------|
| 2026-03-12 | Multi-tenant with data isolation  | Per PRD — each clinic independent |
| 2026-03-12 | SaaS subscription model           | Per PRD — Basic/Pro/Enterprise    |
| 2026-03-14 | Supabase + pgvector               | Single DB for data + embeddings, no external vector DB |
| 2026-03-14 | Claude Vision for OCR             | Understands medical shorthand, not just raw OCR |
| 2026-03-14 | Text embeddings, not image embeddings | Extract text from images first, then embed text |
| 2026-03-14 | One embedding per medical record  | Prescriptions/notes are small; no need to chunk |
| 2026-03-14 | Retell.ai for voice               | HIPAA compliant, regional language support |
| 2026-03-14 | WhatsApp-first for India          | 500M+ users, no app download needed |
| 2026-03-14 | Patient unique code system        | Bridges AI call → clinic visit verification |
| 2026-03-14 | Dual storage: SQL + embeddings    | SQL for exact queries, embeddings for AI chat RAG |
### Patient Appointment Booking (Multi-Channel)

```
Patient ─── Voice Call ───┐
Patient ─── WhatsApp ─────┤
Patient ─── Web Portal ───┤
Patient ─── Web Chat ─────┘
                          │
                    AI Communication Hub
                          │
                    ┌─────┴──────┐
                    │  Triage?   │ (Phase 3)
                    │  Urgency   │
                    └─────┬──────┘
                          │
                    Appointment Engine
                          │
              ┌───────────┼───────────┐
              │           │           │
         Slot Available  Waitlist   Escalate to
              │           │         Human Staff
              │           │
         Book + Confirm   Queue
              │           │
         Notification Engine
              │
    ┌─────────┼─────────┐
    WhatsApp  SMS    Push/Email
```

### Consultation & Post-Visit Flow

```
Patient Check-In (QR / Staff / Geofencing)
        │
   Queue Manager ──→ Real-time updates to Patient (WhatsApp/Portal)
        │
   Doctor Dashboard ──→ Patient Summary + Symptom Intake
        │
   Consultation
        │
   ┌────┴────┐
   │         │
Prescription  Invoice
   │         │
   │    Payment Gateway (Razorpay/UPI)
   │         │
   └────┬────┘
        │
   Post-Visit Engine
        │
   ┌────┼────┬────────────┐
   │    │    │            │
Feedback  Follow-Up  Medication  Campaign
Survey    Reminder   Reminder    Engine
```

## Integration Points

| External System       | Integration Type  | Purpose                               |
|-----------------------|-------------------|---------------------------------------|
| WhatsApp Business API | REST / Webhook    | Patient communication, chatbot        |
| Razorpay              | REST / Webhook    | Payment processing, refunds           |
| Twilio / Sarvam AI    | REST / WebSocket  | Voice AI, telephony                   |
| Jitsi / Daily.co      | SDK / Embed       | Video consultation                    |
| Lab chains (1mg, etc) | REST              | Test ordering, result delivery        |
| EHR/EMR (Practo, etc) | FHIR / REST       | Health record interoperability        |
| SMS Gateway           | REST              | Fallback notifications                |
| Push Notification     | FCM / APNs        | Mobile app notifications              |

## Security Architecture

- **Tenant isolation:** Row-level security (RLS) or schema-per-tenant
- **Authentication:** JWT + refresh tokens, MFA for clinic staff
- **Authorization:** RBAC with 7+ roles, per-clinic role assignment
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Audit:** Immutable audit log for all PHI access
- **API security:** Rate limiting, request signing, IP allowlisting (enterprise)
- **Compliance:** DPDPA consent flows, data export, right-to-deletion

## Design Decisions

| Date       | Decision                                | Rationale                                              |
|------------|-----------------------------------------|--------------------------------------------------------|
| 2026-03-12 | Multi-tenant with data isolation        | Per PRD — each clinic independent                      |
| 2026-03-12 | SaaS subscription model                 | Per PRD — Basic/Pro/Enterprise                         |
| 2026-03-13 | AI Communication Hub as shared infra    | Per BA — voice alone is insufficient; need omnichannel |
| 2026-03-13 | WhatsApp as primary patient channel     | Per BA — 40% of Indian telemedicine via WhatsApp       |
| 2026-03-13 | Razorpay for payments                   | Per BA — India-first, supports UPI natively            |
| 2026-03-13 | 7+ user roles (not 3)                   | Per BA — clinics need granular RBAC                    |
| 2026-03-13 | Integrate telemedicine, don't build     | Per BA — use Jitsi/Daily/Twilio, not custom video      |
| 2026-03-13 | Patient portal is cross-tenant          | Per BA — patient sees all their clinics in one place   |
| 2026-03-13 | EHR integration via FHIR, not replace   | Per BA — don't build EMR, integrate with existing ones |
