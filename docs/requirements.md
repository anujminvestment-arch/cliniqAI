# Requirements — CliniqAI

## Target Market

- **Primary:** Solo doctors and small clinics (1-5 doctors) in India, Tier 2/3 cities
- **Secondary:** Multi-specialty clinics and small hospital chains
- **Geography:** India-first, multi-country later
- **Pricing model:** TBD — per-clinic subscription or per-appointment (outcome-based)

## User Roles

| Role              | Permissions                                                                        |
|-------------------|------------------------------------------------------------------------------------|
| Super Admin       | Platform management, clinic onboarding, global settings, compliance oversight      |
| Clinic Owner      | Full clinic config, staff management, billing, analytics, AI settings              |
| Doctor            | Manage patients, consultations, prescriptions, follow-ups, view analytics          |
| Clinic Staff      | Register patients, schedule appointments, manage queue, billing                    |
| Nurse             | Patient intake, vitals recording, queue management, prescription assistance        |
| Receptionist      | Phone/WhatsApp handling, appointment booking, patient check-in                     |
| Patient           | Book appointments, view records, track queue, pay bills, family management         |
| Caregiver         | Manage family members' appointments and records (delegated patient access)         |

---

## Phase 1: MVP+ — "Clinic Can Operate" (Must Have)

### Multi-Tenant Clinic System
- [ ] Each clinic operates as an independent tenant with isolated data
- [ ] Support for multiple clinic branches under one doctor/owner
- [ ] Tenant-level data isolation enforced at database and API layers

### AI Voice Receptionist
- [ ] Answer clinic calls via AI voice assistant (Bolna.ai + Exotel)
- [ ] AI greets with clinic name: "Welcome to City Dental Clinic, how can I help?"
- [ ] Book, cancel, and reschedule appointments by phone
- [ ] Provide doctor availability and clinic timings from knowledge base
- [ ] Share queue status with callers (real-time via function calling)
- [ ] Register new patients via phone
- [ ] **Smart Doctor Suggestion**: Analyze symptoms on call → match specialization → suggest best doctor with fee, rating, queue, token
- [ ] Assign token number and share estimated wait time
- [ ] Support regional languages (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi + Hinglish code-switching)
- [ ] After-hours handling with different scripts and emergency routing
- [ ] Transfer to human receptionist when AI cannot resolve (warm handoff with call summary)
- [ ] Store complete call transcript + AI summary in database (real-time sync via webhook + BullMQ queue)
- [ ] Post-call actions: WhatsApp confirmation, SMS backup, embedding generation, analytics update

### Knowledge Base System
- [ ] **Clinic Knowledge Base** (per tenant — managed by Clinic Owner/Super Admin):
  - [ ] Clinic info: name, address, timings, holidays, directions, parking, services offered
  - [ ] Doctor profiles: name, specialization, qualifications, experience, consultation fee, availability schedule, bio
  - [ ] Services catalog: procedures offered, descriptions, pricing, preparation instructions
  - [ ] FAQs: "How to book?", "What insurance accepted?", "Where to park?", custom clinic FAQs
  - [ ] Post-visit care instructions: per procedure type (e.g., "After root canal, avoid hot food for 24 hours")
  - [ ] Announcements: "Clinic closed on Holi", "New doctor joining", "COVID testing available"
- [ ] **Medical Knowledge Base** (platform-wide — managed by Super Admin):
  - [ ] Symptom → specialization mapping (50+ symptoms pre-seeded, clinics can add custom)
  - [ ] Common condition descriptions (patient-friendly explanations)
  - [ ] Emergency triage rules: chest pain → "Call 108 immediately", high fever child → "Visit ER"
  - [ ] Medication general info (not prescriptions — general safety info)
  - [ ] Health tips and preventive care content
- [ ] **Knowledge Base Admin Panel** (Super Admin + Clinic Owner):
  - [ ] CRUD interface for all knowledge base entries
  - [ ] Bulk import/export (CSV, JSON)
  - [ ] Preview: "Test this question against the knowledge base" before publishing
  - [ ] Version history: see who changed what, when
  - [ ] Auto-embed: when content is created/updated, automatically generate/update vector embeddings
- [ ] **Knowledge Base Serving** (how AI uses it):
  - [ ] Static info (clinic name, timings) → injected into AI system prompt (cached in Redis, 1hr TTL)
  - [ ] FAQs and medical guidelines → RAG via pgvector embeddings (semantic search)
  - [ ] Dynamic info (queue status, slot availability) → real-time function calling to API
  - [ ] Hybrid: system prompt + RAG + function calling used together during every call/chat

