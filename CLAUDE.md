# CliniqAI — AI Clinic Management & Patient Communication Platform

## Project Overview

Multi-tenant AI-powered clinic management SaaS platform. Doctors and clinics automate patient communication, appointment scheduling, queue management, and follow-ups using voice AI and intelligent automation. Each clinic operates as an independent tenant with fully isolated data.

## Tech Stack

> **Not yet decided.** Update this section once technology choices are made.

## Project Structure

> **Not yet initialized.** Update as the codebase takes shape.

## Core Modules

### Phase 1 — MVP+ ("Clinic Can Operate")
- **Auth & RBAC** — Authentication, 7+ roles, granular permissions per clinic
- **Multi-Tenant Engine** — Tenant isolation, clinic provisioning, data boundaries
- **AI Voice Receptionist** — Answer calls, book appointments, queue status, smart escalation, after-hours
- **Appointment Management** — CRUD, consultation slots, multi-doctor scheduling, buffer time
- **Queue Management** — Real-time queue, wait times, no-show detection, priority rules
- **Multi-Clinic Management** — Branches, timings, doctor assignments, automatic routing
- **Patient Registration** — AI phone, QR code, invite link, manual entry
- **Patient Portal** — Appointments, history, prescriptions, invoices, payments, queue tracking, search
- **Digital Prescriptions** — Doctor generates Rx, e-signature, WhatsApp delivery, print-friendly
- **Billing & Online Payments** — Invoices, Razorpay/UPI, receipts, payment reminders
- **WhatsApp Notifications** — Appointment confirmations, queue updates, payment reminders, Rx delivery
- **Notification Engine** — WhatsApp (primary), SMS (fallback), push, email
- **Compliance Module** — DPDPA consent capture, audit logs, data export

### Phase 2 — Growth ("Better Than Manual")
- **WhatsApp Chatbot** — Full conversational AI: book, cancel, queue, pay, prescriptions
- **Telemedicine** — Video consultation (Jitsi/Daily/Twilio integration)
- **Waitlist Manager** — Auto-fill cancelled slots, priority ordering
- **Patient Feedback & NPS** — Post-visit surveys, Google Review prompts
- **Multi-Language (i18n)** — Hindi + regional languages
- **Medication Reminders** — Push + WhatsApp adherence reminders
- **Clinic Analytics Dashboard** — Revenue, no-shows, utilization, satisfaction, benchmarking
- **Automated Follow-Ups** — SMS reminders, AI follow-up calls, recurring appointments

### Phase 3 — Scale ("Why Clinics Pay Premium")
- **AI Triage Bot** — Pre-booking symptom assessment, urgency classification
- **Family Health Hub** — Multi-member profiles, shared calendar, unified billing
- **Digital Health Card** — QR-based patient ID, wallet integration
- **Lab/Test Integration** — Test ordering, result delivery
- **Campaign Engine** — Health campaigns, re-engagement, birthday wishes
- **Referral Manager** — Doctor-to-specialist referrals with tracking
- **Staff Scheduling** — Shift management, attendance tracking

### Phase 4 — Moat ("Can't Switch Away")
- **AI Clinical Notes** — Ambient documentation from consultation
- **Clinic Marketplace** — Patient discovery, online booking, ratings
- **Insurance Integration** — Verification, pre-auth, claims (partner model)
- **Enterprise Features** — SSO, advanced audit, SLA

## User Roles

| Role              | Access                                                                        |
|-------------------|-------------------------------------------------------------------------------|
| Super Admin       | Platform management, clinic onboarding, global settings, compliance           |
| Clinic Owner      | Full clinic config, staff management, billing, analytics, AI settings         |
| Doctor            | Manage patients, consultations, prescriptions, follow-ups, view analytics     |
| Clinic Staff      | Register patients, schedule appointments, manage queue, billing               |
| Nurse             | Patient intake, vitals, queue management, prescription assistance             |
| Receptionist      | Phone/WhatsApp handling, appointment booking, patient check-in                |
| Patient           | Book appointments, view records, track queue, pay bills, family management    |
| Caregiver         | Manage family members' appointments and records (delegated access)            |

## Scope by Phase

### Phase 1 (MVP+): Multi-tenant system, appointments, queue, AI voice, doctor dashboard, patient portal, billing + payments, digital prescriptions, WhatsApp notifications, RBAC, compliance
### Phase 2 (Growth): WhatsApp chatbot, telemedicine, waitlist, feedback/NPS, i18n, medication reminders, clinic analytics
### Phase 3 (Scale): AI triage, family profiles, digital health card, lab integration, campaigns, referrals, staff scheduling
### Phase 4 (Moat): AI clinical notes, marketplace, insurance, enterprise features

## Architecture Model

Multi-tenant — each clinic is an independent tenant with isolated data:
```
Platform
 ├─ Clinic Tenant A (Doctors, Staff, Patients, Appointments, Transactions)
 ├─ Clinic Tenant B (Doctors, Staff, Patients, Appointments)
 └─ ...
```

## Security & Compliance

- Tenant-level data isolation
- Encrypted patient data
- Secure authentication
- Audit logging
- Healthcare data protection compliance

## Non-Functional Requirements

- 99.9% uptime target
- High concurrent call support
- Scalable to thousands of clinics
- Encrypted data and secure APIs

## Autonomy Level
**Level 3 — Full Auto** (only pause for blockers or completion)

## Branch Guard
**Expected branch**: main

## Development Rules

- Follow all directives in the global `~/.claude/CLAUDE.md`
- Update living docs with every code change
- Run Pre-Commit Gate before every commit
- No destructive actions without user approval

## GSD-T Workflow
This project uses contract-driven development.
- State: `.gsd-t/progress.md`
- Contracts: `.gsd-t/contracts/`
- Domains: `.gsd-t/domains/`
- Backlog: `.gsd-t/backlog.md`
- Backlog Settings: `.gsd-t/backlog-settings.md`

## Living Documents

| Document       | Location                   | Purpose                              |
|----------------|----------------------------|--------------------------------------|
| Requirements   | `docs/requirements.md`     | Functional and technical requirements|
| Architecture   | `docs/architecture.md`     | System design, components, data flow |
| Workflows      | `docs/workflows.md`        | User journeys and process flows      |
| Infrastructure | `docs/infrastructure.md`   | Commands, DB setup, server access    |
| README         | `README.md`                | Project overview, setup, features    |
| Progress       | `.gsd-t/progress.md`       | Milestone/phase state + version      |
| Contracts      | `.gsd-t/contracts/`        | Domain interfaces                    |
| Tech Debt      | `.gsd-t/techdebt.md`       | Debt register from scans             |

## Commands Quick Reference

```
/gsd          — Smart router (describe what you need)
/gsd-t-status — See current progress
/gsd-t-resume — Continue from last state
```
