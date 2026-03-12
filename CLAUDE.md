# CliniqAI — AI Clinic Management & Patient Communication Platform

## Project Overview

Multi-tenant AI-powered clinic management SaaS platform. Doctors and clinics automate patient communication, appointment scheduling, queue management, and follow-ups using voice AI and intelligent automation. Each clinic operates as an independent tenant with fully isolated data.

## Tech Stack

> **Not yet decided.** Update this section once technology choices are made.

## Project Structure

> **Not yet initialized.** Update as the codebase takes shape.

## Core Modules

- **AI Voice Receptionist** — Answer calls, book appointments, provide availability/queue status
- **Appointment Management** — CRUD appointments, consultation slots, multi-doctor scheduling
- **Queue Management** — Real-time queue length, wait time, position, doctor availability
- **Multi-Clinic Management** — Branches, timings, doctor assignments, automatic routing
- **Patient Registration** — AI phone, QR code, invite link, manual entry
- **Patient Portal** — Appointments, history, prescriptions, invoices, payments, queue tracking
- **Billing & Transactions** — Invoices, payments, receipts, history
- **Automated Follow-Ups** — SMS reminders, AI follow-up calls, appointment suggestions
- **AI Symptom Intake** — Pre-consultation symptom capture, structured doctor summary
- **AI Doctor Assistant** — Diagnosis suggestions, recommendations (not final diagnosis)

## User Roles

| Role         | Access                                                    |
|--------------|-----------------------------------------------------------|
| Doctor       | Manage clinics, patient records, configure follow-ups     |
| Clinic Staff | Register patients, schedule appointments, manage queue    |
| Patient      | Book appointments, view records, track queue, transactions|

## MVP Scope

1. Multi-tenant clinic system
2. Appointment management
3. Queue tracking
4. AI call booking
5. Doctor dashboard
6. Patient portal
7. Billing system

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
