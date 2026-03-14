# /add-page — Create a New Page

Create a new page in the CliniqAI platform.

## Instructions

1. Determine which portal the page belongs to:
   - `/admin/*` — Super Admin portal (platform management)
   - `/clinic/*` — Clinic Admin portal (clinic operations)
   - `/patient/*` — Patient portal (patient-facing)
   - `/(auth)/*` — Authentication pages

2. Create the page at the correct path following Next.js App Router:
   - `src/app/[portal]/[feature]/page.tsx`

3. Page must include:
   - TypeScript with proper types
   - Responsive layout using existing UI components from `src/components/ui/`
   - Breadcrumb navigation where appropriate
   - Loading state (create `loading.tsx` if needed)
   - Use existing shared components from `src/components/shared/`

4. Follow existing portal layout patterns:
   - Admin pages use the admin sidebar layout (`src/app/admin/layout.tsx`)
   - Clinic pages use the clinic sidebar layout (`src/app/clinic/layout.tsx`)
   - Patient pages use the patient layout (`src/app/patient/layout.tsx`)

5. If the page needs data, create mock data in `src/lib/mock-data.ts` until the API is ready.

## Portal Page Reference

### Admin Portal
- Dashboard, Clinics, Users, Subscriptions, AI Analytics, Settings

### Clinic Portal
- Dashboard, Appointments, Patients, Queue, Billing, Branches, Staff, AI Settings

### Patient Portal
- Dashboard, Appointments, Book, Queue, Records, Prescriptions, Billing
