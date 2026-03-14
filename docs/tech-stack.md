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
21. [Cost Estimation](#21-cost-estimation)

---

## 1. Final Tech Stack (Quick Reference)

| Layer | Tool | Why This One | Monthly Cost |
|-------|------|-------------|-------------|
| **Frontend** | Next.js 15 (App Router) + TypeScript | SSR, server actions, streaming | Free |
| **UI** | Tailwind CSS + shadcn/ui | Already set up, composable | Free |
| **Backend API** | tRPC + Zod (internal) / REST (external) | End-to-end type safety | Free |
| **ORM** | Drizzle ORM | Fastest cold starts, SQL control, edge-ready | Free |
| **Database** | Supabase PostgreSQL + RLS | Auth + DB + Realtime + Storage in one | $25/mo Pro |
| **Vector DB** | pgvector (Supabase extension) | No extra service, sufficient for clinic scale | Free (included) |
| **Auth** | Better Auth (self-hosted) OR Supabase Auth | Multi-tenant RBAC, free at scale | Free |
| **AI Voice** | Bolna.ai (orchestration) + Exotel (telephony) | Indian languages, Hinglish, +91 numbers | Rs 10K-20K/mo |
| **LLM** | Claude API (primary) via Vercel AI SDK v6 | Best medical reasoning, 1M context | Per-token |
| **Embeddings** | OpenAI text-embedding-3-small | $0.02/MTok, good accuracy | ~$5-10/mo |
| **OCR** | Google Cloud Vision + Claude Vision | Best handwriting + contextual understanding | ~$5-15/mo |
| **WhatsApp** | Gupshup or WATI (WhatsApp Business API) | India BSPs, chatbot support | Rs 2,500+/mo |
| **SMS** | Exotel SMS (included) or MSG91 | DLT compliant, cheap in India | Rs 500-2K/mo |
| **Payments** | Razorpay | UPI, cards, subscriptions, best Indian DX | 2% per txn |
| **File Storage** | Supabase Storage (primary) + Cloudflare R2 (large files) | Integrated auth + zero egress | $0-10/mo |
| **Real-Time** | Supabase Realtime | Queue updates, notifications, included | Free (included) |
| **Video** | Jitsi Meet (self-hosted) or Daily.co | Free/cheap video consultation | Free-$99/mo |
| **Rate Limiting** | @upstash/ratelimit + Upstash Redis | Edge-native, Next.js compatible | $10/mo |
| **Monitoring** | Sentry (errors) + Upstash (analytics) | Error tracking, performance | Free-$26/mo |
| **Hosting** | Vercel (frontend) + Supabase (backend) | Optimized for Next.js | $20-40/mo |

**Total estimated MVP cost: Rs 15,000-30,000/month (~$180-360)**

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

### Why Drizzle ORM (not Prisma)

| Factor | Drizzle | Prisma |
|--------|---------|--------|
| Cold start | ~50-100ms | ~80-150ms |
| Bundle size | Dramatically smaller | Larger (even after Prisma 7 dropped Rust engine) |
| Edge runtime | Native support | Limited |
| SQL control | Full — write SQL-like queries | Abstracted — less control |
| Migrations | `drizzle-kit` — lightweight | `prisma migrate` — heavier |
| Supabase fit | Excellent | Good |

### Supabase PostgreSQL

**Why Supabase over raw PostgreSQL:**
- Auth + Database + Storage + Realtime + Edge Functions — one platform
- Row Level Security (RLS) enforces tenant isolation at the database level
- pgvector extension for embeddings — no external vector DB needed
- Built-in connection pooling (PgBouncer)
- Dashboard for debugging queries, viewing data
- Free tier: 500MB DB, 1GB storage, 50K MAUs

**Supabase Pro ($25/mo) gives:**
- 8GB database
- 100GB storage
- 250K MAUs
- Daily backups (7-day retention)
- No project pausing

### Row Level Security (RLS) — How Tenant Isolation Works

```sql
-- Every table has clinic_id. RLS automatically filters by it.
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Clinic staff/doctors see all appointments in their clinic
CREATE POLICY "clinic_access" ON appointments
  FOR ALL USING (
    clinic_id = (auth.jwt()->>'clinic_id')::uuid
    AND (auth.jwt()->>'role') IN ('doctor', 'staff', 'nurse', 'receptionist', 'clinic_owner')
  );

-- Patients see only their own appointments
CREATE POLICY "patient_access" ON appointments
  FOR SELECT USING (
    clinic_id = (auth.jwt()->>'clinic_id')::uuid
    AND patient_id = (auth.jwt()->>'patient_id')::uuid
  );
```

**Result:** Every query is automatically filtered. A doctor at Clinic A can NEVER see Clinic B's data, even if the application code has a bug.

---

## 5. Authentication & Multi-Tenant RBAC

### Recommended: Better Auth (or Supabase Auth)

| Feature | Better Auth | Supabase Auth | Clerk |
|---------|-------------|---------------|-------|
| Type | Open source library | Managed (open source core) | Managed SaaS |
| Multi-tenancy | Built-in (organizations, roles, invitations) | Via RLS + custom tables | Built-in |
| Free tier | Unlimited (self-hosted) | 50,000 MAUs | 10,000 MAUs |
| At 100K MAUs | Free | Still cheap | Very expensive |
| Enterprise SSO | SAML 2.0, SCIM | SAML (Enterprise plan) | SAML, SCIM |
| India data residency | Yes (self-hosted) | Singapore region | US-based |

**Better Auth** is recommended because:
- Free at any scale (self-hosted with your Supabase DB)
- Built-in organization model (each clinic = an organization)
- Fine-grained RBAC for 7+ roles
- TypeScript-first, works with Next.js App Router

**Alternative:** Supabase Auth is simpler if you want everything in one platform. Use custom claims in JWT for roles + tenant ID.

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

## 21. Cost Estimation

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