### Conversation Storage & Sync
- [ ] Store ALL conversations from ALL channels in unified format:
  - [ ] Voice calls (Bolna.ai → webhook → BullMQ → PostgreSQL)
  - [ ] WhatsApp messages (WhatsApp API → webhook → BullMQ → PostgreSQL)
  - [ ] Web chat (WebSocket → BullMQ → PostgreSQL)
  - [ ] In-app doctor-patient chat (direct to PostgreSQL)
- [ ] Each conversation stored as structured record:
  - [ ] Conversation metadata: channel, patient_id, clinic_id, start/end time, status, sentiment
  - [ ] Individual messages: role (patient/AI/doctor), content, timestamp, intent detected
  - [ ] Extracted data: appointment booked, symptoms mentioned, doctor selected, actions taken
  - [ ] AI summary: auto-generated conversation summary
  - [ ] Call recording URL (for voice calls, with consent)
  - [ ] Transcript URL (for voice calls)
- [ ] **Reliable ingestion pipeline** (no data loss):
  - [ ] BullMQ queue for async processing (webhook → queue → worker → DB)
  - [ ] At-least-once delivery guarantee
  - [ ] Idempotency: deduplicate using call_id / message_id
  - [ ] Dead-letter queue for failed jobs with 3 retries + exponential backoff
  - [ ] Monitoring: alert if dead-letter queue grows
- [ ] **Embedding generation** from conversations:
  - [ ] After conversation ends, generate embedding from transcript for RAG search
  - [ ] Patient can later ask: "What did the receptionist tell me about my appointment?"
