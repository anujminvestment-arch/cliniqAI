# /db-schema — Database Schema Design

Design or update database schema for CliniqAI modules.

## Instructions

1. Identify the module/domain the user wants to create schema for.

2. Check existing contracts in `.gsd-t/contracts/` and types in `src/types/` for related interfaces.

3. Design the schema following multi-tenant principles:
   - Every table must have a `clinic_id` (tenant identifier) column
   - All queries must filter by `clinic_id`
   - Use UUIDs for primary keys
   - Include `created_at` and `updated_at` timestamps
   - Soft delete with `deleted_at` where appropriate

4. Create the schema definition in the project's ORM format (Prisma/Drizzle — use whatever is configured).

5. Define relationships between entities properly.

## Core Entity Reference

### Clinic (Tenant)
- id, name, address, phone, email, timings, settings

### Doctor
- id, clinic_id, name, specialization, schedule, status

### Patient
- id, clinic_id, name, phone, email, dob, medical_history

### Appointment
- id, clinic_id, doctor_id, patient_id, date, time_slot, status, type, notes

### Queue Entry
- id, clinic_id, doctor_id, patient_id, appointment_id, position, status, estimated_wait

### Invoice
- id, clinic_id, patient_id, appointment_id, amount, status, items, paid_at

### Payment
- id, clinic_id, invoice_id, amount, method, transaction_ref, paid_at

### Prescription
- id, clinic_id, doctor_id, patient_id, appointment_id, medications, notes

### Staff
- id, clinic_id, name, role, email, phone, permissions

## Multi-Tenant Rules
- Never allow cross-tenant data access
- Tenant ID must come from authenticated session, not client input
- Index on `clinic_id` for all tenant-scoped tables
- Consider row-level security if using PostgreSQL
