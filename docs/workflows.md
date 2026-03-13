# Workflows — CliniqAI

## Patient Journeys

### Book Appointment via AI Voice Call
1. Patient calls clinic number
2. AI voice receptionist answers (in patient's preferred language)
3. AI identifies patient (new or returning — phone number lookup)
4. If new → AI collects registration details (name, age, phone)
5. AI provides available slots for requested doctor/specialty
6. Patient selects slot
7. AI confirms booking
8. Patient receives WhatsApp confirmation with appointment details
9. If no slots → AI offers waitlist or next available date

### Book Appointment via WhatsApp (Phase 2)
1. Patient sends message to clinic WhatsApp number
2. AI chatbot greets and identifies patient
3. Patient types or selects "Book Appointment"
4. AI shows available doctors and slots (interactive list)
5. Patient selects doctor and time
6. AI confirms booking
7. Patient receives WhatsApp confirmation with calendar link
8. If no slots → AI adds to waitlist, notifies on cancellation

### Book Appointment via Patient Portal
1. Patient logs into patient portal
2. Selects clinic and doctor
3. Views available time slots
4. Books appointment
5. Receives WhatsApp + email confirmation
6. Appointment appears in portal dashboard

### Check Queue Status (Multi-Channel)
1. Patient calls clinic, opens portal, or sends WhatsApp message
2. AI/portal shows current queue position and estimated wait time
3. As queue advances, patient receives WhatsApp alerts:
   - "3 patients ahead of you — estimated 20 min"
   - "You're next! Please head to the clinic."
4. Patient checks in (QR scan, staff check-in, or geofencing auto-detect in Phase 3)

### Cancel / Reschedule Appointment
1. Patient uses portal, WhatsApp, or voice call
2. AI confirms cancellation or offers alternative slots
3. If cancellation → waitlisted patient auto-notified of open slot
4. Updated confirmation sent via WhatsApp

### Pay for Consultation
1. After consultation, doctor/staff generates invoice
2. Patient receives invoice via portal and WhatsApp
3. Patient pays online (UPI, card, wallet via Razorpay)
4. Payment confirmation sent via WhatsApp
5. Digital receipt available in portal for download
6. If unpaid → automated payment reminders at 1 day, 3 days, 7 days

### View Prescriptions
1. Doctor generates digital prescription during/after consultation
2. Prescription stored in patient portal
3. Patient receives prescription via WhatsApp (PDF or structured message)
4. Patient can print prescription from portal (print-friendly view)

### Post-Visit Feedback (Phase 2)
1. 2 hours after consultation, patient receives WhatsApp survey
2. Patient rates: doctor (1-5), staff (1-5), wait experience (1-5)
3. Optional free-text comment
4. If satisfaction >= 4 → prompt for Google Review with direct link
5. Feedback aggregated in clinic analytics dashboard

### Family Member Management (Phase 3)
1. Patient adds family member from portal (name, relationship, DOB)
2. Family member appears in shared appointment calendar
3. Patient can book, cancel, and pay for family member appointments
4. Family members can optionally get their own login (caregiver delegation)

---

## Doctor Workflows

### Daily Workflow
1. Doctor logs into dashboard
2. Views today's appointments across all clinics (consolidated)
3. Reviews patient symptom intake summaries (AI-generated)
4. Starts consultation
5. During consultation: records notes, generates prescription
6. Generates invoice (auto-calculated from services provided)
7. Reviews AI follow-up suggestions
8. Approves/modifies follow-up schedule

### Generate Prescription
1. Doctor selects patient from current consultation
2. Enters medications (drug, dosage, frequency, duration)
3. Adds instructions and warnings
4. Signs prescription digitally (e-signature)
5. Prescription auto-sent to patient via WhatsApp and portal
6. Prescription stored in patient health records

### Telemedicine Consultation (Phase 2)
1. Appointment marked as "Video Consultation"
2. Doctor clicks "Start Video Call" from dashboard
3. Patient receives WhatsApp link to join (one-tap join, no app needed)
4. Video consultation proceeds
5. Doctor records notes, generates prescription (same as in-person)
6. If recording enabled (with patient consent) → stored in records

### Review Patient History
1. Doctor opens patient profile
2. Sees timeline: past visits, prescriptions, lab results, vitals
3. AI-generated summary: "Last visit 3 months ago for hypertension. BP trending down. Current medications: Amlodipine 5mg."
4. Doctor has full context before consultation begins

### Referral to Specialist (Phase 3)
1. Doctor initiates referral from consultation
2. Selects specialty and optionally a specific doctor
3. AI suggests best-fit specialist (location, insurance, availability)
4. Referral note attached with patient summary
5. Patient notified via WhatsApp with specialist details
6. Referring doctor receives status updates on referral

---

## Clinic Staff Workflows

### Register Walk-in Patient
1. Staff opens registration form
2. Enters patient details (name, phone, DOB, address)
3. System checks for existing patient (phone number match)
4. If new → patient created, QR health card generated
5. Patient added to queue
6. Patient receives WhatsApp welcome message with portal link

### Manage Queue
1. Staff views real-time queue on dashboard
2. Checks in patients as they arrive (or auto-check-in via QR/geofencing)
3. Marks no-shows after grace period (queue auto-advances)
4. Can manually reorder queue for priority cases (emergency, elderly)
5. Queue updates pushed to all waiting patients in real-time

### Process Payment
1. After consultation, staff reviews invoice (auto-generated or manual)
2. Applies discounts if applicable
3. Selects payment method: cash, UPI, card, online
4. Records payment
5. Receipt auto-generated and sent to patient
6. For insurance patients → split billing: insurance portion + patient portion

---

## Clinic Owner Workflows

### Onboard New Clinic
1. Owner signs up on CliniqAI platform
2. Configures clinic details: name, address, timings, specialties
3. Adds doctors (name, specialty, consultation hours, fees)
4. Adds staff members with role assignments
5. Configures AI receptionist: greeting script, business hours, after-hours message
6. Connects WhatsApp Business number
7. Connects payment gateway (Razorpay)
8. AI receptionist starts handling calls within 30 minutes

### Review Analytics (Phase 2)
1. Owner opens analytics dashboard
2. Views: daily revenue, appointment count, no-show rate, avg wait time
3. Compares performance across branches (if multi-clinic)
4. Reviews patient satisfaction scores (NPS) per doctor
5. Sees AI receptionist performance: calls handled, resolution rate
6. Exports reports for tax/compliance purposes

### Send Campaign (Phase 3)
1. Owner selects campaign type: health awareness, checkup reminder, re-engagement
2. Selects audience: all patients, specific condition, inactive > 6 months
3. Composes message (templates available)
4. Sends via WhatsApp/SMS
5. Tracks delivery, open rate, appointment conversion

---

## AI Communication Hub Workflows

### Inbound Call Handling
```
Call Received
    │
    ├─ Identify caller (phone number lookup)
    │   ├─ Known patient → greet by name, show history
    │   └─ Unknown → ask for name, offer registration
    │
    ├─ Understand intent (NLU)
    │   ├─ Book appointment
    │   ├─ Cancel/reschedule
    │   ├─ Check queue status
    │   ├─ General inquiry (timings, address, services)
    │   └─ Urgent/emergency → escalate to human staff
    │
    ├─ Execute action
    │   ├─ Search available slots
    │   ├─ Confirm booking
    │   └─ Send WhatsApp confirmation
    │
    └─ Post-call
        ├─ Log conversation
        ├─ Update analytics (duration, outcome, sentiment)
        └─ If unresolved → create task for staff follow-up
```

### WhatsApp Chatbot Flow (Phase 2)
```
Message Received
    │
    ├─ Identify patient (phone number)
    │
    ├─ Parse intent
    │   ├─ "Book" → show doctors + available slots (interactive buttons)
    │   ├─ "Queue" → show current position + wait time
    │   ├─ "Pay" → send payment link (Razorpay)
    │   ├─ "Prescription" → send last prescription PDF
    │   ├─ "Cancel" → confirm + process cancellation
    │   └─ Free text → NLU classification → route appropriately
    │
    ├─ Multi-turn conversation support
    │   └─ Context maintained across messages within session
    │
    └─ Escalation to human staff if AI confidence < threshold
```

### AI Triage Flow (Phase 3)
```
Patient requests appointment
    │
    ├─ AI asks: "Can you describe your symptoms?"
    │
    ├─ Patient describes symptoms (voice/text)
    │
    ├─ AI classifies urgency:
    │   ├─ EMERGENCY → "Please call 108 or visit nearest ER immediately"
    │   ├─ URGENT → book same-day slot, flag for doctor
    │   ├─ ROUTINE → book next available slot
    │   └─ FOLLOW-UP → suggest appropriate follow-up timing
    │
    ├─ AI generates structured symptom summary for doctor
    │
    └─ Summary attached to appointment record
```

---

## Technical Processes

### Notification Delivery Pipeline
```
Trigger Event (appointment booked, queue update, payment due, etc.)
    │
    ├─ Template Selection (based on event type + patient language)
    │
    ├─ Channel Selection:
    │   ├─ Primary: WhatsApp (95% open rate)
    │   ├─ Fallback: SMS (if WhatsApp undelivered after 1 hour)
    │   └─ Also: Push notification (if app installed), Email
    │
    ├─ Delivery + Status Tracking (sent, delivered, read, failed)
    │
    └─ Retry logic: 3 attempts with exponential backoff
```

### Payment Processing Flow
```
Invoice Generated
    │
    ├─ Patient receives payment link (portal + WhatsApp)
    │
    ├─ Patient selects method: UPI / Card / Wallet / Net Banking
    │
    ├─ Razorpay processes payment
    │
    ├─ Webhook confirms payment
    │   ├─ SUCCESS → update invoice, send receipt, log transaction
    │   └─ FAILURE → notify patient, log error, retry prompt
    │
    └─ Automated reminders for unpaid invoices (1d, 3d, 7d)
```
