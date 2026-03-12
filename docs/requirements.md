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

### AI Symptom Intake (Post-MVP)
- [ ] Capture symptoms before consultation
- [ ] Provide structured summary to doctor

### AI Doctor Assistant (Post-MVP)
- [ ] Suggest possible diagnoses
- [ ] Provide recommendations (not final diagnosis)

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
| Doctor       | Manage clinics, patient records, configure follow-ups         |
| Clinic Staff | Register patients, schedule appointments, manage queue        |
| Patient      | Book appointments, view records, track queue, view transactions|

## MVP Scope

1. Multi-tenant clinic system
2. Appointment management
3. Queue tracking
4. AI call booking
5. Doctor dashboard
6. Patient portal
7. Billing system
