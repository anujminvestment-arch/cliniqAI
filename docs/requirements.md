# Requirements — CliniqAI

## Functional Requirements

### Multi-Tenant Clinic System
- [ ] Each clinic operates as an independent tenant with isolated data
- [ ] Support for multiple clinic branches under one doctor/owner
- [ ] Tenant-level data isolation enforced at database and API layers

### AI Voice Receptionist
- [ ] Answer clinic calls via AI voice assistant
- [ ] Book, cancel, and reschedule appointments by phone
- [ ] Provide doctor availability and clinic timings
- [ ] Share queue status with callers
- [ ] Register new patients via phone
- [ ] **Smart Doctor Suggestion**: Analyze symptoms on call → suggest matching doctor by specialization
- [ ] Show doctor's consultation fee, rating, experience, and current queue on call
- [ ] Assign token number and share estimated wait time
- [ ] Support regional languages (Hindi, Tamil, Telugu, Kannada, etc.)

### Queue & Token Management
- [ ] Sequential token numbers per doctor per day
- [ ] Real-time queue position tracking (portal + WhatsApp)
- [ ] Estimated wait time calculation based on avg consultation duration
- [ ] Live queue broadcast to clinic TV display
- [ ] WhatsApp notifications: "You are #3", "You are NEXT!"
- [ ] Walk-in token generation at reception (QR scan or staff entry)
- [ ] Queue position updates on patient check-in, completion, and skip

### Appointment Management
- [ ] Create, edit, cancel, reschedule appointments
- [ ] Track appointment history per patient
- [ ] Define consultation time slots per doctor
- [ ] Multi-doctor scheduling support

### Queue Management
- [ ] Real-time queue length display
- [ ] Estimated waiting time calculation
- [ ] Queue position tracking per patient
- [ ] Doctor availability status

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

### Billing & Transactions
- [ ] Generate invoices per visit
- [ ] Record payments
- [ ] Payment history per patient
- [ ] Downloadable receipts

### Automated Follow-Ups
- [ ] SMS appointment reminders
- [ ] AI follow-up calls post-visit
- [ ] Appointment suggestions based on history

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

## Non-Functional Requirements

- [ ] 99.9% uptime target
- [ ] Support high concurrent calls
- [ ] Fast appointment scheduling (< 2s response)
- [ ] Scalable to thousands of clinics
- [ ] Encrypted patient data at rest and in transit
- [ ] Secure API endpoints with authentication
- [ ] Audit logging for all data access
- [ ] Healthcare data protection compliance

## User Roles

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
