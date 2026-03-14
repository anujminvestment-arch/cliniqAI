# /build-module — Build a Core Module

Build or extend a core module of the CliniqAI platform.

## Instructions

1. Identify which module the user wants to build from the argument. Valid modules:
   - `voice-receptionist` — AI Voice Receptionist
   - `appointments` — Appointment Management
   - `queue` — Queue Management
   - `multi-clinic` — Multi-Clinic Management
   - `patient-registration` — Patient Registration
   - `patient-portal` — Patient Portal
   - `billing` — Billing & Transactions
   - `follow-ups` — Automated Follow-Ups
   - `symptom-intake` — AI Symptom Intake
   - `doctor-assistant` — AI Doctor Assistant

2. Check if a contract exists in `.gsd-t/contracts/` for this module. If not, create one with:
   - TypeScript interfaces for all data models
   - API endpoint definitions
   - Input/output types

3. Build the module following these conventions:
   - **API routes**: `src/app/api/[module]/route.ts`
   - **Clinic pages**: `src/app/clinic/[module]/page.tsx`
   - **Patient pages**: `src/app/patient/[module]/page.tsx`
   - **Admin pages**: `src/app/admin/[module]/page.tsx`
   - **Components**: `src/components/[module]/`
   - **Types**: `src/types/[module].ts`
   - **Utilities**: `src/lib/[module].ts`

4. Ensure multi-tenant isolation — all queries scoped to clinic tenant.

5. Update `.gsd-t/progress.md` after building.

## Module Feature Specs

### Appointment Management
- Create/Edit/Cancel/Reschedule appointments
- Consultation slot definition
- Multi-doctor scheduling
- Appointment history tracking

### Queue Management
- Current queue length display
- Estimated waiting time calculation
- Queue position tracking
- Doctor availability status

### Billing & Transactions
- Invoice generation
- Payment recording
- Payment history
- Downloadable receipts

### Patient Portal
- View appointments
- Visit history
- Prescriptions
- Download invoices
- Payment transactions
- Queue tracking
