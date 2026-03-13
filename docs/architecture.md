# Architecture — CliniqAI

## System Overview

Multi-tenant SaaS platform for AI-powered clinic management. Each clinic is an independent tenant with fully isolated data. AI-first approach: voice, WhatsApp, and web chat as primary communication channels.

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

> **Not yet decided.** Update this section once technology choices are made.

**Considerations from business analysis:**
- **Voice AI:** Sarvam AI (Indian languages), Twilio (telephony), or similar
- **WhatsApp:** WhatsApp Business API via official BSP or Meta Cloud API
- **Video:** Jitsi Meet (open source), Daily.co, or Twilio Video
- **Payments:** Razorpay (India-first, supports UPI, cards, wallets, net banking)
- **i18n:** next-intl or similar for frontend; AI providers with multilingual support
- **Real-time:** WebSocket or SSE for queue updates, notifications

## Data Flow

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