- [ ] **Analytics from conversations**:
  - [ ] Call duration, resolution rate, sentiment score
  - [ ] Most common intents (booking, queue check, clinic info)
  - [ ] Unresolved query tracking (questions AI couldn't answer → improve knowledge base)
  - [ ] Language distribution across calls

### Queue & Token Management
- [ ] Sequential token numbers per doctor per day
- [ ] Real-time queue position tracking (portal + WhatsApp)
- [ ] Estimated wait time calculation based on avg consultation duration
- [ ] Live queue broadcast to clinic TV display
- [ ] WhatsApp notifications: "You are #3", "You are NEXT!"
- [ ] Walk-in token generation at reception (QR scan or staff entry)
- [ ] Queue position updates on patient check-in, completion, and skip
- [ ] Smart escalation — detect urgency and route to human staff
- [ ] After-hours handling with different scripts

### Appointment Management
- [ ] Create, edit, cancel, reschedule appointments
- [ ] Track appointment history per patient
- [ ] Define consultation time slots per doctor
- [ ] Multi-doctor scheduling support
- [ ] Buffer time management between appointments

### Queue Management
- [ ] Real-time queue length display
- [ ] Estimated waiting time calculation
- [ ] Queue position tracking per patient
- [ ] Doctor availability status
- [ ] No-show detection — auto-advance queue after grace period

### Multi-Clinic Management
- [ ] Add/manage multiple clinic branches
- [ ] Define clinic timings per branch
- [ ] Assign doctors to specific clinics
- [ ] Automatic appointment routing to correct branch

### Patient Registration
- [ ] AI phone registration
- [ ] QR code join flow
- [ ] Invite link registration
- [ ] Manual entry by clinic staff

### Patient Portal
- [ ] View upcoming and past appointments
- [ ] Visit history and prescriptions
- [ ] Download invoices and receipts
- [ ] Payment transaction history
- [ ] Live queue tracking
- [ ] Search across appointments, records, prescriptions

### Billing & Online Payments
- [ ] Generate invoices per visit
- [ ] Record payments
- [ ] Payment history per patient
- [ ] Downloadable receipts
- [ ] Online payment gateway (Razorpay, UPI, cards, wallets, net banking)

### Digital Prescriptions
- [ ] Doctor generates digital prescriptions within the platform
- [ ] Doctor e-signature on prescriptions
- [ ] Patient receives prescription via portal and WhatsApp
- [ ] Print-friendly prescription view

### WhatsApp Notifications
- [ ] Appointment confirmation and reminders via WhatsApp
- [ ] Queue position updates ("You're next", "15 min away")
- [ ] Payment reminders for overdue invoices
- [ ] Prescription delivery via WhatsApp

### Granular RBAC
- [ ] At least 7 distinct roles (Super Admin, Clinic Owner, Doctor, Staff, Nurse, Receptionist, Patient)
- [ ] Configurable permissions per role
- [ ] Role assignment per clinic (staff can have different roles at different clinics)

### Compliance & Security (DPDPA/HIPAA)
- [ ] Explicit consent capture during registration and data processing
- [ ] Detailed audit logging for all data access and modifications
- [ ] Encrypted patient data at rest and in transit
- [ ] Consent management dashboard for clinic admins
- [ ] Data export capability for patient portability (DPDPA requirement)
- [ ] Terms of Service and Privacy Policy acceptance during registration

### Auth & UI Foundations (from UI/UX Audit)
- [ ] Form validation on login and register with inline error messages
- [ ] Forgot password flow (email-based reset)
- [ ] Password visibility toggle
- [ ] Password strength indicator on registration
- [ ] Auth guards — redirect unauthenticated users to login
- [ ] Delete confirmation dialogs on all destructive actions
- [ ] Table pagination on all list views
- [ ] Breadcrumb navigation on inner pages
- [ ] Loading skeletons between page navigations
- [ ] Notification bell with dropdown on all portals
- [ ] Portal switcher / "Back to Home" navigation

---

## Phase 2: Growth — "Better Than Manual" (Should Have)

### WhatsApp Chatbot
- [ ] Full conversational AI on WhatsApp (same capabilities as voice)
- [ ] Book, cancel, reschedule appointments via WhatsApp chat
- [ ] Check queue status via WhatsApp
- [ ] Receive lab results and prescriptions via WhatsApp
- [ ] Two-way communication between clinic and patient

### Telemedicine / Video Consultation
- [ ] Video consultation between doctor and patient (integrate Jitsi, Daily, or Twilio)
- [ ] One-tap video join from patient portal or WhatsApp link
- [ ] Consultation notes tied to video session
- [ ] Recording capability (with consent) for medical records

### Waitlist Management
- [ ] Patients join waitlist when no slots available
- [ ] Auto-notify patients when cancellation opens a slot
- [ ] Priority ordering on waitlist (urgency, loyalty, distance)

### Patient Feedback & NPS
- [ ] Post-visit satisfaction survey (automated via WhatsApp/portal)
- [ ] NPS score tracking per doctor and per clinic
- [ ] Feedback visible to clinic owner dashboard
- [ ] Google Review prompt for high-satisfaction patients

### Multi-Language (i18n)
- [ ] Hindi support (patient-facing and clinic-facing)
- [ ] At least 1 additional regional language (Tamil, Bengali, or Telugu)
- [ ] Language preference stored per user
- [ ] AI voice/chat responds in patient's preferred language

### Medication Reminders
- [ ] Push notifications for medication schedules
- [ ] WhatsApp reminders for medication adherence
- [ ] Refill reminders when medication is running low

### Clinic Analytics Dashboard
- [ ] Revenue trends (daily, weekly, monthly)
- [ ] No-show rate tracking
- [ ] Peak hours analysis
- [ ] Doctor utilization metrics
- [ ] Patient satisfaction score trends
- [ ] Benchmarking against anonymized platform averages

### Automated Follow-Ups (Enhanced)
- [ ] SMS appointment reminders
- [ ] AI follow-up calls post-visit
- [ ] Appointment suggestions based on history
- [ ] Recurring appointment auto-scheduling for chronic care

---

## Phase 3: Scale — "Why Clinics Pay Premium" (Could Have)

### AI Patient Chat (In-App)
- [ ] AI-powered chat in patient portal — answers questions about past medicines, appointments, prescriptions
- [ ] RAG-based retrieval from patient's own medical history (embeddings stored in pgvector)
- [ ] Patient asks: "What medicine did I take 3 months ago?" → AI searches prescriptions and answers
- [ ] Patient asks: "When is my next appointment?" → AI fetches from appointments
- [ ] Patient asks: "What did the doctor say last visit?" → AI retrieves consultation notes
- [ ] Chat history persisted per patient per clinic
- [ ] AI disclaimer on every response: "This is not medical advice"
- [ ] Streaming responses (real-time typing effect)
- [ ] Multi-language support (Hindi, English, Tamil, Telugu, etc.)

### Doctor-Patient Chat (Direct Messaging)
- [ ] Doctor can send messages to patient (post-visit notes, instructions, follow-up reminders)
- [ ] Patient can reply with questions or updates
- [ ] Attachment support — share reports, lab results, prescription images
- [ ] Read receipts and notification alerts
- [ ] Chat scoped to clinic tenant (multi-tenant isolation)
- [ ] Chat history accessible to doctor during next consultation

### Doctor AI Chat Assistant
- [ ] Doctor asks AI questions during consultation: "Drug interactions for Metformin + Glimepiride?"
- [ ] AI suggests diagnosis based on symptoms entered
- [ ] AI generates prescription draft from doctor's voice/text input
- [ ] AI summarizes patient's complete history before consultation
- [ ] Context-aware: AI knows the current patient's full medical history
- [ ] Clearly marked as "AI suggestion — not final diagnosis"

### Clinic Staff Chat (Internal)
- [ ] Staff-to-doctor quick messaging (e.g., "Patient X is waiting", "Emergency walk-in")
- [ ] Staff-to-staff messaging for handoffs
- [ ] Broadcast messages to all staff (clinic announcements)

### WhatsApp Integration
- [ ] Patient receives appointment confirmations on WhatsApp
- [ ] Queue position updates via WhatsApp (real-time)
- [ ] Prescription PDF shared via WhatsApp after visit
- [ ] Follow-up reminders via WhatsApp
- [ ] Patient can book/cancel appointment via WhatsApp bot
- [ ] Patient can check queue status via WhatsApp
- [ ] Medicine reminder notifications on WhatsApp
- [ ] UPI payment link via WhatsApp for billing
- [ ] Voice note support — patient sends symptoms as WhatsApp voice note → AI transcribes

### Prescription & Document Intelligence
- [ ] Upload prescription image (handwritten/printed) → OCR via Claude Vision → structured JSON
- [ ] Extract: medicine name, dosage, frequency, duration, doctor name, date
- [ ] Store as structured data in DB + generate vector embeddings for AI search
- [ ] Lab report upload → extract values (blood sugar, BP, cholesterol, HbA1c) → track trends
- [ ] Drug interaction checker — alert when conflicting medicines are prescribed
- [ ] Medicine adherence tracking — patient confirms via WhatsApp if they took their medicine
- [ ] Downloadable prescription history as PDF

### AI Symptom Intake (Post-MVP)
- [ ] Capture symptoms before consultation via chat or WhatsApp voice note
- [ ] AI transcribes voice in regional languages (Hindi, Tamil, Telugu, etc.)
- [ ] Provide structured SOAP-format summary to doctor
- [ ] Support symptom images (rashes, injuries) with AI visual analysis

### AI Doctor Assistant (Post-MVP)
- [ ] Suggest possible diagnoses based on symptoms + patient history
- [ ] Provide recommendations (not final diagnosis)
- [ ] AI ambient scribe — doctor speaks during consultation → AI generates clinical notes
- [ ] Voice-to-prescription — doctor dictates → AI creates structured Rx
- [ ] Smart templates — auto-fill common prescriptions (URTI, fever, gastritis) based on doctor's patterns
### AI Triage Bot
- [ ] Pre-booking symptom assessment (WhatsApp/voice/web)
- [ ] Urgency classification (emergency → call 108, urgent → same-day, routine → next available)
- [ ] Structured symptom summary sent to doctor before consultation

### Family Profiles / Family Health Hub
- [ ] One login manages entire family (children, elderly parents, spouse)
- [ ] Shared appointment calendar across family members
- [ ] Unified billing for family
- [ ] Caregiver access with delegated permissions

### Digital Health Card
- [ ] QR-code-based patient ID stored in phone wallet
- [ ] Scan to check-in at clinic
- [ ] Access records and verify identity via QR

### Lab/Test Integration
- [ ] Order lab tests from within the platform
- [ ] Receive and display lab results
- [ ] Share results with patients via portal/WhatsApp
- [ ] Integration with major Indian lab chains

### Campaign & Marketing Tools
- [ ] SMS/WhatsApp campaigns for health awareness
- [ ] Seasonal checkup reminders
- [ ] Birthday and anniversary wishes
- [ ] Re-engagement campaigns for dormant patients

### Referral Management
- [ ] Doctor-to-specialist referral with tracking
- [ ] Referral status updates for referring doctor
- [ ] Patient notification of referral and specialist details

### Staff Scheduling
- [ ] Shift management for clinic staff
- [ ] Attendance tracking
- [ ] Leave management

### Smart Queue Enhancements
- [ ] Geofencing check-in (auto-detect patient arrival)
- [ ] Dynamic wait time based on actual consultation durations
- [ ] Priority queue rules (emergency, elderly, pregnant)

### Revenue Cycle Enhancements
- [ ] Split billing (insurance + patient portions)
- [ ] Payment plans / EMI for expensive procedures
- [ ] Revenue analytics per doctor, per service, per branch

---

## Phase 4: Moat — "Can't Switch Away" (Won't Have This Year)

### AI Clinical Notes (Ambient Documentation)
- [ ] Doctor speaks during consultation, AI generates SOAP notes
- [ ] Auto-generate prescriptions and billing codes from conversation
- [ ] Requires medical NLP validation and regulatory review

### Clinic Marketplace
- [ ] Patient discovery platform — find clinics by specialty, location, rating
- [ ] Online booking from marketplace
- [ ] Requires critical mass of clinics and patients

### AI Revenue Optimizer
- [ ] Predict no-shows and suggest overbooking
- [ ] Optimal consultation fee recommendations
- [ ] Underutilized slot identification

### Insurance & Claims
- [ ] Insurance verification and pre-authorization
- [ ] Claims submission integration
- [ ] Partner model rather than build in-house

### Enterprise Features
- [ ] SSO (SAML/OIDC) for hospital chains
- [ ] Advanced audit and compliance reporting
- [ ] SLA guarantees and dedicated support

### AI Doctor Assistant (Post-MVP)
- [ ] Suggest possible diagnoses based on symptoms
- [ ] Provide recommendations (not final diagnosis)
- [ ] Human-in-the-loop validation required

---

## Non-Functional Requirements

### Performance
- [ ] 99.9% uptime target
- [ ] Support high concurrent calls (100+ simultaneous)
- [ ] Fast appointment scheduling (< 2s response)
- [ ] Scalable to thousands of clinics

### Security
- [ ] Encrypted patient data at rest and in transit
- [ ] Secure API endpoints with authentication and rate limiting
- [ ] Audit logging for all data access
- [ ] Healthcare data protection compliance (DPDPA, HIPAA where applicable)
- [ ] Tenant-level data isolation at database and API layers

### Disaster Recovery
- [ ] RPO < 1 hour for healthcare data
- [ ] RTO < 4 hours
- [ ] Automated daily backups with point-in-time recovery

### API & Integration
- [ ] Documented external REST API for third-party integrations
- [ ] Webhook support for real-time event notifications
- [ ] EHR/EMR integration capability (Practo, Epic, Cerner — via FHIR where available)

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader compatibility
- [ ] Keyboard navigation support
- [ ] Minimum 4.5:1 color contrast ratios

---

## Competitive Positioning

CliniqAI's real competition is **not other software** — it's the status quo (paper registers + WhatsApp groups + phone calls + Excel). The product must be:
1. **Cheaper** than hiring a receptionist (₹12K-18K/month)
2. **Easier** than the current manual process
3. **Immediately valuable** on Day 1 (30-minute setup, not 3-week onboarding)

| Role         | Permissions                                                   |
|--------------|---------------------------------------------------------------|
| Doctor       | Manage clinics, patient records, configure follow-ups, AI assistant chat, message patients |
| Clinic Staff | Register patients, schedule appointments, manage queue, internal chat, upload prescriptions |
| Patient      | Book appointments, view records, track queue, view transactions, AI chat, WhatsApp bot, upload documents |

## MVP Scope

1. Multi-tenant clinic system
2. Appointment management
3. Queue tracking
4. AI call booking
5. Doctor dashboard
6. Patient portal
7. Billing system
8. AI patient chat (ask about medicines, appointments, history)
9. Doctor-patient messaging
10. Prescription OCR + medicine tracking
11. WhatsApp notifications (confirmations, queue updates, reminders)

## Post-MVP Scope

1. WhatsApp bot (full booking + queue + payments via WhatsApp)
2. AI ambient scribe (doctor voice → clinical notes)
3. Voice-to-prescription
4. Lab report OCR + health trend tracking
5. Drug interaction checker
6. Medicine adherence tracking
7. Doctor AI assistant (diagnosis suggestions, smart templates)
8. Staff internal chat
9. AI symptom intake (voice notes in regional languages)
10. Insurance/TPA claim automation
11. Telemedicine with AI notes
12. Family health profiles
13. ABDM/ABHA integration
**Key differentiators vs. Practo/Drlogy:**
- AI-first (voice + WhatsApp + web chat), not AI-bolted-on
- WhatsApp as primary patient interface, not just notifications
- Focus on small clinics in Tier 2/3 cities (underserved market)
- Zero-setup onboarding (sign up → configure hours → AI starts working)
