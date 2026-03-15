# CliniqAI — Complete Technology Stack, Tools & System Design

> Single reference document covering every tool, library, service, and engineering decision for the CliniqAI platform. Covers: backend, frontend, AI voice calling, phone number management, embeddings, OCR, chat, payments, storage, auth, real-time, and system design.

---

## Table of Contents

1. [Final Tech Stack (Quick Reference)](#1-final-tech-stack-quick-reference)
2. [Frontend Stack](#2-frontend-stack)
3. [Backend Stack](#3-backend-stack)
4. [Database & ORM](#4-database--orm)
5. [Authentication & Multi-Tenant RBAC](#5-authentication--multi-tenant-rbac)
6. [AI Voice Calling — Complete System](#6-ai-voice-calling--complete-system)
7. [Phone Number Management](#7-phone-number-management)
8. [WhatsApp Integration](#8-whatsapp-integration)
9. [SMS Notifications](#9-sms-notifications)
10. [AI Chat & RAG System](#10-ai-chat--rag-system)
11. [Embedding Models & Vector Storage](#11-embedding-models--vector-storage)
12. [OCR — Prescriptions & Lab Reports](#12-ocr--prescriptions--lab-reports)
13. [LLM Selection (Claude vs OpenAI vs Gemini)](#13-llm-selection)
14. [Payment Gateway](#14-payment-gateway)
15. [File Storage](#15-file-storage)
16. [Real-Time Communication](#16-real-time-communication)
17. [Video Consultation (Telemedicine)](#17-video-consultation-telemedicine)
18. [Rate Limiting & Security](#18-rate-limiting--security)
19. [Monitoring & Analytics](#19-monitoring--analytics)
20. [End-to-End System Design](#20-end-to-end-system-design)
21. [Knowledge Base System](#21-knowledge-base-system)
22. [Conversation Storage & Queue Architecture](#22-conversation-storage--queue-architecture)
23. [Cost Estimation](#23-cost-estimation)

---

## 1. Final Tech Stack (Quick Reference)

| Layer | Tool | Why This One | Monthly Cost |
|-------|------|-------------|-------------|
| **Frontend** | Next.js 15 (App Router) + TypeScript | SSR, server actions, streaming | Free |
| **UI** | Tailwind CSS + shadcn/ui | Already set up, composable | Free |
| **Backend API** | tRPC + Zod (internal) / REST (external) | End-to-end type safety | Free |
| **ORM** | Drizzle ORM | Fastest cold starts, SQL control, edge-ready | Free |
| **Database** | Self-hosted PostgreSQL (local/VPS) | Full control, no vendor dependency, free | Rs 500-2K/mo (VPS) |
| **Vector DB** | pgvector (PostgreSQL extension) | Same DB, no extra service | Free |
| **Auth** | Passport.js (JWT + social login) | Full control, local + Google/Facebook login | Free |
| **AI Voice** | Bolna.ai (orchestration) + Exotel (telephony) | Indian languages, Hinglish, +91 numbers | Rs 10K-20K/mo |
| **LLM** | Claude API (primary) via Vercel AI SDK v6 | Best medical reasoning, 1M context | Per-token |
| **Embeddings** | OpenAI text-embedding-3-small | $0.02/MTok, good accuracy | ~$5-10/mo |
| **OCR** | Google Cloud Vision + Claude Vision | Best handwriting + contextual understanding | ~$5-15/mo |
| **WhatsApp** | Gupshup or WATI (WhatsApp Business API) | India BSPs, chatbot support | Rs 2,500+/mo |
| **SMS** | Exotel SMS (included) or MSG91 | DLT compliant, cheap in India | Rs 500-2K/mo |
| **Payments** | Razorpay | UPI, cards, subscriptions, best Indian DX | 2% per txn |
| **File Storage** | Cloudflare R2 (primary) + local disk (dev) | Zero egress fees, cheap | $0-10/mo |
| **Real-Time** | SSE (AI streaming) + WebSocket via Socket.io | Queue updates, chat, notifications | Free |
| **Video** | Jitsi Meet (self-hosted) or Daily.co | Free/cheap video consultation | Free-$99/mo |
| **Rate Limiting** | express-rate-limit + Redis | Simple, self-hosted | Free |
| **Knowledge Base** | PostgreSQL + pgvector + Redis cache | Structured + semantic + cached | Free |
| **Message Queue** | BullMQ (on Redis) | Conversation ingestion, background jobs | Free |
| **Caching** | Self-hosted Redis | Session, cache, queue, rate limiting | Free |
| **Monitoring** | Sentry (errors) | Error tracking, performance | Free tier |
| **Hosting** | Vercel (frontend) + VPS (backend + DB) | Next.js optimized + full backend control | Rs 2K-5K/mo |

**Total estimated MVP cost: Rs 10,000-25,000/month (~$120-300)**

> **Key decision: NO Supabase dependency.** Everything runs on your own backend.
> Auth, database, realtime, storage — all self-managed for full control and lower cost.

---

## 2. Frontend Stack

### Next.js 15 App Router

```
src/
├── app/
│   ├── (auth)/           # Login, Register (public routes)
│   ├── admin/            # Super Admin portal
│   ├── clinic/           # Clinic Owner + Doctor + Staff portal
│   ├── patient/          # Patient portal
│   ├── api/              # REST endpoints (webhooks, external)
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # shadcn/ui primitives
│   └── shared/           # Reusable domain components
├── lib/                  # Utilities, API clients
├── server/               # tRPC routers, server-only code
└── types/                # TypeScript interfaces
```

**Key patterns:**
- **Server Actions** (`'use server'`) for internal mutations (form submits, data writes)
- **Route Handlers** (`route.ts`) for webhooks (Razorpay, WhatsApp, Exotel) and external APIs
- **Middleware** (`middleware.ts`) for auth gates, tenant routing, rate limiting
- **Streaming** via React Suspense for AI chat responses
- **`after()` API** for post-response work (analytics, logging, embedding generation)

### UI Components

| Library | Purpose |
|---------|---------|
| **shadcn/ui** | Base component library (already installed — button, card, table, dialog, etc.) |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Charts for analytics dashboards (already installed) |
| **Lucide React** | Icons |
| **React Hook Form** | Form handling with Zod validation |
| **next-intl** | i18n — Hindi + regional languages (Phase 2) |
| **Sonner** | Toast notifications |

---

## 3. Backend Stack

### tRPC + Zod (Internal APIs)

Use tRPC for all frontend ↔ backend communication. Full end-to-end type safety with zero code generation.

```
src/server/
├── trpc.ts               # tRPC initialization with context
├── routers/
│   ├── appointment.ts    # Appointment CRUD
│   ├── patient.ts        # Patient management
│   ├── queue.ts          # Queue operations
│   ├── prescription.ts   # Prescription management
│   ├── billing.ts        # Invoice + payment
│   ├── doctor.ts         # Doctor profiles, schedules
│   ├── clinic.ts         # Clinic settings, branches
│   ├── chat.ts           # AI chat + direct messages
│   ├── analytics.ts      # Dashboard data
│   └── ai.ts             # AI voice, OCR, embeddings
└── root.ts               # Merge all routers
```

**Pattern:**
```typescript
// Server: src/server/routers/appointment.ts
export const appointmentRouter = router({
  getByDate: protectedProcedure
    .input(z.object({ date: z.string().date(), doctorId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      // ctx.clinicId from auth — automatic tenant isolation
      return db.select().from(appointments)
        .where(and(
          eq(appointments.clinicId, ctx.clinicId),
          eq(appointments.date, input.date),
          input.doctorId ? eq(appointments.doctorId, input.doctorId) : undefined
        ));
    }),

  book: protectedProcedure
    .input(bookAppointmentSchema) // Zod schema
    .mutation(async ({ input, ctx }) => { /* ... */ }),
});

// Client: automatic type inference, zero codegen
const { data } = trpc.appointment.getByDate.useQuery({ date: '2026-03-15' });
// data is fully typed: Appointment[]
```

### REST Endpoints (External / Webhooks)

Use Next.js Route Handlers for anything external services call:

```
src/app/api/
├── webhooks/
│   ├── razorpay/route.ts     # Payment confirmation webhooks
│   ├── whatsapp/route.ts     # WhatsApp message webhooks
│   ├── exotel/route.ts       # Call status webhooks
│   └── bolna/route.ts        # AI voice call completion
├── voice/
│   └── [clinicId]/route.ts   # AI voice agent endpoint per clinic
└── public/
    └── clinics/route.ts      # Public clinic listing
```

### Validation with Zod

Single source of truth — define schema once, use everywhere:

```typescript
// src/types/appointment.ts
export const bookAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  patientId: z.string().uuid(),
  date: z.string().date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.enum(['consultation', 'follow_up', 'procedure', 'emergency']),
  symptoms: z.string().max(2000).optional(),
  bookingSource: z.enum(['portal', 'ai_call', 'whatsapp', 'walk_in', 'staff']),
});

// TypeScript type inferred automatically
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;

// Used in tRPC router, Server Actions, and client-side React Hook Form
```

---

## 4. Database & ORM

### Self-Hosted PostgreSQL + pgvector (NO Supabase)

> **Decision: Everything runs on your own PostgreSQL.** No Supabase dependency. Auth, database, storage, realtime — all self-managed.

### Setup

```bash
# PostgreSQL (already installed locally)
# Add pgvector extension:
sudo apt install postgresql-16-pgvector   # Ubuntu/Debian
# OR from source:
git clone https://github.com/pgvector/pgvector.git
cd pgvector && make && sudo make install

# Enable in your database:
psql -d cliniqai -c "CREATE EXTENSION vector;"

# Connection pooling (for production):
sudo apt install pgbouncer
# Configure pgbouncer.ini with your connection details
```

### Why Drizzle ORM (not Prisma)

| Factor | Drizzle | Prisma |
|--------|---------|--------|
| Cold start | ~50-100ms | ~80-150ms |
| Bundle size | Dramatically smaller | Larger (even after Prisma 7 dropped Rust engine) |
| Edge runtime | Native support | Limited |
| SQL control | Full — write SQL-like queries | Abstracted — less control |
| Migrations | `drizzle-kit` — lightweight | `prisma migrate` — heavier |
| PostgreSQL fit | Excellent — raw SQL when needed | Good |

### Multi-Tenant Isolation (Application-Level, No RLS)

Since we're NOT using Supabase RLS, we enforce tenant isolation in the **application layer** via Drizzle ORM:

```typescript
// Every query MUST include clinicId filter
// This is enforced by a helper function — never query without it

function forClinic(clinicId: string) {
  return eq(schema.clinicId, clinicId);
}

// SAFE: Always scoped to tenant
const appointments = await db.select()
  .from(appointmentsTable)
  .where(and(
    forClinic(ctx.clinicId),  // from JWT payload
    eq(appointmentsTable.date, today)
  ));

// UNSAFE: This pattern is NEVER allowed in code review
// const all = await db.select().from(appointmentsTable); // ❌ NO clinicId filter!
```

**Safeguards:**
- Custom Drizzle middleware that logs warnings if any query runs without `clinic_id` filter
- ESLint rule to flag `.select().from()` without `.where(forClinic())`
- Code review checklist: every DB query must include tenant scoping

### Production Infrastructure

```
LOCAL DEVELOPMENT:
  PostgreSQL on your machine (already installed)
  Redis on your machine (for cache + BullMQ)
  → Free

PRODUCTION (VPS):
  Option A: DigitalOcean Droplet
    $12/mo (2GB RAM, 1 vCPU) — PostgreSQL + Redis + pgvector
    $24/mo (4GB RAM, 2 vCPU) — for more clinics

  Option B: Hetzner Cloud
    €4.85/mo (2GB RAM, 2 vCPU) — cheapest reliable VPS
    €8.85/mo (4GB RAM, 2 vCPU)

  Option C: Railway.app
    $5/mo — managed PostgreSQL (includes pgvector)
    No server management needed

BACKUPS:
  pg_dump via cron job → upload to Cloudflare R2
  # Daily backup at 2 AM
  0 2 * * * pg_dump cliniqai | gzip > /backups/cliniqai_$(date +%Y%m%d).sql.gz
  # Upload to R2 (using rclone)
  0 3 * * * rclone copy /backups/ r2:cliniqai-backups/
```

---

## 5. Authentication & Multi-Tenant RBAC

### Chosen: Passport.js (JWT + Social Login) — Self-Hosted, Full Control

> **Decision: NO Supabase Auth, NO Clerk, NO Better Auth.** Auth is fully managed on our own backend using Passport.js with JWT tokens and social login strategies.

### Why Passport.js

| Factor | Why It Fits |
|--------|-----------|
| **Full control** | Auth logic lives in YOUR codebase, not a third-party |
| **JWT tokens** | Stateless auth, works with Next.js middleware + API routes |
| **Social login** | passport-google-oauth20, passport-facebook — plug-and-play |
| **Local login** | passport-local with bcrypt password hashing |
| **Free** | Open source, no per-MAU charges ever |
| **No vendor lock-in** | Switch providers or add new ones without migration |
| **Proven** | 50K+ GitHub stars, battle-tested in production |

### Auth Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTH SYSTEM (Self-Hosted)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Libraries:                                                     │
│  ├── passport             — auth middleware                     │
│  ├── passport-local       — email + password login              │
│  ├── passport-google-oauth20 — Google social login              │
│  ├── passport-facebook    — Facebook social login (optional)    │
│  ├── jsonwebtoken (jwt)   — JWT token generation + verification │
│  ├── bcryptjs             — password hashing (12 salt rounds)   │
│  ├── cookie-parser        — secure HTTP-only cookie handling    │
│  └── zod                  — input validation                    │
│                                                                 │
│  Token Strategy:                                                │
│  ├── Access Token:  JWT, 15 min expiry, stored in HTTP-only     │
│  │                  cookie (not localStorage — XSS safe)        │
│  ├── Refresh Token: UUID, 30 day expiry, stored in DB +         │
│  │                  HTTP-only cookie, rotated on use             │
│  └── JWT Payload:                                               │
│      {                                                          │
│        "userId": "uuid",                                        │
│        "clinicId": "uuid",     // current tenant                │
│        "role": "doctor",       // role in this clinic           │
│        "email": "dr@clinic.com",                                │
│        "iat": 1710500000,                                       │
│        "exp": 1710500900       // 15 min                        │
│      }                                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Database Tables for Auth

```sql
-- Users (all users across the platform)
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255),                   -- NULL for social-only users
  name            VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  avatar_url      TEXT,
  email_verified  BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,

  -- Social login providers
  google_id       VARCHAR(255) UNIQUE,
  facebook_id     VARCHAR(255) UNIQUE,

  -- Platform role (super_admin or regular user)
  platform_role   VARCHAR(50) DEFAULT 'user',     -- 'super_admin', 'user'

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google ON users(google_id) WHERE google_id IS NOT NULL;

-- Clinic memberships (user's role in each clinic — multi-tenant)
CREATE TABLE clinic_memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  role            VARCHAR(50) NOT NULL,           -- 'clinic_owner', 'doctor', 'nurse', 'receptionist', 'staff'
  is_active       BOOLEAN DEFAULT true,
  invited_by      UUID REFERENCES users(id),
  joined_at       TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, clinic_id)                      -- one role per user per clinic
);

CREATE INDEX idx_memberships_user ON clinic_memberships(user_id);
CREATE INDEX idx_memberships_clinic ON clinic_memberships(clinic_id);

-- Patient accounts (separate from staff users)
CREATE TABLE patient_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),       -- NULL if registered via AI call (no login yet)
  patient_id      UUID NOT NULL REFERENCES patients(id),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  created_at      TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, clinic_id)
);

-- Refresh tokens (stored in DB for revocation)
CREATE TABLE refresh_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  token_hash      VARCHAR(255) NOT NULL,           -- SHA256 of token (never store raw)
  device_info     VARCHAR(500),                    -- "Chrome on Windows"
  ip_address      INET,
  expires_at      TIMESTAMPTZ NOT NULL,
  is_revoked      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_refresh_user ON refresh_tokens(user_id, is_revoked);

-- Password reset tokens
CREATE TABLE password_resets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  token_hash      VARCHAR(255) NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,            -- 1 hour expiry
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Login Flows

```
FLOW 1: LOCAL LOGIN (Email + Password)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User enters email + password on /login
        │
        ▼
POST /api/auth/login
  → Zod validates input
  → passport-local strategy:
    1. Find user by email in users table
    2. bcrypt.compare(password, password_hash)
    3. If match:
       a. Generate JWT access token (15 min)
       b. Generate refresh token UUID → hash → store in DB
       c. Set both as HTTP-only, Secure, SameSite cookies
       d. Return user + clinic memberships
    4. If no match → 401 Unauthorized


FLOW 2: GOOGLE SOCIAL LOGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━

User clicks "Sign in with Google" on /login
        │
        ▼
GET /api/auth/google
  → Redirects to Google OAuth consent screen
        │
        ▼
Google redirects back to /api/auth/google/callback
  → passport-google-oauth20 strategy:
    1. Receive google profile (id, email, name, avatar)
    2. Check: does user with this google_id exist?
       YES → login (generate JWT + refresh token)
       NO → check: does user with this email exist?
            YES → link google_id to existing user → login
            NO → create new user → login
    3. Set cookies, redirect to dashboard


FLOW 3: TOKEN REFRESH
━━━━━━━━━━━━━━━━━━━━━

Access token expired (15 min)
        │
        ▼
POST /api/auth/refresh
  → Read refresh token from HTTP-only cookie
  → Hash it → find in refresh_tokens table
  → Check: not revoked? not expired?
    YES → generate new access token + new refresh token
          (rotate: old refresh token revoked)
    NO → 401 → redirect to /login


FLOW 4: CLINIC SWITCHING (Multi-Tenant)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Doctor works at 3 clinics. Currently viewing Clinic A.
Clicks "Switch to Clinic B" in sidebar.
        │
        ▼
POST /api/auth/switch-clinic
  Body: { clinicId: "clinic-b-uuid" }
  → Check clinic_memberships: does user have role in Clinic B?
    YES → generate new JWT with clinicId = "clinic-b",
          role = user's role in Clinic B
    NO → 403 Forbidden
```

### Clinic Onboarding Flow

```
NEW CLINIC ONBOARDING (/admin/onboarding or /register)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: OWNER REGISTRATION
  ┌──────────────────────────────────────────┐
  │  Create Your Account                     │
  │                                          │
  │  Name:     [Dr. Rajesh Sharma         ]  │
  │  Email:    [dr.sharma@gmail.com       ]  │
  │  Password: [••••••••••                ]  │
  │  Phone:    [+91-98765-43210           ]  │
  │                                          │
  │  ── OR ──                                │
  │  [🔵 Sign up with Google]                │
  │                                          │
  │  [Next →]                                │
  └──────────────────────────────────────────┘
        │
        ▼
Step 2: CLINIC DETAILS
  ┌──────────────────────────────────────────┐
  │  Tell Us About Your Clinic               │
  │                                          │
  │  Clinic Name:  [City Dental Clinic    ]  │
  │  Speciality:   [Dental              ▼]  │
  │  Address:      [MG Road, Bangalore    ]  │
  │  City:         [Bangalore           ▼]  │
  │  Pincode:      [560034                ]  │
  │  Phone:        [+91-80-XXXX-XXXX      ]  │
  │                                          │
  │  Timings:                                │
  │  Mon-Fri: [10:00 AM] to [06:00 PM]      │
  │  Saturday: [10:00 AM] to [02:00 PM]     │
  │  Sunday:   [Closed                    ]  │
  │                                          │
  │  [← Back]  [Next →]                     │
  └──────────────────────────────────────────┘
        │
        ▼
Step 3: ADD DOCTORS
  ┌──────────────────────────────────────────┐
  │  Add Your Doctors                        │
  │                                          │
  │  Doctor 1 (You):                         │
  │  Name:          [Dr. Rajesh Sharma    ]  │
  │  Specialization:[Dentist            ▼]  │
  │  Qualification: [MBBS, MDS            ]  │
  │  Fee:           [Rs 500               ]  │
  │  Experience:    [12 years             ]  │
  │                                          │
  │  [+ Add Another Doctor]                  │
  │                                          │
  │  Doctor 2:                               │
  │  Name:          [Dr. Priya Mehta      ]  │
  │  Email:         [priya@gmail.com      ]  │
  │  Specialization:[Dentist            ▼]  │
  │  Fee:           [Rs 300               ]  │
  │  → Email invite will be sent             │
  │                                          │
  │  [← Back]  [Next →]                     │
  └──────────────────────────────────────────┘
        │
        ▼
Step 4: AI CONFIGURATION
  ┌──────────────────────────────────────────┐
  │  Configure Your AI Receptionist          │
  │                                          │
  │  Greeting Language:  [Hindi + English ▼] │
  │  Greeting Message:                       │
  │  [Namaste! Welcome to City Dental Clinic.│
  │   Main aapki kya madad kar sakta hoon?]  │
  │                                          │
  │  After-hours Message:                    │
  │  [Clinic abhi band hai. Kal subah 10     │
  │   baje se appointment book kar sakte hain]│
  │                                          │
  │  Emergency Number: [+91-98765-43210   ]  │
  │                                          │
  │  [← Back]  [Launch Clinic 🚀]           │
  └──────────────────────────────────────────┘
        │
        ▼
BACKEND PROCESSES ON SUBMIT:
  1. Create user (users table)
  2. Create clinic (clinics table)
  3. Create clinic_membership (role: 'clinic_owner')
  4. Create doctor records for each doctor entered
  5. Send email invites to additional doctors
     (invite link → /register?invite=TOKEN&clinic=UUID)
  6. Build system prompt from clinic details → cache in Redis
  7. Seed default knowledge base entries (FAQs, common symptoms)
  8. Provision Exotel virtual number (async via BullMQ)
  9. Redirect to clinic dashboard → "Your clinic is live! 🎉"
```

### Next.js Middleware for Auth

```typescript
// middleware.ts — runs BEFORE every request
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/api/auth', '/api/webhooks'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => path.startsWith(p))) return NextResponse.next();

  // Get JWT from cookie
  const token = req.cookies.get('access_token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));

    // Enforce portal access by role
    if (path.startsWith('/admin') && payload.platform_role !== 'super_admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (path.startsWith('/clinic') && !['clinic_owner', 'doctor', 'staff', 'nurse', 'receptionist'].includes(payload.role as string)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (path.startsWith('/patient') && payload.role !== 'patient') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Add user info to headers (accessible in server components)
    const headers = new Headers(req.headers);
    headers.set('x-user-id', payload.userId as string);
    headers.set('x-clinic-id', payload.clinicId as string);
    headers.set('x-user-role', payload.role as string);

    return NextResponse.next({ headers });
  } catch {
    // Token expired or invalid → try refresh
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
```

### Role Hierarchy

```
Super Admin (platform-level)
  └── Can manage all clinics, onboarding, compliance

Clinic Owner (tenant-level)
  └── Full clinic config, staff management, billing, analytics

Doctor (tenant-level)
  └── Patients, consultations, prescriptions, follow-ups

Nurse (tenant-level)
  └── Patient intake, vitals, queue, prescription assistance

Receptionist (tenant-level)
  └── Phone/WhatsApp handling, booking, check-in

Clinic Staff (tenant-level)
  └── Register patients, schedule, queue, billing

Patient (cross-tenant)
  └── Book, view records, track queue, pay bills

Caregiver (cross-tenant, delegated)
  └── Manage family members' appointments and records
```

---

## 6. AI Voice Calling — Complete System

### Why NOT US-Based Platforms (Retell.ai, Vapi.ai, Bland.ai)

| Problem | Impact for CliniqAI |
|---------|-------------------|
| **Cannot provision +91 Indian numbers** | Twilio (their telephony layer) is blocked in India by TRAI/DLT regulations |
| **No Hinglish support** | Indians code-switch mid-sentence ("Mujhe appointment book karna hai for tomorrow") — US platforms treat each language separately |
| **High latency in India** | Vapi: 1,450ms+ per turn; Retell: 600ms+. Unusable for natural conversation |
| **Expensive** | Vapi: $0.07-0.25/min + $1,000/mo HIPAA. Retell: $0.07+/min. vs Rs 3-7/min for Indian platforms |
| **No DLT/TRAI compliance** | Required for all business calls in India since 2021 |

### Recommended: Bolna.ai (Voice AI) + Exotel (Telephony)

#### Bolna.ai — Voice AI Orchestration

| Feature | Detail |
|---------|--------|
| **What it does** | Orchestrates STT + LLM + TTS pipeline for voice conversations |
| **Indian languages** | 10+ languages: Hindi, Tamil, Telugu, Bengali, Marathi + Hinglish code-switching |
| **Latency** | <300ms response time with interruption handling |
| **Telephony** | Integrates with Exotel, Plivo, Twilio via WebSocket/SIP |
| **LLM support** | OpenAI, Claude, DeepSeek, Llama, Mistral — bring any LLM |
| **TTS providers** | AWS Polly, ElevenLabs, Deepgram, Cartesia, Smallest AI |
| **STT providers** | Deepgram, Azure, Sarvam AI |
| **Call transfer** | Transfer to human agent mid-call |
| **API integration** | Call external APIs during live conversation (book appointment, check queue) |
| **Scale** | 200,000+ calls/day, 1,050+ paying customers |
| **Open source** | Core framework is open source (github.com/bolna-ai/bolna) |
| **Pricing** | Platform: $0.02/min. All-in: Rs 3-7/min depending on volume |
| **Compliance** | Indian data protection (DPDPA). Y Combinator + General Catalyst backed |

#### Alternative: Sarvam AI Samvaad

| Feature | Detail |
|---------|--------|
| **What it does** | End-to-end conversational AI platform built for India |
| **Indian languages** | 22+ languages including all scheduled languages |
| **Latency** | <500ms |
| **Pricing** | Rs 1/min (starting) |
| **STT** | Rs 30/hour |
| **TTS** | Rs 15-30 per 10K characters |
| **Compliance** | Collaborating with UIDAI (Aadhaar), DPDPA compliant |

**Bolna vs Sarvam:**
- Bolna: More flexible (BYO LLM, open source), better documentation, more telephony integrations
- Sarvam: More languages (22 vs 10), cheaper base price, deeper Indian government integration
- **Recommendation:** Start with Bolna for flexibility, evaluate Sarvam for regional language expansion

#### Exotel — Indian Telephony

| Feature | Detail |
|---------|--------|
| **What it does** | Provides Indian virtual phone numbers (+91), call routing, IVR, SMS |
| **Numbers** | Virtual local, mobile, and toll-free numbers — fully DLT/TRAI compliant |
| **Integration** | RESTful APIs + WebSocket for real-time audio streaming (works with Bolna) |
| **SIP Trunking** | Virtual SIP (vSIP) for connecting to AI voice platforms |
| **Scale** | 200 calls/minute per API, 99.996% uptime SLA |
| **Pricing** | Starts at Rs 9,999 for 5 months (3 agents), 3 virtual numbers included |
| **SMS** | Included — DLT-compliant SMS delivery |

### How the AI Voice Call Works (Technical Flow)

```
STEP-BY-STEP CALL FLOW:

1. PATIENT DIALS CLINIC NUMBER (+91-XXX-XXXX)
   │
   │  Exotel receives the call on the clinic's virtual number
   │
   ▼
2. EXOTEL WEBHOOK → YOUR BACKEND
   │
   │  POST /api/webhooks/exotel
   │  Body: { from: "+91-patient-number", to: "+91-clinic-number", callSid: "..." }
   │
   │  Your backend:
   │  a. Looks up clinic by called number (to → clinic_id mapping)
   │  b. Loads clinic config: greeting, language, doctors, business hours
   │  c. Checks if caller is existing patient (phone → patient lookup)
   │  d. Creates Bolna agent session with clinic context
   │
   ▼
3. EXOTEL → BOLNA.AI (WebSocket / SIP)
   │
   │  Real-time audio stream from patient → Bolna
   │
   │  Bolna pipeline (all happening in real-time, <300ms):
   │  ┌────────────────────────────────────────────────────┐
   │  │                                                    │
   │  │  Patient speaks    "Mujhe appointment chahiye"     │
   │  │       │                                            │
   │  │       ▼                                            │
   │  │  STT (Deepgram/Sarvam)                             │
   │  │  → "Mujhe appointment chahiye"                     │
   │  │       │                                            │
   │  │       ▼                                            │
   │  │  LLM (Claude/GPT)                                  │
   │  │  System prompt includes:                           │
   │  │  - Clinic name, timings, doctors                   │
   │  │  - Patient history (if known)                      │
   │  │  - Available tools: book_appointment,              │
   │  │    check_queue, search_doctors,                    │
   │  │    register_patient, cancel_appointment            │
   │  │       │                                            │
   │  │       ▼                                            │
   │  │  LLM calls tool: search_doctors({                  │
   │  │    clinic_id: "xxx",                               │
   │  │    symptoms: "general appointment"                 │
   │  │  })                                                │
   │  │       │                                            │
   │  │       ▼                                            │
   │  │  YOUR API responds with doctor list,               │
   │  │  queue status, fees, available slots                │
   │  │       │                                            │
   │  │       ▼                                            │
   │  │  LLM generates response:                           │
   │  │  "City Clinic mein 2 doctor available hain:        │
   │  │   Dr. Sharma, consultation Rs 500,                 │
   │  │   3 patients waiting, token #4.                    │
   │  │   Dr. Priya, Rs 300, no waiting.                   │
   │  │   Aapko kaunse doctor chahiye?"                    │
   │  │       │                                            │
   │  │       ▼                                            │
   │  │  TTS (AWS Polly/ElevenLabs)                        │
   │  │  → Hindi audio response                            │
   │  │                                                    │
   │  └────────────────────────────────────────────────────┘
   │
   ▼
4. CONVERSATION CONTINUES (multi-turn)
   │
   │  Patient: "Dr. Sharma se book karo, 11 baje"
   │
   │  LLM calls tool: book_appointment({
   │    clinic_id: "xxx",
   │    doctor_id: "dr-sharma-id",
   │    patient_id: "patient-id",
   │    date: "2026-03-15",
   │    start_time: "11:00",
   │    symptoms: "general checkup",
   │    booking_source: "ai_call"
   │  })
   │
   │  YOUR API:
   │  a. Checks slot availability
   │  b. Creates appointment (APT-2026-XXXX)
   │  c. Assigns token number (#4)
   │  d. Creates queue entry
   │  e. Updates doctor_patient_relationships
   │  f. Returns confirmation data
   │
   ▼
5. AI CONFIRMS ON CALL
   │
   │  "Aapka appointment confirm ho gaya hai!
   │   Doctor: Dr. Sharma
   │   Date: 15 March, 11:00 AM
   │   Token Number: #4
   │   Fee: Rs 500
   │   Appointment Code: APT-2026-3847
   │   Aapko WhatsApp pe confirmation aa jayega."
   │
   ▼
6. POST-CALL ACTIONS (triggered by call completion webhook)
   │
   ├── Send WhatsApp confirmation (via Gupshup/WATI)
   │   "✅ Appointment Confirmed
   │    Dr. Sharma | 15 Mar 11:00 AM
   │    Token: #4 | Fee: Rs 500
   │    Code: APT-2026-3847"
   │
   ├── Send SMS confirmation (via Exotel)
   │   "Appointment confirmed with Dr. Sharma, 15 Mar 11AM. Token #4. Code: APT-2026-3847"
   │
   ├── Save call transcript to ai_voice_calls table
   │
   ├── Generate embedding from call transcript
   │
   └── Update analytics (call duration, outcome, language, sentiment)
```

### AI Voice Agent — Tool Definitions

These are the tools (functions) that the LLM can call during a live voice conversation:

```typescript
// Tools available to the AI voice agent during calls

const voiceAgentTools = {
  // Search doctors by symptoms → suggest best match
  search_doctors: {
    description: "Find doctors matching patient symptoms in this clinic",
    parameters: z.object({
      clinicId: z.string().uuid(),
      symptoms: z.string(),           // raw symptom text
      preferredLanguage: z.string().optional(),
    }),
    execute: async ({ clinicId, symptoms }) => {
      // 1. Map symptoms → specialization (DB lookup + AI fallback)
      // 2. Query matching doctors with live queue status
      // 3. Return ranked list with: name, specialization, fee, rating,
      //    queue_length, next_token, estimated_wait, next_available_slot
    }
  },

  // Book appointment
  book_appointment: {
    description: "Book an appointment for a patient",
    parameters: z.object({
      clinicId: z.string().uuid(),
      doctorId: z.string().uuid(),
      patientId: z.string().uuid(),
      date: z.string(),
      startTime: z.string(),
      symptoms: z.string().optional(),
    }),
    execute: async (input) => {
      // 1. Check slot availability (conflict detection)
      // 2. Create appointment record
      // 3. Assign token number
      // 4. Create queue entry
      // 5. Return: appointment_code, token_number, estimated_wait
    }
  },

  // Check queue status
  check_queue: {
    description: "Get current queue status for a doctor",
    parameters: z.object({
      clinicId: z.string().uuid(),
      doctorId: z.string().uuid().optional(),
      patientId: z.string().uuid().optional(),
    }),
    execute: async (input) => {
      // Return: queue_length, patient_position, estimated_wait, current_token
    }
  },

  // Register new patient
  register_patient: {
    description: "Register a new patient during the call",
    parameters: z.object({
      clinicId: z.string().uuid(),
      name: z.string(),
      phone: z.string(),
      dateOfBirth: z.string().optional(),
      gender: z.string().optional(),
    }),
    execute: async (input) => {
      // 1. Check if patient already exists (phone lookup)
      // 2. Create patient record
      // 3. Generate unique code: PAT-2026-XXXX
      // 4. Return: patient_id, unique_code
    }
  },

  // Cancel/Reschedule appointment
  cancel_appointment: {
    description: "Cancel or reschedule an existing appointment",
    parameters: z.object({
      appointmentCode: z.string().optional(),
      patientPhone: z.string().optional(),
      action: z.enum(['cancel', 'reschedule']),
      newDate: z.string().optional(),
      newTime: z.string().optional(),
    }),
    execute: async (input) => {
      // 1. Find appointment by code or patient phone
      // 2. Cancel or reschedule
      // 3. Update queue
      // 4. Notify waitlisted patients if slot opened
    }
  },

  // Get clinic info
  get_clinic_info: {
    description: "Get clinic timings, address, services",
    parameters: z.object({ clinicId: z.string().uuid() }),
    execute: async ({ clinicId }) => {
      // Return: name, address, timings, services, contact
    }
  },

  // Transfer to human
  transfer_to_human: {
    description: "Transfer call to human receptionist when AI cannot resolve",
    parameters: z.object({
      reason: z.string(),
      priority: z.enum(['normal', 'urgent', 'emergency']),
    }),
    execute: async (input) => {
      // 1. Find available human agent
      // 2. Prepare call summary for handoff
      // 3. Initiate warm transfer via Exotel
    }
  },
};
```

### Smart Doctor Suggestion — How Symptom Matching Works

```
Patient says: "Mere daat mein dard hai aur jabda sooj gaya hai"
(My tooth hurts and jaw is swollen)

              │
              ▼
┌─────────────────────────────────────────────────┐
│ LAYER 1: AI SYMPTOM EXTRACTION                   │
│                                                  │
│ STT output: "mere daat mein dard hai aur         │
│              jabda sooj gaya hai"                 │
│                                                  │
│ Claude/GPT extracts:                             │
│ {                                                │
│   "symptoms": ["tooth pain", "jaw swelling"],    │
│   "duration": "unknown",                         │
│   "severity": "moderate",                        │
│   "language": "hi"                               │
│ }                                                │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ LAYER 2: SYMPTOM → SPECIALIZATION               │
│                                                  │
│ Database lookup (fast, deterministic):           │
│                                                  │
│   "tooth pain"   → Dentist (priority 10)        │
│   "jaw swelling" → Oral Surgeon (priority 8)    │
│                    → Dentist (priority 7)        │
│                                                  │
│ Result: Dentist (score: 17) — best match         │
│                                                  │
│ If no DB match → Claude fallback:                │
│ "Given symptoms [X], which specialization from   │
│  [available at this clinic] is best?"            │
│                                                  │
│ Clinic can add CUSTOM mappings:                  │
│   "teeth whitening" → "Cosmetic Dentist"        │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ LAYER 3: RANK AVAILABLE DOCTORS                  │
│                                                  │
│ Query: All active dentists at this clinic         │
│                                                  │
│ For each, fetch LIVE data:                       │
│ - avg_rating, experience_years, consultation_fee │
│ - Current queue length (waiting patients)        │
│ - Next token number                              │
│ - Estimated wait time                            │
│ - Next available slot                            │
│                                                  │
│ Rank Score =                                     │
│   (rating × 20)         — quality first          │
│   + (experience × 2)    — experience bonus       │
│   - (queue_length × 5)  — shorter queue better   │
│   + (available_now ? 10 : 0)                     │
│                                                  │
│ ┌──────────┬──────┬─────┬──────┬─────┬──────┐   │
│ │ Doctor   │Rating│Exp  │Fee   │Queue│Token │   │
│ ├──────────┼──────┼─────┼──────┼─────┼──────┤   │
│ │Dr.Sharma │ 4.8  │12yr │Rs500 │3 pts│ #4   │   │
│ │Dr.Priya  │ 4.5  │ 6yr │Rs300 │1 pt │ #2   │   │
│ │Dr.Ravi   │ 4.2  │ 3yr │Rs200 │0 pts│ #1   │   │
│ └──────────┴──────┴─────┴──────┴─────┴──────┘   │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ LAYER 4: AI SPEAKS RESULTS                       │
│                                                  │
│ "Aapke symptoms ke hisaab se Dentist best rahega.│
│  Humare clinic mein 3 dentist available hain:    │
│                                                  │
│  1. Dr. Sharma — Senior Dentist                  │
│     Rating: 4.8 | 12 saal experience             │
│     Fee: Rs 500                                  │
│     Queue: 3 patient | Token #4 milega           │
│     Wait: lagbhag 25 minute                      │
│                                                  │
│  2. Dr. Priya — Dentist                          │
│     Rating: 4.5 | 6 saal experience              │
│     Fee: Rs 300                                  │
│     Queue: 1 patient | Token #2 milega           │
│     Wait: lagbhag 10 minute                      │
│                                                  │
│  3. Dr. Ravi — Dentist                           │
│     Fee: Rs 200 | Abhi koi waiting nahi!         │
│                                                  │
│  Aapko kaunse doctor chahiye?"                   │
└─────────────────────────────────────────────────┘
```

### After-Hours Call Handling

```
Call received outside business hours
              │
              ▼
AI checks clinic timings from settings
              │
              ├── "Namaste! City Dental Clinic abhi band hai.
              │    Humara timing Mon-Sat 10 AM se 6 PM hai.
              │    Main aapka kaam abhi bhi kar sakta hoon:"
              │
              ├── Option A: Book for next working day
              │   → AI shows available slots for next day
              │
              ├── Option B: Emergency
              │   → Transfer to doctor's emergency number
              │   → "Agar emergency hai, main aapko Dr. Sharma
              │      se directly connect kar deta hoon"
              │
              └── Option C: General info
                  → Provide timings, address, directions
```

---

## 7. Phone Number Management

### How to Assign Numbers to Clinics

```
CliniqAI Platform
    │
    ├── Exotel Account (Master)
    │   │
    │   ├── Virtual Number 1: +91-80-XXXX-1001 → Clinic A (City Dental)
    │   ├── Virtual Number 2: +91-80-XXXX-1002 → Clinic A (Branch 2)
    │   ├── Virtual Number 3: +91-22-XXXX-2001 → Clinic B (Mumbai Skin Care)
    │   ├── Virtual Number 4: +91-44-XXXX-3001 → Clinic C (Chennai ENT)
    │   └── ... (one number per clinic branch)
    │
    └── Number → Clinic Mapping Table

    clinic_phone_numbers:
    ┌──────────┬─────────────────┬──────────────┬─────────┐
    │clinic_id │phone_number     │number_type   │is_active│
    ├──────────┼─────────────────┼──────────────┼─────────┤
    │clinic-a  │+91-80-XXXX-1001│main          │true     │
    │clinic-a  │+91-80-XXXX-1002│branch        │true     │
    │clinic-b  │+91-22-XXXX-2001│main          │true     │
    │clinic-c  │+91-44-XXXX-3001│main          │true     │
    └──────────┴─────────────────┴──────────────┴─────────┘
```

### Dedicated Numbers for Doctors

```
Clinic A has 3 doctors:
    │
    ├── Main Clinic Number: +91-80-XXXX-1001
    │   → AI answers → suggests doctor based on symptoms
    │
    ├── Dr. Sharma Direct: +91-80-XXXX-1011
    │   → AI answers but pre-selects Dr. Sharma
    │   → "Welcome to Dr. Sharma's line. How can I help?"
    │
    ├── Dr. Priya Direct: +91-80-XXXX-1012
    │   → AI answers but pre-selects Dr. Priya
    │
    └── Emergency Number: +91-80-XXXX-1099
        → Forwards directly to doctor's personal phone
```

**Cost:** Rs 200-500/month per additional virtual number from Exotel.

### TRAI/DLT Compliance (Mandatory for India)

| Rule | Requirement |
|------|------------|
| **DLT Registration** | All businesses must register on telecom DLT portal |
| **Number series** | Promotional: 140-series. Service: 160-series |
| **AI disclosure** | Mandatory in 2026: "This call uses AI technology" |
| **Consent** | Must have patient consent before calling |
| **SMS templates** | All SMS templates must be pre-registered on DLT |
| **Call recording** | Must disclose within first 15 seconds |
| **Penalty** | Up to Rs 10 lakh for violations |

---

## 8. WhatsApp Integration

### WhatsApp Business API via BSP

| BSP | Pricing | Best For |
|-----|---------|---------|
| **Gupshup** | Custom (contact sales) | Full API, chatbot builder, bulk broadcasts |
| **WATI** | Rs 2,499/mo (Growth) to Rs 16,999/mo | Easy setup, 5K free automations/month |
| **Interakt** | Budget-friendly | Startups, small volume |

### What You Can Do via WhatsApp

```
NOTIFICATIONS (Template Messages — need Meta approval):
├── Appointment confirmation
├── Queue position updates ("You are #3, ~20 min wait")
├── "You are NEXT! Please proceed to Room 2"
├── Prescription PDF delivery
├── Invoice + UPI payment link
├── Follow-up reminders
├── Lab report delivery
└── Medicine reminders

CHATBOT (Session Messages — within 24hr window, Phase 2):
├── Book appointment → interactive list of doctors + slots
├── Cancel/reschedule → confirm + process
├── Check queue → show position + wait time
├── Pay → send Razorpay payment link
├── Prescription → send last Rx as PDF
├── Symptom intake → voice note → AI transcribes
└── Free text → NLU → route appropriately

WHATSAPP CALLING API (new July 2025):
├── VoIP calling within WhatsApp threads
├── Chat-to-call escalation
└── User-initiated calls: FREE (no Meta charges)
```

### Technical Integration Flow

```
SENDING (Your Server → WhatsApp):
  POST https://graph.facebook.com/v21.0/{phone_number_id}/messages
  {
    "messaging_product": "whatsapp",
    "to": "+91-patient-number",
    "type": "template",
    "template": {
      "name": "appointment_confirmation",
      "language": { "code": "hi" },
      "components": [{
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Dr. Sharma" },
          { "type": "text", "text": "15 March, 11:00 AM" },
          { "type": "text", "text": "APT-2026-3847" }
        ]
      }]
    }
  }

RECEIVING (WhatsApp → Your Server):
  POST /api/webhooks/whatsapp
  {
    "messages": [{
      "from": "91XXXXXXXXXX",
      "type": "text",
      "text": { "body": "Book appointment" }
    }]
  }
  → Parse intent → Execute → Reply
```

---

## 9. SMS Notifications

### Provider: Exotel SMS (included) or MSG91

| Feature | Exotel SMS | MSG91 |
|---------|-----------|-------|
| DLT compliant | Yes | Yes |
| Price per SMS | Included in Exotel plan | Rs 0.15-0.25/SMS |
| Indian languages | Unicode support | Unicode support |
| API | REST | REST |
| Use case | Transactional (OTP, confirmations) | Bulk + transactional |

**SMS is fallback** — primary channel is WhatsApp (95% open rate vs 20% for SMS).

SMS triggers:
- Appointment confirmation (if WhatsApp undelivered after 1 hour)
- OTP for login
- Emergency alerts
- Payment reminders (final attempt)

---

## 10. AI Chat & RAG System

### Architecture: Vercel AI SDK v6 + Claude + pgvector

```
PATIENT CHAT (RAG-powered):
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Patient: "3 mahine pehle mujhe kya dawai di thi?"  │
│  (What medicine was given to me 3 months ago?)       │
│                                                      │
│  Step 1: Embed the question                          │
│  → OpenAI text-embedding-3-small                     │
│  → 1536-dimension query vector                       │
│                                                      │
│  Step 2: Vector search (scoped to THIS patient)      │
│  SELECT content_text, source_type, metadata,         │
│    1 - (embedding <=> $query_vector) AS similarity   │
│  FROM embeddings                                     │
│  WHERE clinic_id = $clinic_id                        │
│    AND patient_id = $patient_id                      │
│  ORDER BY embedding <=> $query_vector                │
│  LIMIT 5;                                            │
│                                                      │
│  Step 3: Build prompt                                │
│  System: "You are CliniqAI assistant for {clinic}.   │
│   Answer using ONLY the provided medical records.    │
│   Always add disclaimer. Never make up information." │
│  Context: [top 5 relevant records]                   │
│  User: patient's question                            │
│                                                      │
│  Step 4: Claude streams response                     │
│  "Aapke records ke anusar, Dr. Patel ne aapko       │
│   15 January 2026 ko Amlodipine 5mg di thi          │
│   high blood pressure ke liye.                       │
│                                                      │
│   Note: Yeh medical advice nahi hai."                │
│                                                      │
└──────────────────────────────────────────────────────┘

DOCTOR CHAT (Tool-calling):
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Doctor: "Last 3 din mein kitne patients aaye?"      │
│                                                      │
│  AI SDK v6 Agent with tools:                         │
│  ├── query_appointments → SQL aggregation            │
│  ├── query_patient_details → patient history         │
│  ├── search_medical_knowledge → drug interactions    │
│  ├── query_revenue → billing stats                   │
│  └── search_patient_records → vector search          │
│                                                      │
│  Agent calls: query_appointments({                   │
│    doctorId: ctx.doctorId,                           │
│    dateRange: "last_3_days"                          │
│  })                                                  │
│                                                      │
│  Response:                                           │
│  "Last 3 din mein City Clinic mein:                  │
│   • 12 March: 18 patients (15 done, 2 no-show)      │
│   • 13 March: 22 patients (20 done, 2 cancelled)    │
│   • 14 March: 12 patients (8 done, 4 in queue)      │
│   Total: 52 patients. Revenue: Rs 78,000"            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Vercel AI SDK v6 — Key Features Used

```typescript
// src/lib/ai/patient-chat.ts
import { Agent, ToolLoopAgent } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const patientChatAgent = new ToolLoopAgent({
  model: anthropic('claude-sonnet-4-6'),
  instructions: `You are CliniqAI assistant for {{clinicName}}.
    Answer patient questions using ONLY the provided medical records.
    Always respond in the patient's language.
    Always add: "This is not medical advice."
    Never make up information.`,
  tools: {
    searchRecords,     // Vector search in pgvector
    getAppointments,   // SQL query
    getPrescriptions,  // SQL query
    getLabReports,     // SQL query
  },
  maxSteps: 5,         // Max tool calls before responding
});

// In the API route / Server Action:
const result = await patientChatAgent.run({
  messages: conversationHistory,
  context: { clinicId, patientId }, // Tenant + patient scoping
});
```

---

## 11. Embedding Models & Vector Storage

### Which Embedding Model

| Model | Dimensions | Cost | Best For |
|-------|-----------|------|---------|
| **OpenAI text-embedding-3-small** | 1536 | $0.02/MTok | General text — appointments, prescriptions, notes |
| **OpenAI text-embedding-3-large** | 3072 | $0.13/MTok | Higher accuracy when needed |
| **Cohere embed-v4** | 256-1536 | $0.12/MTok | Multimodal (text + images) |
| **MedEmbed** (open source) | 768 | Free (self-hosted) | Medical-specific retrieval |

**Recommendation:** Start with **text-embedding-3-small** ($0.02/MTok). At clinic scale (100K prescriptions = ~10M tokens), monthly cost is ~$0.20. If medical retrieval accuracy needs improvement, add MedEmbed as a second pass.

### What Gets Embedded

| Source | Embed Text | Example |
|--------|-----------|---------|
| **Prescription** | "Amoxicillin 500mg BD for 7 days, prescribed by Dr. Sharma for throat infection on 2026-01-15" | One embedding per prescription |
| **Consultation Notes** | SOAP fields concatenated: symptoms + exam + diagnosis + plan + vitals | One per consultation |
| **Lab Report** | AI summary of extracted values: "HbA1c 7.2% (high), fasting sugar 142 (high)" | One per report |
| **Doctor Review** | Rating text + behavior + wait time assessment | One per review |
| **Voice Call Transcript** | Full call transcript with AI summary | One per call |

### pgvector — Storage & Querying

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings table
CREATE TABLE embeddings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID NOT NULL,          -- tenant isolation
  patient_id  UUID NOT NULL,          -- patient scoping
  doctor_id   UUID,
  source_type VARCHAR(50) NOT NULL,   -- prescription, consultation, lab_report, review
  source_id   UUID NOT NULL,
  content_text TEXT NOT NULL,          -- human-readable text
  embedding   vector(1536) NOT NULL,  -- OpenAI embedding
  metadata    JSONB DEFAULT '{}',     -- date, doctor, medicines, diagnosis
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- HNSW index for fast similarity search (~5ms for 1M vectors)
CREATE INDEX idx_embeddings_hnsw
  ON embeddings USING hnsw (embedding vector_cosine_ops);

-- Always filter by tenant + patient before vector search
CREATE INDEX idx_embeddings_scope
  ON embeddings(clinic_id, patient_id);
```

**Why pgvector (not Pinecone/Qdrant):**
- Already using Supabase PostgreSQL — zero extra infrastructure
- Handles up to 10-100M vectors (more than enough: 10K clinics × 1K patients × 20 records = 200M max, years away)
- HNSW index gives ~5ms query time
- Data stays in same database — no sync issues
- Free (included in Supabase)

---

## 12. OCR — Prescriptions & Lab Reports

### Two-Stage Pipeline: Google Cloud Vision + Claude Vision

```
STAGE 1: TEXT EXTRACTION (Google Cloud Vision)
─────────────────────────────────────────────
Best handwriting accuracy: 80-95%
200+ languages including Hindi, Tamil, Telugu
Pricing: 1,000 pages/month FREE, then $1.50/1K pages

  Patient uploads prescription image
            │
            ▼
  Google Cloud Vision API
  → Extracts raw text from handwriting
  → Returns: "Amox 500mg BD x7d\nPCM 650 SOS\nPan 40 OD"

STAGE 2: UNDERSTANDING (Claude Vision)
──────────────────────────────────────
Claude doesn't just read text — it UNDERSTANDS medical shorthand

  Send to Claude with prompt:
  "Extract medicines from this prescription.
   Interpret medical abbreviations.
   Return JSON: { medicines: [{name, generic, dosage, frequency, duration, instructions}] }"
            │
            ▼
  Claude output:
  {
    "doctor_name": "Dr. R. Sharma",
    "date": "2026-03-10",
    "diagnosis": "Upper Respiratory Tract Infection",
    "medicines": [
      {
        "name": "Amoxicillin",
        "generic_name": "Amoxicillin",
        "dosage": "500mg",
        "frequency": "twice daily",
        "duration": "7 days",
        "instructions": "after meals"
      },
      {
        "name": "Paracetamol (Dolo 650)",
        "generic_name": "Paracetamol",
        "dosage": "650mg",
        "frequency": "as needed",
        "duration": "as required",
        "instructions": "for fever, max 4 per day"
      },
      {
        "name": "Pantoprazole",
        "generic_name": "Pantoprazole",
        "dosage": "40mg",
        "frequency": "once daily",
        "duration": "7 days",
        "instructions": "before breakfast"
      }
    ]
  }
```

**Why NOT Tesseract:** 20-40% accuracy on handwritten text. Unusable for prescriptions.

**Why two stages:** Google Cloud Vision has better raw OCR for handwriting. Claude has better medical understanding (knows "BD" = twice daily, "OD" = once daily, "TID" = three times daily).

### Lab Report OCR → Trend Tracking

```
Patient uploads blood test report
            │
            ▼
  Claude Vision extracts:
  {
    "report_name": "Complete Blood Count",
    "lab_name": "Thyrocare",
    "date": "2026-02-10",
    "values": {
      "hemoglobin":        { "value": 14.2, "unit": "g/dL",  "range": "13.5-17.5", "status": "normal" },
      "blood_sugar_fasting": { "value": 142,  "unit": "mg/dL", "range": "70-100",   "status": "high" },
      "hba1c":             { "value": 7.2,  "unit": "%",     "range": "4.0-5.6",   "status": "high" },
      "cholesterol_total": { "value": 220,  "unit": "mg/dL", "range": "<200",      "status": "high" },
      "wbc":               { "value": 8.5,  "unit": "K/uL",  "range": "4.5-11.0",  "status": "normal" }
    },
    "abnormal_flags": ["blood_sugar_fasting", "hba1c", "cholesterol_total"]
  }
            │
            ▼
  Stored in lab_reports table as JSONB
            │
            ▼
  Patient asks: "Mera sugar 3 mahine mein kaisa raha?"
            │
            ▼
  SQL query (not vector search — this is structured data):
  SELECT extracted_data->'blood_sugar_fasting'->'value', report_date
  FROM lab_reports
  WHERE patient_id = $1 AND report_type = 'blood_test'
  ORDER BY report_date;
            │
            ▼
  Returns: [(126, Jan), (142, Feb), (118, Mar)]
  → Recharts line graph showing trend
  → AI adds: "Aapka fasting sugar February mein badha tha (142)
     lekin March mein better hai (118). Overall control improve ho raha hai."
```

---

## 13. LLM Selection

### Claude vs OpenAI vs Gemini for Healthcare

| Factor | Claude (Anthropic) | GPT-5/4o (OpenAI) | Gemini (Google) |
|--------|-------------------|-------------------|-----------------|
| Medical reasoning | **Best** — highest accuracy on medical exams | 81.8% on licensing exams, 28.6% hallucination rate | Good for multimodal medical imaging |
| Context window | **1M tokens (GA)** — no surcharge | 128K (GPT-5), 128K (GPT-4o) | 2M (Gemini 1.5 Pro) |
| Empathy/readability | **Best** — outperformed physicians in patient communication | Good | Average |
| Vision (OCR) | Excellent for document understanding | Good | Excellent native multimodal |
| Indian languages | Good (via system prompt) | Good | Best (native multilingual) |
| Pricing (input/MTok) | $3-5 | $1.75-2.50 | $1.25-3.50 |
| Pricing (output/MTok) | $15-25 | $10-14 | $5-15 |
| Prompt caching | Up to 90% savings | 50-90% savings | Context caching available |

**Recommendation:**
- **Claude Sonnet 4.6** for: AI patient chat, doctor AI assistant, symptom analysis, prescription parsing
- **Claude Haiku 4.5** for: Quick classifications, intent detection, structured extraction (cheaper)
- **GPT-5.2** for: Fallback if Claude is down
- **Gemini** for: Multimodal lab report analysis if needed

### Cost Optimization

```
Strategy                          Savings
──────────────────────────────── ────────
Prompt caching (repeated system    90%
prompts for same clinic)

Use Haiku for simple tasks         80%
(intent detection, extraction)
vs Sonnet for complex tasks

Batch API for non-real-time        50%
(embedding generation, analytics)

Cache frequent queries              70%
("clinic timings", "directions")
in Redis/KV store
```

---

## 14. Payment Gateway

### Razorpay (Recommended for India)

| Feature | Detail |
|---------|--------|
| **Pricing** | 2% standard (cards, UPI, wallets), 3% premium cards |
| **UPI Autopay** | Recurring subscriptions via UPI mandate, smart retries |
| **Subscriptions** | Full billing: credit/debit cards, UPI, eMandate |
| **Split Payments** | Razorpay Route — platform takes commission, rest to clinic |
| **Invoice** | Built-in invoice generation |
| **Refunds** | Full and partial refund support |
| **Payout** | Pay doctors/clinics directly |

### Two Types of Payments in CliniqAI

```
TYPE 1: SAAS SUBSCRIPTION (Clinic pays CliniqAI)
─────────────────────────────────────────────────
Clinic Owner → Razorpay Subscriptions → CliniqAI account
Plans: Basic (Rs 999/mo), Pro (Rs 2,999/mo), Enterprise (custom)
UPI Autopay for recurring billing

TYPE 2: PATIENT PAYMENT (Patient pays Clinic)
─────────────────────────────────────────────
Patient → Razorpay → Clinic's connected account
Using: Razorpay Route (split payment)
  - 97% → Clinic
  - 3% → CliniqAI commission (or Razorpay fee)

Payment flow:
  Doctor generates invoice → Invoice sent via WhatsApp
  → Patient clicks payment link → UPI/Card/Wallet
  → Razorpay webhook confirms → Invoice marked paid
  → Receipt sent via WhatsApp
```

### Alternative: Cashfree

- 0.5% for UPI (cheaper than Razorpay's 2%)
- Best if high UPI volume — significant savings
- T+0 settlement (same-day payout)
- Consider for Phase 2 optimization

---

## 15. File Storage

### Strategy: Supabase Storage + Cloudflare R2

```
SUPABASE STORAGE (Primary — patient-facing documents):
├── prescriptions/{clinic_id}/{patient_id}/rx-2026-01-15.pdf
├── lab-reports/{clinic_id}/{patient_id}/cbc-2026-02-10.pdf
├── invoices/{clinic_id}/{patient_id}/inv-2026-03-14.pdf
├── profile-photos/{user_id}/avatar.jpg
└── clinic-logos/{clinic_id}/logo.png

Benefits:
- Integrated with Supabase Auth + RLS → automatic access control
- Patient can only access their own files
- No extra service to manage

CLOUDFLARE R2 (Large files — if needed):
├── medical-images/{clinic_id}/{patient_id}/xray-2026-01-20.dcm
├── call-recordings/{clinic_id}/{call_id}/recording.mp3
└── video-recordings/{clinic_id}/{session_id}/consultation.mp4

Benefits:
- ZERO egress fees (87% cheaper than S3 for downloads)
- $0.015/GB/mo storage
```

### Security for Medical Documents

```
All files encrypted at rest (AES-256)
All transfers over TLS 1.3
Signed URLs with expiry for downloads (15 min default)
RLS policies enforce: patient sees only their files
Audit log: who accessed which file, when
No public bucket — all files are private
DPDPA: patient can request data export/deletion
```

---

## 16. Real-Time Communication

### Supabase Realtime (Primary)

Used for all live updates within the app:

```
QUEUE UPDATES:
  supabase.channel('queue:clinic-a:dr-sharma')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'queue_entries',
      filter: 'clinic_id=eq.xxx AND doctor_id=eq.yyy'
    }, (payload) => {
      // Update queue display in real-time
      // Show: Token #3 IN PROGRESS, #4 WAITING, #5 WAITING
    })
    .subscribe();

APPOINTMENT STATUS:
  Channel: 'appointments:patient-xxx'
  → Patient sees live status changes (confirmed → checked_in → in_progress → completed)

CHAT MESSAGES:
  Channel: 'chat:conversation-xxx'
  → Real-time message delivery for doctor-patient chat

NOTIFICATIONS:
  Channel: 'notifications:user-xxx'
  → Bell icon updates in real-time
```

**Limits:** 200 concurrent users per channel, 100 channels per tenant. Sufficient for clinic scale (~50-100 concurrent users per clinic).

### SSE for AI Chat Streaming

Vercel AI SDK v6 uses Server-Sent Events (SSE) natively for streaming AI responses. No extra setup needed — `useChat` hook handles it.

---

## 17. Video Consultation (Telemedicine — Phase 2)

### Options

| Service | Pricing | Best For |
|---------|---------|---------|
| **Jitsi Meet** | Free (self-hosted) or JaaS ($0.0024/min) | Budget, HIPAA control |
| **Daily.co** | 10K min free, then $0.004/min | Easy embed, best DX |
| **Twilio Video** | $0.004/min | Already using Twilio |

**Recommendation:** **Daily.co** for easiest integration. Embed video with 5 lines of code. Patient joins via WhatsApp link (one-tap, no app download).

```
Doctor clicks "Start Video" → Daily room created
→ WhatsApp sent to patient: "Join video: https://cliniqai.daily.co/room-xxx"
→ Patient taps link → joins in browser
→ AI records notes (if consent given)
→ After call → prescription + invoice generated
```

---

## 18. Rate Limiting & Security

### @upstash/ratelimit

```typescript
// src/middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1m'), // 100 requests per minute
});

// Apply per IP or per user
const { success, limit, remaining } = await ratelimit.limit(identifier);
```

### Security Checklist

```
✅ RLS on every table (tenant isolation)
✅ JWT validation in middleware
✅ Rate limiting on all API endpoints
✅ Input validation with Zod on every endpoint
✅ CORS configured for known origins only
✅ Webhook signature verification (Razorpay, WhatsApp, Exotel)
✅ File upload: type validation, size limits (10MB max)
✅ SQL injection: impossible with Drizzle (parameterized queries)
✅ XSS: React's default escaping + CSP headers
✅ CSRF: Server Actions include CSRF tokens by default
✅ Secrets: environment variables only, never in code
✅ Audit log: immutable log for all PHI access
✅ Encryption: AES-256 at rest, TLS 1.3 in transit
✅ DPDPA: consent capture, data export, right-to-deletion
```

---

## 19. Monitoring & Analytics

| Tool | Purpose | Cost |
|------|---------|------|
| **Sentry** | Error tracking, performance monitoring | Free (5K events/mo) |
| **Vercel Analytics** | Web vitals, page performance | Included with Vercel |
| **Upstash QStash** | Background job scheduling (follow-up reminders, report generation) | $10/mo |
| **Supabase Dashboard** | Database monitoring, query performance | Included |

---

## 20. End-to-End System Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PATIENT TOUCHPOINTS                         │
│                                                                     │
│   📞 Phone Call        📱 WhatsApp        💻 Web Portal              │
│   (Exotel)            (Gupshup/WATI)     (Next.js)                 │
│       │                    │                  │                      │
│       └────────────────────┼──────────────────┘                     │
│                            │                                        │
│                            ▼                                        │
│              ┌─────────────────────────────┐                        │
│              │   AI COMMUNICATION HUB       │                        │
│              │                             │                        │
│              │  Voice: Bolna.ai            │                        │
│              │  Chat:  Vercel AI SDK v6    │                        │
│              │  LLM:   Claude API          │                        │
│              │  STT:   Deepgram/Sarvam    │                        │
│              │  TTS:   AWS Polly          │                        │
│              └────────────┬────────────────┘                        │
│                           │                                         │
│                    Tool Calls / API                                  │
│                           │                                         │
│                           ▼                                         │
│              ┌─────────────────────────────┐                        │
│              │   NEXT.JS APP ROUTER         │                        │
│              │                             │                        │
│              │  tRPC Routers (internal)    │                        │
│              │  REST Routes (webhooks)     │                        │
│              │  Server Actions (forms)     │                        │
│              │  Middleware (auth, rate)     │                        │
│              └────────────┬────────────────┘                        │
│                           │                                         │
│              ┌────────────┼────────────────┐                        │
│              │            │                │                        │
│              ▼            ▼                ▼                        │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│   │  Supabase    │ │  Cloudflare  │ │  External    │               │
│   │  PostgreSQL  │ │  R2 Storage  │ │  Services    │               │
│   │              │ │              │ │              │               │
│   │  + RLS       │ │  • Images    │ │  • Razorpay  │               │
│   │  + pgvector  │ │  • PDFs      │ │  • Exotel    │               │
│   │  + Realtime  │ │  • Reports   │ │  • Gupshup   │               │
│   │  + Auth      │ │  • Recordings│ │  • GCP Vision│               │
│   │              │ │              │ │  • Bolna.ai  │               │
│   │  ALL DATA    │ │  ALL FILES   │ │  • Daily.co  │               │
│   └──────────────┘ └──────────────┘ └──────────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      CLINIC TOUCHPOINTS                             │
│                                                                     │
│   👨‍⚕️ Doctor Dashboard    👩‍💼 Staff Dashboard    🏥 Clinic Owner       │
│   (Next.js /clinic)     (Next.js /clinic)     (Next.js /clinic)    │
│                                                                     │
│   Features per role:                                                │
│   Doctor: Patients, consultations, prescriptions, AI assistant      │
│   Staff:  Queue, registration, billing, appointments                │
│   Owner:  Analytics, settings, staff management, payments           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     SUPER ADMIN PORTAL                              │
│                                                                     │
│   🔧 Platform Management  (Next.js /admin)                          │
│                                                                     │
│   Clinic onboarding, subscriptions, compliance, platform analytics  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow: Complete Patient Journey

```
1. FIRST CONTACT
   Patient calls +91-XXXX → Exotel → Bolna AI
   AI: "Namaste! City Dental Clinic. Kaise help karun?"
   Patient: "Daat mein dard hai"
   AI: symptom extraction → doctor suggestion → appointment booked
   → Token #4, wait 25 min, Dr. Sharma, Rs 500
   → WhatsApp confirmation sent
   → SMS backup sent
   → Call transcript saved + embedded

2. ARRIVAL
   Patient arrives → scans QR / staff enters code → checked in
   → Queue position updated (Supabase Realtime)
   → WhatsApp: "You are #2, ~10 min"
   → Clinic TV: Token #3 IN PROGRESS, #4 WAITING

3. CONSULTATION
   Doctor sees: AI pre-visit summary (symptoms from call)
              + patient history + active medications + allergies
   Doctor consults → speaks → AI scribe captures notes (Phase 4)
   Doctor generates prescription (digital, e-signed)
   → Prescription saved + embedded in pgvector
   → Prescription PDF sent via WhatsApp

4. BILLING
   Invoice auto-generated → sent via WhatsApp with UPI link
   Patient pays via UPI/card → Razorpay webhook → invoice marked paid
   → Receipt sent via WhatsApp
   → Revenue analytics updated

5. POST-VISIT
   → Follow-up reminder scheduled (AI call in 7 days)
   → Medicine reminder WhatsApp at scheduled times
   → Feedback survey via WhatsApp (2 hours later)
   → If rating ≥ 4 → Google Review prompt
   → Doctor-patient relationship updated (visits++, total_spent+=)

6. FUTURE INTERACTIONS
   Patient chats: "Last month kya dawai di thi?"
   → RAG search in pgvector → Claude answers from records
   Doctor chats: "Rajesh ka sugar trend?"
   → SQL query on lab_reports → Recharts trend graph
```

---

## 21. Knowledge Base System

### Architecture: What Goes Where

```
┌────────────────────────────────────────────────────────────────┐
│                   KNOWLEDGE BASE LAYERS                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  LAYER 1: SYSTEM PROMPT (static, cached in Redis)              │
│  ─────────────────────────────────────────────────              │
│  What: Clinic name, address, timings, doctor names              │
│  Storage: PostgreSQL → Redis cache (TTL: 1 hour)               │
│  Update: Admin changes clinic info → cache invalidated         │
│  Used by: AI voice agent system prompt (every call)            │
│  Speed: <1ms (from cache)                                      │
│                                                                │
│  Example system prompt:                                        │
│  "You are the AI receptionist for City Dental Clinic.          │
│   Address: MG Road, Bangalore. Timings: Mon-Sat 10AM-6PM.     │
│   Doctors: Dr. Sharma (Dentist, Rs 500), Dr. Priya (Dentist,  │
│   Rs 300), Dr. Ravi (Orthopedic, Rs 400).                      │
│   Emergency number: +91-80-XXXX-1099."                         │
│                                                                │
│  LAYER 2: RAG (semantic search, pgvector embeddings)           │
│  ────────────────────────────────────────────────               │
│  What: FAQs, medical guidelines, procedure descriptions,       │
│        post-visit care, health tips, doctor bios               │
│  Storage: PostgreSQL + pgvector embeddings                     │
│  Update: Admin adds/edits FAQ → auto re-embed                  │
│  Used by: When patient asks a question not in system prompt    │
│  Speed: ~5-20ms (vector search)                                │
│                                                                │
│  LAYER 3: FUNCTION CALLING (real-time API, live data)          │
│  ─────────────────────────────────────────────────              │
│  What: Slot availability, queue status, patient records         │
│  Storage: PostgreSQL (live queries)                             │
│  Update: Changes every second (queue) / every minute (slots)   │
│  Used by: AI calls your API during live conversation           │
│  Speed: ~50-200ms (DB query)                                   │
│                                                                │
│  LAYER 4: SYMPTOM MAPPING (hybrid: DB lookup + AI fallback)    │
│  ──────────────────────────────────────────────────────         │
│  What: Symptom → doctor specialization matching                │
│  Storage: symptom_specialization_map table + Claude fallback   │
│  Update: Super Admin adds new symptom mappings                 │
│  Speed: <5ms (DB lookup), ~500ms (Claude fallback)             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Knowledge Base Database Schema

```sql
-- Clinic-level knowledge base entries
CREATE TABLE knowledge_base (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID REFERENCES clinics(id),    -- NULL = platform-wide (Super Admin)
  category        VARCHAR(100) NOT NULL,           -- 'faq', 'service', 'post_care', 'announcement', 'guideline', 'health_tip'
  title           VARCHAR(500) NOT NULL,           -- "What insurance do you accept?"
  content         TEXT NOT NULL,                   -- "We accept Star Health, ICICI Lombard..."
  language        VARCHAR(10) DEFAULT 'en',        -- 'en', 'hi', 'ta', 'te'
  tags            TEXT[] DEFAULT '{}',             -- ['insurance', 'payment', 'billing']
  is_published    BOOLEAN DEFAULT true,
  priority        INTEGER DEFAULT 0,               -- higher = shown first in search
  content_hash    VARCHAR(64),                     -- SHA256 of content (for change detection)
  created_by      UUID,                            -- admin who created
  updated_by      UUID,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kb_clinic ON knowledge_base(clinic_id, category, is_published);
CREATE INDEX idx_kb_tags ON knowledge_base USING GIN(tags);

-- Embeddings for knowledge base entries (in the existing embeddings table)
-- source_type = 'knowledge_base', source_id = knowledge_base.id
```

### How AI Uses Knowledge Base During a Call

```
Patient calls: +91-80-XXXX-1001
        │
        ▼
┌───────────────────────────────────────────────┐
│ STEP 1: LOAD SYSTEM PROMPT (from Redis cache) │
│                                               │
│ Redis key: "system_prompt:clinic-a"           │
│                                               │
│ Contains:                                     │
│ - Clinic name, address, timings               │
│ - Doctor names + specializations + fees       │
│ - Greeting script                             │
│ - Language preference                         │
│                                               │
│ If cache miss → query PostgreSQL → cache it   │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│ STEP 2: AI GREETS PATIENT                     │
│                                               │
│ "Namaste! Welcome to City Dental Clinic.      │
│  Main aapki kya madad kar sakta hoon?"        │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│ STEP 3: PATIENT ASKS QUESTION                 │
│                                               │
│ "Aapke clinic mein parking hai?"              │
│ (Is there parking at your clinic?)            │
│                                               │
│ AI checks: Is this answerable from            │
│ system prompt? → NO                           │
│                                               │
│ AI triggers: RAG search                       │
│ → Embed question                              │
│ → Search knowledge_base embeddings            │
│   WHERE clinic_id = $clinic_id                │
│ → Found: "Free parking available for          │
│   patients in basement level B1.              │
│   Enter from back gate."                      │
│                                               │
│ AI responds: "Haan ji, humare clinic mein     │
│ free parking hai basement level B1 mein.      │
│ Back gate se enter karein."                   │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│ STEP 4: PATIENT ASKS ABOUT SYMPTOMS           │
│                                               │
│ "Mujhe daat mein dard hai"                    │
│ (I have tooth pain)                           │
│                                               │
│ AI triggers: FUNCTION CALL                    │
│ → search_doctors(symptoms: "tooth pain")      │
│ → Your API queries:                           │
│   1. symptom_specialization_map → "Dentist"   │
│   2. doctors WHERE specialization = Dentist   │
│   3. queue_entries for each doctor (LIVE)     │
│   4. appointments for slot availability       │
│                                               │
│ AI responds with doctor suggestions           │
│ (fee, rating, queue, token)                   │
└───────────────────────────────────────────────┘
```

### Knowledge Base Admin Panel (Super Admin / Clinic Owner)

```
Admin Dashboard → Knowledge Base
    │
    ├── Platform Knowledge Base (Super Admin only)
    │   ├── Symptom Mappings (add/edit/delete)
    │   ├── Medical Guidelines
    │   ├── Emergency Triage Rules
    │   └── Health Tips
    │
    └── Clinic Knowledge Base (Clinic Owner)
        ├── Clinic Info (timings, address, parking, directions)
        ├── Doctor Profiles (bio, qualifications, schedule)
        ├── Services & Pricing
        ├── FAQs (custom per clinic)
        ├── Post-Visit Care Instructions
        └── Announcements

Actions:
  [Add Entry] → fill title, content, category, tags, language
  [Edit Entry] → modify → auto re-embed on save
  [Delete Entry] → soft delete, remove embedding
  [Preview] → "Test: Ask a question against this knowledge base"
  [Bulk Import] → CSV/JSON upload
  [Version History] → who changed what, when, diff view
```

### Embedding Update Pipeline

```
Admin creates/updates knowledge base entry
        │
        ▼
┌───────────────────────────────────────────────┐
│ 1. Save to PostgreSQL (knowledge_base table)  │
│ 2. Compute content_hash (SHA256)              │
│ 3. Compare with existing hash                 │
│    → If same: skip (no change)                │
│    → If different: continue                   │
│ 4. Push job to BullMQ: "re-embed"             │
└───────────────┬───────────────────────────────┘
                │
                ▼ (async, BullMQ worker)
┌───────────────────────────────────────────────┐
│ 5. Generate embedding (OpenAI text-embedding) │
│ 6. Upsert into embeddings table               │
│ 7. Invalidate Redis cache for this clinic     │
│ 8. Log: "KB entry XYZ re-embedded"            │
└───────────────────────────────────────────────┘
```

---

## 22. Conversation Storage & Queue Architecture

### Tools

| Component | Tool | Cost |
|-----------|------|------|
| Message Queue | **BullMQ** (on self-hosted Redis) | Free |
| Cache | **Self-hosted Redis** | Free |
| Conversation DB | **Self-hosted PostgreSQL** | Free |
| Live STT (during call) | **Deepgram** or **Sarvam AI** (via Bolna) | Rs 30/hr (Sarvam) / $0.0043/min (Deepgram) |
| Post-call STT (storage) | **OpenAI Whisper** (self-hosted, FREE) | Free |
| Embeddings | **OpenAI text-embedding-3-small** | $0.02/MTok |

### Dual-STT Strategy: Live (Deepgram/Sarvam) + Storage (Whisper)

```
DURING THE CALL (real-time, <300ms):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Patient speaks → Deepgram/Sarvam (live streaming STT)
  → Text in <300ms → LLM processes → AI responds

  WHY NOT WHISPER HERE?
  Whisper is batch-only. It needs the full audio file first.
  You can't use it for live conversation — too slow (5-30 sec delay).

AFTER THE CALL (batch, high accuracy):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Call ends → Bolna webhook sends recording URL
  → BullMQ job: "transcribe_with_whisper"
  → Worker downloads recording → runs Whisper → clean transcript
  → Store transcript in PostgreSQL
  → Generate embedding → store in pgvector
  → Patient and doctor can read/search it forever

  WHY WHISPER HERE?
  ✅ FREE (self-hosted, open source)
  ✅ More accurate than live STT (no time pressure)
  ✅ Better at Hindi/Hinglish (whisper-large-v3)
  ✅ Generates timestamps per word (useful for playback sync)
```

### OpenAI Whisper — Self-Hosted Setup

```bash
# Install Whisper on your VPS/server
pip install openai-whisper

# Or use faster-whisper (4x faster, same accuracy):
pip install faster-whisper

# Download model (do once):
# tiny: 75MB, fast, lower accuracy
# base: 140MB, good balance
# small: 460MB, better accuracy
# medium: 1.5GB, very good
# large-v3: 3GB, best accuracy (recommended for Hindi)

# Transcribe a call recording:
whisper recording.mp3 --model large-v3 --language hi --output_format json

# Output: recording.json
# {
#   "text": "Namaste, City Dental Clinic mein aapka swagat hai...",
#   "segments": [
#     {"start": 0.0, "end": 2.5, "text": "Namaste, City Dental Clinic mein"},
#     {"start": 2.5, "end": 5.0, "text": "aapka swagat hai..."}
#   ]
# }
```

### Complete Transcription Pipeline

```
Call ends (Bolna webhook)
        │
        ▼
POST /api/webhooks/bolna
  Body: {
    call_id: "xxx",
    recording_url: "https://storage.bolna.ai/recordings/xxx.mp3",
    live_transcript: "Namaste... daat mein dard hai...",  // from live STT
    duration: 180,
    patient_phone: "+91-98765-43210"
  }
        │
        ▼
1. Return 200 OK immediately
2. Push to BullMQ: { job: "process_call", data: webhookPayload }
        │
        ▼ (BullMQ Worker — async)

STEP 1: Download recording
  → Download MP3 from recording_url → save to local disk / R2

STEP 2: Whisper transcription (self-hosted)
  → faster-whisper large-v3 → generates accurate transcript
  → Output: full text + word-level timestamps + language detected

STEP 3: Store in PostgreSQL
  → conversations table: metadata, duration, sentiment, summary
  → conversation_messages table: each turn (patient/AI) as separate row
  → Store both live_transcript AND whisper_transcript
    (Whisper is more accurate — use it as primary)

STEP 4: Generate embedding
  → Build text: "Patient called City Dental Clinic on 2026-03-15.
     Symptoms: tooth pain, jaw swelling. Booked with Dr. Sharma,
     Token #4, 11:30 AM. Fee Rs 500."
  → OpenAI text-embedding-3-small → 1536-dim vector
  → Store in embeddings table (source_type: 'conversation')

STEP 5: AI Summary
  → Send Whisper transcript to Claude Haiku (cheapest)
  → "Summarize this clinic call in 2-3 lines"
  → Store summary in conversations.ai_summary

DONE. Conversation is now:
  ✅ Stored as text (searchable)
  ✅ Stored as embedding (RAG searchable)
  ✅ Has AI summary (quick view for doctor)
  ✅ Has recording URL (audio playback)
  ✅ Visible in patient portal
  ✅ Visible in doctor dashboard
```

### Where Patient & Doctor See Conversations

```
PATIENT PORTAL — "My Conversations" tab
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────┐
│ My Conversations                                     │
│                                                     │
│ 📞 Voice Call — 15 Mar 2026, 10:15 AM               │
│ Summary: Booked appointment with Dr. Sharma for      │
│ tooth pain. Token #4, 11:30 AM. Fee Rs 500.         │
│ [View Transcript] [Play Recording]                   │
│                                                     │
│ 💬 WhatsApp — 12 Mar 2026, 3:30 PM                  │
│ Summary: Checked queue status. Position #2,          │
│ estimated wait 10 minutes.                          │
│ [View Chat]                                         │
│                                                     │
│ 📞 Voice Call — 1 Mar 2026, 9:00 AM                 │
│ Summary: Called to ask about clinic timings.         │
│ Told Mon-Sat 10AM-6PM.                              │
│ [View Transcript] [Play Recording]                   │
└─────────────────────────────────────────────────────┘

Click "View Transcript":
┌─────────────────────────────────────────────────────┐
│ Call Transcript — 15 Mar 2026                        │
│                                                     │
│ 🤖 AI: Namaste! Welcome to City Dental Clinic.      │
│        Main aapki kya madad kar sakta hoon?          │
│                                                     │
│ 👤 Patient: Mujhe daat mein bahut dard hai.          │
│                                                     │
│ 🤖 AI: Aapke symptoms ke hisaab se Dentist best     │
│        rahega. Humare paas 2 dentist available hain: │
│        1. Dr. Sharma — Rs 500, 3 waiting, Token #4  │
│        2. Dr. Priya — Rs 300, no waiting, Token #1  │
│        Kaunse doctor chahiye?                        │
│                                                     │
│ 👤 Patient: Dr. Sharma se book karo, 11:30 baje.    │
│                                                     │
│ 🤖 AI: Aapka appointment confirm ho gaya!            │
│        Dr. Sharma, 11:30 AM, Token #4, Rs 500.      │
│        WhatsApp pe confirmation aa jayega.            │
│                                                     │
│ Actions Taken:                                       │
│ ✅ Appointment booked: APT-2026-3847                 │
│ ✅ Token assigned: #4                                │
│ ✅ WhatsApp confirmation sent                        │
└─────────────────────────────────────────────────────┘


DOCTOR DASHBOARD — Patient's conversation history
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Doctor opens patient "Rajesh Kumar" → "Conversations" tab
Shows ALL conversations this patient had with the clinic:

┌─────────────────────────────────────────────────────┐
│ Patient: Rajesh Kumar — Conversations                │
│                                                     │
│ 📞 15 Mar 2026 — Booked for tooth pain              │
│    AI Summary: Tooth pain + jaw swelling, 3 days.   │
│    Booked Dr. Sharma 11:30AM. Token #4.             │
│    Sentiment: Neutral. Language: Hindi.              │
│    [Expand Transcript ▼]                            │
│                                                     │
│ 💬 12 Mar 2026 — Queue check via WhatsApp           │
│    AI Summary: Checked queue. Position #2, 10 min.  │
│    [View Chat ▼]                                    │
│                                                     │
│ 📞 1 Mar 2026 — Clinic timings inquiry              │
│    AI Summary: Asked about timings. Told Mon-Sat    │
│    10AM-6PM.                                        │
│    [Expand Transcript ▼]                            │
│                                                     │
│ 🔍 Search: [What symptoms did patient report?    ]  │
│    → AI searches conversation embeddings → answers  │
└─────────────────────────────────────────────────────┘
```
| Voice AI | **Bolna.ai** | $0.02-0.04/min platform + usage |

### Why BullMQ (not Kafka, not RabbitMQ)

```
BullMQ:
  ✅ Built for Node.js/TypeScript (your stack)
  ✅ Runs on Redis (you already need Redis for caching)
  ✅ At-least-once delivery (no data loss)
  ✅ Retries with exponential backoff
  ✅ Dead-letter queue for failed jobs
  ✅ Job scheduling (follow-up reminders, report generation)
  ✅ 10K messages/second (enough for 1000+ clinics)
  ✅ Free, open source
  ❌ Not distributed (Redis is single-node) — fine for startup scale

Kafka:
  ❌ Overkill (millions/second capacity vs your thousands)
  ❌ Complex to operate (ZooKeeper, partitions, consumer groups)
  ❌ Expensive infrastructure
  → Use only if you hit 10K+ concurrent clinics (Phase 4+)

RabbitMQ:
  ❌ Not Node.js native (Erlang-based)
  ❌ More complex routing than needed
  → Better for complex multi-service architectures
```

### Conversation Storage Flow

```
VOICE CALL (Bolna.ai):
  Call ends → Bolna sends webhook POST to /api/webhooks/bolna
        │
        ▼
  Webhook handler:
    1. Validate webhook signature
    2. Return 200 OK immediately (don't block)
    3. Push job to BullMQ: { type: "voice_call", data: webhookPayload }
        │
        ▼
  BullMQ Worker processes:
    1. Parse: call_id, transcript, duration, recording_url, extracted_data
    2. Deduplicate: check if call_id already exists (idempotency)
    3. Store in conversations table
    4. Store individual messages in conversation_messages table
    5. Store extracted data (symptoms, appointment, patient info)
    6. Generate embedding from transcript
    7. Update analytics (call count, avg duration, resolution rate)
    8. If failed → retry 3x → dead-letter queue → alert

WHATSAPP (API webhook):
  Message received → POST /api/webhooks/whatsapp
        │
        ▼
  Same pattern: acknowledge → queue → worker → store → embed

WEB CHAT (real-time):
  Message sent → WebSocket/Server Action
        │
        ▼
  Store directly in PostgreSQL (no queue needed for web chat —
  it's already in your server process)
  Generate embedding async via BullMQ
```

### Conversation Database Tables

```sql
-- Unified conversation record (all channels)
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id),
  patient_id      UUID REFERENCES patients(id),
  channel         VARCHAR(20) NOT NULL,           -- 'voice', 'whatsapp', 'web_chat', 'doctor_chat'

  -- External IDs for deduplication
  external_id     VARCHAR(255) UNIQUE,            -- Bolna call_id / WhatsApp message_id

  -- Timing
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- AI analysis
  ai_summary      TEXT,                            -- auto-generated summary
  sentiment       VARCHAR(20),                     -- positive, neutral, negative
  primary_intent  VARCHAR(50),                     -- book_appointment, check_queue, clinic_info, etc.
  resolution      VARCHAR(50),                     -- resolved, transferred, abandoned, failed
  language        VARCHAR(10),                     -- detected language

  -- Voice-specific
  recording_url   TEXT,                            -- call recording (Cloudflare R2)
  transcript_url  TEXT,                            -- full transcript file

  -- Actions taken during conversation
  actions         JSONB DEFAULT '[]',
  -- [{"action": "appointment_booked", "id": "apt-xxx"},
  --  {"action": "patient_registered", "id": "pat-xxx"}]

  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_clinic ON conversations(clinic_id, started_at);
CREATE INDEX idx_conversations_patient ON conversations(patient_id);
CREATE INDEX idx_conversations_channel ON conversations(channel, started_at);

-- Individual messages within a conversation
CREATE TABLE conversation_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  role            VARCHAR(20) NOT NULL,            -- 'patient', 'ai', 'doctor', 'staff'
  content         TEXT NOT NULL,
  message_type    VARCHAR(20) DEFAULT 'text',      -- text, voice_note, image, file
  intent          VARCHAR(50),                     -- detected intent for this message
  confidence      DECIMAL(3,2),                    -- AI confidence score
  metadata        JSONB DEFAULT '{}',              -- additional data
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conv_messages ON conversation_messages(conversation_id, created_at);

-- Structured data extracted from conversations
CREATE TABLE conversation_extractions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  key             VARCHAR(100) NOT NULL,           -- 'symptoms', 'preferred_doctor', 'preferred_date'
  value           TEXT NOT NULL,
  confidence      DECIMAL(3,2),
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Caching Architecture

```
┌─────────────────────────────────────────────────┐
│              REDIS CACHE LAYERS                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  L1: System Prompts (per clinic)                │
│  Key: "sp:{clinic_id}"                          │
│  TTL: 1 hour                                    │
│  Invalidate: on clinic/doctor profile update    │
│  Contains: AI greeting, clinic info, doctor list│
│                                                 │
│  L2: Semantic Cache (FAQ answers)               │
│  Key: "faq:{clinic_id}:{query_hash}"            │
│  TTL: 30 minutes                                │
│  Invalidate: on knowledge_base update           │
│  Contains: Previously answered FAQ responses    │
│  Example: "parking?" → cached answer            │
│                                                 │
│  L3: Session Cache (active calls)               │
│  Key: "session:{call_id}"                       │
│  TTL: 30 minutes (auto-expire after call)       │
│  Contains: Patient context, conversation state  │
│                                                 │
│  L4: Rate Limit Counters                        │
│  Key: "rl:{ip}:{endpoint}"                      │
│  TTL: sliding window                            │
│                                                 │
│  Cache Invalidation:                            │
│  Redis Pub/Sub → all app instances              │
│  Admin updates clinic → PUBLISH "invalidate"    │
│  → all servers clear relevant cache keys        │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 23. Cost Estimation

### MVP Monthly Cost (50 clinics, 5K patients)

| Service | Cost | Notes |
|---------|------|-------|
| Supabase Pro | $25 | Database + Auth + Realtime + Storage |
| Vercel Pro | $20 | Hosting + Edge + Analytics |
| Exotel Starter | Rs 9,999 (~$120) | Telephony + virtual numbers + SMS |
| Bolna.ai | ~$100-200 | ~5K minutes/month @ $0.02-0.04/min |
| Claude API | ~$50-100 | Chat + OCR + analysis |
| OpenAI Embeddings | ~$5 | text-embedding-3-small |
| Google Cloud Vision | $0 | Free tier (1K pages/month) |
| Gupshup/WATI | Rs 2,499 (~$30) | WhatsApp Business API |
| Upstash Redis | $10 | Rate limiting + caching |
| Cloudflare R2 | $0-5 | File storage |
| Sentry | $0 | Free tier |
| **TOTAL** | **~$360-510/month** | **Rs 30,000-42,000** |

### At Scale (500 clinics, 50K patients)

| Service | Cost |
|---------|------|
| Supabase Team | $599/mo |
| Vercel Enterprise | Custom |
| Exotel Business | Rs 50K-1L/mo |
| Bolna.ai | ~$1K-2K/mo |
| Claude API | ~$500-1K/mo |
| WhatsApp | Rs 10K-25K/mo |
| **TOTAL** | **~$3K-5K/month** |

### Revenue Model vs Costs

```
IF pricing = Rs 1,999/clinic/month (Basic plan):

  50 clinics:  Rs 99,950/mo revenue vs Rs 30K-42K cost = PROFITABLE
  500 clinics: Rs 9.99L/mo revenue  vs Rs 2.5L-4.2L cost = VERY PROFITABLE

Unit economics:
  CAC (estimated): Rs 5K-10K per clinic
  LTV (12 months): Rs 24K (Basic) to Rs 60K (Pro)
  LTV:CAC ratio: 2.4x to 12x ✅
```

---

*Last updated: 2026-03-14*
*This document is the single source of truth for all technology decisions in CliniqAI.*
