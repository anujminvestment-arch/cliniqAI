# Architecture — CliniqAI

## System Overview

Multi-tenant SaaS platform for AI-powered clinic management. Each clinic is an independent tenant with fully isolated data.

## Architecture Model

```
Platform
 ├─ Clinic Tenant A
 │   ├ Doctors
 │   ├ Staff
 │   ├ Patients
 │   ├ Appointments
 │   └ Transactions
 │
 ├─ Clinic Tenant B
 │   ├ Doctors
 │   ├ Staff
 │   ├ Patients
 │   └ Appointments
 └─ ...
```

## Tech Stack

> **Not yet decided.** Update this section once technology choices are made.

## Components

> To be defined during milestone partition phase.

## Data Flow

> To be defined during milestone partition phase.

## Design Decisions

| Date       | Decision                          | Rationale                         |
|------------|-----------------------------------|-----------------------------------|
| 2026-03-12 | Multi-tenant with data isolation  | Per PRD — each clinic independent |
| 2026-03-12 | SaaS subscription model           | Per PRD — Basic/Pro/Enterprise    |
