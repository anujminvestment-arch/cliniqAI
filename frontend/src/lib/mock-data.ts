export const platformStats = {
  totalClinics: 248,
  activePatients: 15420,
  totalAppointments: 8640,
  monthlyRevenue: 124500,
  aiCallsHandled: 3280,
  avgCallDuration: "2m 34s",
};

export const revenueData = [
  { month: "Jul", revenue: 68000, clinics: 180 },
  { month: "Aug", revenue: 79000, clinics: 195 },
  { month: "Sep", revenue: 86000, clinics: 210 },
  { month: "Oct", revenue: 95000, clinics: 225 },
  { month: "Nov", revenue: 110000, clinics: 238 },
  { month: "Dec", revenue: 124500, clinics: 248 },
];

export const clinicsList = [
  { id: "c1", name: "SmileCare Dental", plan: "Professional", doctors: 4, patients: 820, status: "active", city: "Mumbai" },
  { id: "c2", name: "HealthFirst Clinic", plan: "Enterprise", doctors: 12, patients: 2400, status: "active", city: "Delhi" },
  { id: "c3", name: "BrightEyes Optics", plan: "Basic", doctors: 2, patients: 340, status: "active", city: "Pune" },
  { id: "c4", name: "DermGlow Skin Center", plan: "Professional", doctors: 3, patients: 560, status: "pending", city: "Bangalore" },
  { id: "c5", name: "PediaCare Children", plan: "Professional", doctors: 5, patients: 1100, status: "active", city: "Chennai" },
  { id: "c6", name: "OrthoPlus Bone Clinic", plan: "Basic", doctors: 2, patients: 280, status: "suspended", city: "Hyderabad" },
];

export const usersList = [
  { id: "u1", name: "Dr. Priya Sharma", email: "priya@smilecare.com", role: "Doctor", clinic: "SmileCare Dental", status: "active", lastActive: "2 hours ago" },
  { id: "u2", name: "Dr. Rajesh Kumar", email: "rajesh@healthfirst.com", role: "Doctor", clinic: "HealthFirst Clinic", status: "active", lastActive: "30 min ago" },
  { id: "u3", name: "Anika Patel", email: "anika@healthfirst.com", role: "Staff", clinic: "HealthFirst Clinic", status: "active", lastActive: "1 hour ago" },
  { id: "u4", name: "Vikram Singh", email: "vikram@patient.com", role: "Patient", clinic: "SmileCare Dental", status: "active", lastActive: "3 hours ago" },
  { id: "u5", name: "Meera Joshi", email: "meera@dermglow.com", role: "Doctor", clinic: "DermGlow Skin Center", status: "pending", lastActive: "1 day ago" },
  { id: "u6", name: "Arjun Rao", email: "arjun@orthoplus.com", role: "Staff", clinic: "OrthoPlus Bone Clinic", status: "suspended", lastActive: "5 days ago" },
];

export const subscriptionPlans = [
  { name: "Basic", price: 2999, clinics: 86, features: ["1 clinic", "2 doctors", "500 patients", "100 AI calls/mo"] },
  { name: "Professional", price: 7999, clinics: 124, features: ["5 clinics", "10 doctors", "2000 patients", "500 AI calls/mo", "SMS follow-ups"] },
  { name: "Enterprise", price: 19999, clinics: 38, features: ["Unlimited clinics", "Unlimited doctors", "Unlimited patients", "Unlimited AI calls", "Priority support", "Custom integrations"] },
];

export const clinicDashboard = {
  todayAppointments: 24,
  queueLength: 8,
  avgWaitTime: "18 min",
  completedToday: 16,
  revenue: 42500,
  followUps: 12,
};

export const appointmentsList = [
  { id: "a1", patient: "Vikram Singh", doctor: "Dr. Priya Sharma", time: "09:00 AM", date: "2026-03-12", type: "Checkup", status: "confirmed" },
  { id: "a2", patient: "Neha Gupta", doctor: "Dr. Priya Sharma", time: "09:30 AM", date: "2026-03-12", type: "Root Canal", status: "in-progress" },
  { id: "a3", patient: "Rahul Mehra", doctor: "Dr. Amit Patel", time: "10:00 AM", date: "2026-03-12", type: "Cleaning", status: "waiting" },
  { id: "a4", patient: "Sonal Desai", doctor: "Dr. Amit Patel", time: "10:30 AM", date: "2026-03-12", type: "Consultation", status: "confirmed" },
  { id: "a5", patient: "Karan Malhotra", doctor: "Dr. Priya Sharma", time: "11:00 AM", date: "2026-03-12", type: "Follow-up", status: "confirmed" },
  { id: "a6", patient: "Ananya Iyer", doctor: "Dr. Priya Sharma", time: "11:30 AM", date: "2026-03-12", type: "Extraction", status: "confirmed" },
  { id: "a7", patient: "Deepak Nair", doctor: "Dr. Amit Patel", time: "12:00 PM", date: "2026-03-12", type: "Checkup", status: "cancelled" },
];

export const queueData = [
  { position: 1, patient: "Neha Gupta", doctor: "Dr. Priya Sharma", type: "Root Canal", waitTime: "In Progress", status: "in-progress" },
  { position: 2, patient: "Rahul Mehra", doctor: "Dr. Amit Patel", type: "Cleaning", waitTime: "5 min", status: "waiting" },
  { position: 3, patient: "Sonal Desai", doctor: "Dr. Amit Patel", type: "Consultation", waitTime: "20 min", status: "waiting" },
  { position: 4, patient: "Karan Malhotra", doctor: "Dr. Priya Sharma", type: "Follow-up", waitTime: "35 min", status: "waiting" },
  { position: 5, patient: "Ananya Iyer", doctor: "Dr. Priya Sharma", type: "Extraction", waitTime: "50 min", status: "waiting" },
];

export const patientsList = [
  { id: "p1", name: "Vikram Singh", phone: "+91 98765 43210", age: 34, gender: "Male", lastVisit: "2026-03-10", visits: 8, balance: 0 },
  { id: "p2", name: "Neha Gupta", phone: "+91 87654 32109", age: 28, gender: "Female", lastVisit: "2026-03-12", visits: 3, balance: 1500 },
  { id: "p3", name: "Rahul Mehra", phone: "+91 76543 21098", age: 45, gender: "Male", lastVisit: "2026-03-08", visits: 12, balance: 0 },
  { id: "p4", name: "Sonal Desai", phone: "+91 65432 10987", age: 31, gender: "Female", lastVisit: "2026-03-05", visits: 5, balance: 3200 },
  { id: "p5", name: "Karan Malhotra", phone: "+91 54321 09876", age: 52, gender: "Male", lastVisit: "2026-03-01", visits: 15, balance: 0 },
];

export const doctorsList = [
  { id: "d1", name: "Dr. Priya Sharma", specialization: "Orthodontics", patients: 420, schedule: "Mon-Sat 9AM-5PM", status: "available" },
  { id: "d2", name: "Dr. Amit Patel", specialization: "General Dentistry", patients: 380, schedule: "Mon-Fri 10AM-6PM", status: "in-consultation" },
  { id: "d3", name: "Dr. Sneha Reddy", specialization: "Periodontics", patients: 260, schedule: "Tue-Sat 9AM-3PM", status: "off-duty" },
];

export const staffList = [
  { id: "s1", name: "Anika Patel", role: "Receptionist", phone: "+91 98765 11111", shift: "Morning", status: "active" },
  { id: "s2", name: "Rohit Verma", role: "Dental Hygienist", phone: "+91 98765 22222", shift: "Full Day", status: "active" },
  { id: "s3", name: "Preethi Nair", role: "Billing Clerk", phone: "+91 98765 33333", shift: "Morning", status: "on-leave" },
];

export const invoicesList = [
  { id: "INV-001", patient: "Vikram Singh", date: "2026-03-10", amount: 3500, status: "paid", items: "Root Canal Treatment" },
  { id: "INV-002", patient: "Neha Gupta", date: "2026-03-12", amount: 1500, status: "pending", items: "Consultation + X-Ray" },
  { id: "INV-003", patient: "Rahul Mehra", date: "2026-03-08", amount: 800, status: "paid", items: "Dental Cleaning" },
  { id: "INV-004", patient: "Sonal Desai", date: "2026-03-05", amount: 5200, status: "overdue", items: "Crown Placement" },
  { id: "INV-005", patient: "Karan Malhotra", date: "2026-03-01", amount: 2000, status: "paid", items: "Follow-up + Medication" },
];

export const branchesList = [
  { id: "b1", name: "SmileCare Main", address: "123 MG Road, Mumbai", doctors: 3, timing: "9AM - 8PM", status: "open" },
  { id: "b2", name: "SmileCare Andheri", address: "45 Link Road, Andheri", doctors: 2, timing: "10AM - 7PM", status: "open" },
  { id: "b3", name: "SmileCare Thane", address: "78 Station Road, Thane", doctors: 1, timing: "9AM - 5PM", status: "closed" },
];

export const aiCallAnalytics = [
  { date: "Mar 6", calls: 42, booked: 28, duration: "2m 20s" },
  { date: "Mar 7", calls: 56, booked: 38, duration: "2m 45s" },
  { date: "Mar 8", calls: 38, booked: 24, duration: "2m 10s" },
  { date: "Mar 9", calls: 61, booked: 44, duration: "2m 55s" },
  { date: "Mar 10", calls: 48, booked: 31, duration: "2m 30s" },
  { date: "Mar 11", calls: 52, booked: 35, duration: "2m 40s" },
  { date: "Mar 12", calls: 45, booked: 30, duration: "2m 25s" },
];

export const patientPortal = {
  upcomingAppointments: [
    { id: "pa1", doctor: "Dr. Priya Sharma", clinic: "SmileCare Main", date: "2026-03-15", time: "10:00 AM", type: "Follow-up" },
    { id: "pa2", doctor: "Dr. Amit Patel", clinic: "SmileCare Andheri", date: "2026-03-22", time: "2:30 PM", type: "Cleaning" },
  ],
  pastAppointments: [
    { id: "pa3", doctor: "Dr. Priya Sharma", clinic: "SmileCare Main", date: "2026-03-10", time: "9:00 AM", type: "Root Canal", notes: "Stage 1 completed" },
    { id: "pa4", doctor: "Dr. Priya Sharma", clinic: "SmileCare Main", date: "2026-02-28", time: "11:00 AM", type: "Consultation", notes: "X-ray taken" },
    { id: "pa5", doctor: "Dr. Sneha Reddy", clinic: "SmileCare Main", date: "2026-02-15", time: "3:00 PM", type: "Cleaning", notes: "Regular cleaning done" },
  ],
  prescriptions: [
    { id: "rx1", date: "2026-03-10", doctor: "Dr. Priya Sharma", medicines: ["Amoxicillin 500mg - 3x/day", "Ibuprofen 400mg - as needed"], notes: "Take after meals for 5 days" },
    { id: "rx2", date: "2026-02-28", doctor: "Dr. Priya Sharma", medicines: ["Chlorhexidine Mouthwash - 2x/day"], notes: "Use for 2 weeks" },
  ],
  invoices: [
    { id: "INV-P01", date: "2026-03-10", amount: 3500, status: "paid", description: "Root Canal Stage 1" },
    { id: "INV-P02", date: "2026-02-28", amount: 1200, status: "paid", description: "Consultation + X-Ray" },
    { id: "INV-P03", date: "2026-02-15", amount: 800, status: "paid", description: "Dental Cleaning" },
  ],
  queueStatus: { position: 3, doctor: "Dr. Priya Sharma", estimatedWait: "25 min", ahead: 2 },
};

export const availableSlots = [
  { date: "2026-03-15", slots: ["09:00 AM", "09:30 AM", "11:00 AM", "02:00 PM", "03:30 PM", "04:00 PM"] },
  { date: "2026-03-16", slots: ["10:00 AM", "10:30 AM", "11:30 AM", "01:00 PM", "02:30 PM"] },
  { date: "2026-03-17", slots: ["09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:30 PM"] },
];

export const weeklyAppointments = [
  { day: "Mon", count: 28 },
  { day: "Tue", count: 32 },
  { day: "Wed", count: 25 },
  { day: "Thu", count: 30 },
  { day: "Fri", count: 35 },
  { day: "Sat", count: 22 },
];

/* ─── Patient Detail ─── */

export const patientDetails: Record<string, {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  bloodType: string;
  registeredDate: string;
  address: string;
  emergencyContact: string;
  vitals: { label: string; value: string; unit: string; status: "normal" | "warning" | "critical"; trend: "up" | "down" | "stable" }[];
  allergies: string[];
  conditions: string[];
  rootCauseAnalysis: {
    primaryDiagnosis: string;
    confidence: number;
    contributingFactors: string[];
    riskFactors: string[];
    recommendedInvestigations: string[];
  };
  transcripts: { id: string; date: string; duration: string; summary: string; topics: string[]; type: "AI Call" | "In-Person" | "Follow-up" }[];
  visitTimeline: { date: string; doctor: string; diagnosis: string; notes: string; type: string }[];
  prescriptionHistory: { id: string; date: string; doctor: string; medications: { name: string; dosage: string; frequency: string; duration: string }[]; status: "sent" | "pending" | "viewed"; notes: string }[];
  labResults: { id: string; date: string; test: string; result: string; normalRange: string; status: "normal" | "abnormal" }[];
}> = {
  p1: {
    id: "p1",
    name: "Vikram Singh",
    age: 34,
    gender: "Male",
    phone: "+91 98765 43210",
    email: "vikram.singh@email.com",
    bloodType: "B+",
    registeredDate: "2025-06-15",
    address: "42 Pali Hill, Bandra West, Mumbai 400050",
    emergencyContact: "Meera Singh (Wife) — +91 98765 43211",
    vitals: [
      { label: "Blood Pressure", value: "128/82", unit: "mmHg", status: "warning", trend: "up" },
      { label: "Heart Rate", value: "76", unit: "bpm", status: "normal", trend: "stable" },
      { label: "Weight", value: "78.5", unit: "kg", status: "normal", trend: "up" },
      { label: "Blood Sugar", value: "142", unit: "mg/dL", status: "warning", trend: "up" },
      { label: "SpO2", value: "98", unit: "%", status: "normal", trend: "stable" },
      { label: "Temperature", value: "98.4", unit: "°F", status: "normal", trend: "stable" },
    ],
    allergies: ["Penicillin", "Sulfa drugs", "Latex"],
    conditions: ["Pre-diabetic", "Mild hypertension", "Chronic lower back pain"],
    rootCauseAnalysis: {
      primaryDiagnosis: "Pre-diabetic condition with early-stage hypertension",
      confidence: 87,
      contributingFactors: [
        "Sedentary lifestyle — desk job, less than 2000 steps/day",
        "High sodium diet — frequent restaurant meals",
        "Family history of Type 2 diabetes (father, paternal grandmother)",
        "Elevated stress levels — work-related, poor sleep hygiene",
      ],
      riskFactors: [
        "BMI 26.8 (overweight category)",
        "Fasting glucose trending upward over 6 months",
        "LDL cholesterol borderline high (142 mg/dL)",
        "Age bracket (30-40) with family history",
      ],
      recommendedInvestigations: [
        "HbA1c test (3-month glucose average)",
        "Comprehensive lipid panel",
        "24-hour ambulatory blood pressure monitoring",
        "Renal function panel",
        "Thyroid function test (TSH, T3, T4)",
      ],
    },
    transcripts: [
      { id: "t1", date: "2026-03-10", duration: "3m 42s", summary: "Patient called to reschedule root canal follow-up. Mentioned mild pain in lower left molar. AI recommended earlier appointment due to pain report.", topics: ["Appointment Rescheduling", "Pain Report", "Root Canal Follow-up"], type: "AI Call" },
      { id: "t2", date: "2026-03-05", duration: "2m 18s", summary: "Routine follow-up call. Patient confirmed medication adherence. Blood sugar readings shared — averaging 138 mg/dL fasting.", topics: ["Medication Adherence", "Blood Sugar Update", "Routine Check"], type: "AI Call" },
      { id: "t3", date: "2026-02-20", duration: "15m 00s", summary: "In-person consultation for persistent lower back pain. Physical examination revealed tight hip flexors and weak core. Referred to physiotherapy.", topics: ["Back Pain", "Physical Examination", "Physiotherapy Referral"], type: "In-Person" },
      { id: "t4", date: "2026-02-10", duration: "4m 15s", summary: "AI follow-up call post dental cleaning. No complications reported. Reminded about upcoming blood work.", topics: ["Post-procedure Follow-up", "Lab Reminder"], type: "Follow-up" },
    ],
    visitTimeline: [
      { date: "2026-03-10", doctor: "Dr. Priya Sharma", diagnosis: "Root Canal Stage 1", notes: "Procedure completed successfully. Temporary filling placed. Follow-up in 2 weeks.", type: "Procedure" },
      { date: "2026-02-28", doctor: "Dr. Priya Sharma", diagnosis: "Dental Consultation", notes: "X-ray taken. Decay identified in tooth #19. Root canal recommended.", type: "Consultation" },
      { date: "2026-02-20", doctor: "Dr. Amit Patel", diagnosis: "Lower Back Pain", notes: "Chronic LBP. Core strengthening exercises prescribed. Physiotherapy 2x/week.", type: "Consultation" },
      { date: "2026-02-15", doctor: "Dr. Sneha Reddy", diagnosis: "Regular Cleaning", notes: "Routine dental cleaning. Mild gingivitis noted. Improved brushing technique advised.", type: "Routine" },
      { date: "2026-01-20", doctor: "Dr. Amit Patel", diagnosis: "General Checkup", notes: "Blood pressure slightly elevated. Blood work ordered. Follow-up in 4 weeks.", type: "Checkup" },
    ],
    prescriptionHistory: [
      { id: "rx1", date: "2026-03-10", doctor: "Dr. Priya Sharma", medications: [{ name: "Amoxicillin", dosage: "500mg", frequency: "3x/day", duration: "5 days" }, { name: "Ibuprofen", dosage: "400mg", frequency: "As needed", duration: "3 days" }], status: "viewed", notes: "Take after meals. Avoid cold beverages." },
      { id: "rx2", date: "2026-02-28", doctor: "Dr. Priya Sharma", medications: [{ name: "Chlorhexidine Mouthwash", dosage: "10ml", frequency: "2x/day", duration: "2 weeks" }], status: "viewed", notes: "Use 30 min after brushing." },
      { id: "rx3", date: "2026-02-20", doctor: "Dr. Amit Patel", medications: [{ name: "Diclofenac Gel", dosage: "Apply thin layer", frequency: "2x/day", duration: "2 weeks" }, { name: "Thiocolchicoside", dosage: "4mg", frequency: "2x/day", duration: "5 days" }], status: "sent", notes: "Apply gel to lower back. Avoid heavy lifting." },
    ],
    labResults: [
      { id: "lr1", date: "2026-03-01", test: "Fasting Blood Glucose", result: "142 mg/dL", normalRange: "70-100 mg/dL", status: "abnormal" },
      { id: "lr2", date: "2026-03-01", test: "HbA1c", result: "6.1%", normalRange: "< 5.7%", status: "abnormal" },
      { id: "lr3", date: "2026-03-01", test: "Total Cholesterol", result: "218 mg/dL", normalRange: "< 200 mg/dL", status: "abnormal" },
      { id: "lr4", date: "2026-03-01", test: "HDL Cholesterol", result: "48 mg/dL", normalRange: "> 40 mg/dL", status: "normal" },
      { id: "lr5", date: "2026-03-01", test: "LDL Cholesterol", result: "142 mg/dL", normalRange: "< 130 mg/dL", status: "abnormal" },
      { id: "lr6", date: "2026-03-01", test: "Creatinine", result: "0.9 mg/dL", normalRange: "0.7-1.3 mg/dL", status: "normal" },
      { id: "lr7", date: "2026-01-15", test: "Complete Blood Count", result: "Normal", normalRange: "—", status: "normal" },
    ],
  },
  p2: {
    id: "p2",
    name: "Neha Gupta",
    age: 28,
    gender: "Female",
    phone: "+91 87654 32109",
    email: "neha.gupta@email.com",
    bloodType: "A+",
    registeredDate: "2025-11-20",
    address: "15 Koramangala, Bangalore 560034",
    emergencyContact: "Amit Gupta (Brother) — +91 87654 32110",
    vitals: [
      { label: "Blood Pressure", value: "118/75", unit: "mmHg", status: "normal", trend: "stable" },
      { label: "Heart Rate", value: "72", unit: "bpm", status: "normal", trend: "stable" },
      { label: "Weight", value: "58.2", unit: "kg", status: "normal", trend: "stable" },
      { label: "Blood Sugar", value: "94", unit: "mg/dL", status: "normal", trend: "stable" },
      { label: "SpO2", value: "99", unit: "%", status: "normal", trend: "stable" },
      { label: "Temperature", value: "98.6", unit: "°F", status: "normal", trend: "stable" },
    ],
    allergies: ["Aspirin"],
    conditions: ["Mild anxiety"],
    rootCauseAnalysis: {
      primaryDiagnosis: "Dental caries requiring root canal treatment",
      confidence: 94,
      contributingFactors: [
        "Delayed dental care — no check-up for 18 months",
        "High sugar intake — self-reported frequent snacking",
        "Inadequate flossing routine",
      ],
      riskFactors: [
        "Previous history of dental caries (2 fillings)",
        "Irregular dental visit pattern",
      ],
      recommendedInvestigations: [
        "Full-mouth dental X-ray (OPG)",
        "Periodic dental check-up every 6 months",
      ],
    },
    transcripts: [
      { id: "t5", date: "2026-03-12", duration: "2m 50s", summary: "Patient called for root canal appointment confirmation. Expressed anxiety about the procedure. AI provided reassurance and pre-procedure instructions.", topics: ["Appointment Confirmation", "Patient Anxiety", "Pre-procedure Info"], type: "AI Call" },
    ],
    visitTimeline: [
      { date: "2026-03-12", doctor: "Dr. Priya Sharma", diagnosis: "Root Canal - In Progress", notes: "Procedure underway. Local anesthesia administered.", type: "Procedure" },
      { date: "2026-03-01", doctor: "Dr. Priya Sharma", diagnosis: "Dental Consultation", notes: "Deep cavity in tooth #14. Root canal scheduled.", type: "Consultation" },
    ],
    prescriptionHistory: [
      { id: "rx4", date: "2026-03-01", doctor: "Dr. Priya Sharma", medications: [{ name: "Ketorolac", dosage: "10mg", frequency: "As needed", duration: "2 days" }], status: "viewed", notes: "For pain management before procedure." },
    ],
    labResults: [
      { id: "lr8", date: "2026-02-15", test: "Complete Blood Count", result: "Normal", normalRange: "—", status: "normal" },
    ],
  },
};

/* ─── Clinic Prescriptions ─── */

export const clinicPrescriptions = [
  { id: "rx-001", patientId: "p1", patient: "Vikram Singh", doctor: "Dr. Priya Sharma", date: "2026-03-10", medications: ["Amoxicillin 500mg", "Ibuprofen 400mg"], status: "viewed" as const, notes: "Post root canal care" },
  { id: "rx-002", patientId: "p2", patient: "Neha Gupta", doctor: "Dr. Priya Sharma", date: "2026-03-12", medications: ["Ketorolac 10mg", "Chlorhexidine Mouthwash"], status: "sent" as const, notes: "Root canal recovery" },
  { id: "rx-003", patientId: "p3", patient: "Rahul Mehra", doctor: "Dr. Sneha Reddy", date: "2026-03-08", medications: ["Fluoride Toothpaste (Rx)"], status: "viewed" as const, notes: "Sensitivity treatment" },
  { id: "rx-004", patientId: "p4", patient: "Sonal Desai", doctor: "Dr. Amit Patel", date: "2026-03-05", medications: ["Metronidazole 400mg", "Diclofenac 50mg"], status: "pending" as const, notes: "Post crown placement medication" },
  { id: "rx-005", patientId: "p5", patient: "Karan Malhotra", doctor: "Dr. Priya Sharma", date: "2026-03-01", medications: ["Amoxicillin 250mg", "Pantoprazole 40mg", "B-Complex"], status: "viewed" as const, notes: "Follow-up medication" },
  { id: "rx-006", patientId: "p1", patient: "Vikram Singh", doctor: "Dr. Amit Patel", date: "2026-02-20", medications: ["Diclofenac Gel", "Thiocolchicoside 4mg"], status: "sent" as const, notes: "Back pain management" },
  { id: "rx-007", patientId: "p3", patient: "Rahul Mehra", doctor: "Dr. Priya Sharma", date: "2026-02-18", medications: ["Sensodyne Repair (Rx)"], status: "pending" as const, notes: "Desensitizing treatment" },
];

/* ─── Consultations & Transcripts ─── */

export const consultationsList = [
  {
    id: "con-001",
    patient: "Vikram Singh",
    patientId: "p1",
    doctor: "Dr. Priya Sharma",
    date: "2026-03-10",
    duration: "22 min",
    type: "In-Person" as const,
    summary: "Root canal Stage 1 completed on tooth #19. Patient tolerated procedure well. Temporary filling placed. Prescribed antibiotics and pain management.",
    symptoms: ["Tooth pain (lower left)", "Sensitivity to hot/cold", "Mild swelling"],
    suggestedDiagnosis: "Irreversible pulpitis — tooth #19",
    transcript: "Dr: Good morning Vikram, how has the pain been since our last visit?\nPatient: It's been getting worse, especially at night. Cold water makes it really sharp.\nDr: Let me take a look... I can see the decay has progressed into the pulp. We'll proceed with the root canal today.\nPatient: Okay, I'm a bit nervous but let's do it.\nDr: Don't worry, we'll make sure you're completely numb first. You won't feel any pain during the procedure.\n[Procedure notes: Local anesthesia administered. Access cavity prepared. Working length determined. Canals cleaned and shaped. Calcium hydroxide dressing placed. Temporary restoration.]\nDr: All done! The first stage went very well. I'm prescribing antibiotics and a painkiller. Come back in two weeks for the second stage.",
    doctorNotes: "Straightforward root canal. Two canals identified. Good prognosis. Patient to return for obturation.",
  },
  {
    id: "con-002",
    patient: "Neha Gupta",
    patientId: "p2",
    doctor: "Dr. Priya Sharma",
    date: "2026-03-12",
    duration: "18 min",
    type: "In-Person" as const,
    summary: "Initial root canal consultation. Deep cavity in tooth #14 confirmed via X-ray. Patient anxious — detailed procedure explanation provided.",
    symptoms: ["Persistent toothache", "Pain when biting", "Gum tenderness"],
    suggestedDiagnosis: "Deep dental caries with pulp involvement — tooth #14",
    transcript: "Dr: Hi Neha, tell me about the pain you've been experiencing.\nPatient: It started about two weeks ago. It hurts when I bite down and sometimes throbs at night.\nDr: Let me examine the area... I can see a deep cavity here. The X-ray shows it's very close to the nerve.\nPatient: Does that mean I need a root canal? I'm really scared of that.\nDr: I understand your concern. Let me explain exactly what happens — it's much gentler than most people think. We use local anesthesia so you won't feel pain.\nPatient: Okay... how long does it take?\nDr: Usually about 45 minutes to an hour. We'll schedule it for next week so you can prepare.",
    doctorNotes: "Patient has dental anxiety. Consider conscious sedation for procedure. X-ray shows periapical involvement.",
  },
  {
    id: "con-003",
    patient: "Rahul Mehra",
    patientId: "p3",
    doctor: "Dr. Sneha Reddy",
    date: "2026-03-08",
    duration: "12 min",
    type: "In-Person" as const,
    summary: "Routine dental cleaning completed. Mild calculus buildup in lower anteriors. Oral hygiene instruction provided.",
    symptoms: ["Routine visit", "Mild bleeding gums"],
    suggestedDiagnosis: "Gingivitis — mild, localized",
    transcript: "",
    doctorNotes: "Patient needs to improve flossing technique. Schedule follow-up cleaning in 6 months.",
  },
  {
    id: "con-004",
    patient: "Vikram Singh",
    patientId: "p1",
    doctor: "Dr. Amit Patel",
    date: "2026-02-20",
    duration: "15 min",
    type: "In-Person" as const,
    summary: "Consultation for chronic lower back pain. Physical examination revealed tight hip flexors and weak core muscles. Physiotherapy referral provided.",
    symptoms: ["Lower back pain (3 months)", "Stiffness in morning", "Pain worsens with sitting"],
    suggestedDiagnosis: "Mechanical lower back pain — postural",
    transcript: "",
    doctorNotes: "Recommend standing desk. Core strengthening critical. Review in 4 weeks.",
  },
  {
    id: "con-005",
    patient: "Karan Malhotra",
    patientId: "p5",
    doctor: "Dr. Priya Sharma",
    date: "2026-03-01",
    duration: "8 min",
    type: "Follow-up" as const,
    summary: "Follow-up after previous dental work. Healing well. No complications. Oral hygiene satisfactory.",
    symptoms: ["Follow-up visit"],
    suggestedDiagnosis: "Post-operative — healing normally",
    transcript: "",
    doctorNotes: "No issues. Next visit in 3 months.",
  },
];

/* ─── Follow-ups ─── */

export const followUpsList = [
  { id: "fu-001", patient: "Vikram Singh", patientId: "p1", doctor: "Dr. Priya Sharma", scheduledDate: "2026-03-24", type: "In-Person" as const, reason: "Root Canal Stage 2", status: "scheduled" as const, autoScheduled: false },
  { id: "fu-002", patient: "Neha Gupta", patientId: "p2", doctor: "Dr. Priya Sharma", scheduledDate: "2026-03-19", type: "AI Call" as const, reason: "Post-procedure check", status: "scheduled" as const, autoScheduled: true },
  { id: "fu-003", patient: "Sonal Desai", patientId: "p4", doctor: "Dr. Amit Patel", scheduledDate: "2026-03-11", type: "SMS" as const, reason: "Crown adjustment check", status: "overdue" as const, autoScheduled: true },
  { id: "fu-004", patient: "Karan Malhotra", patientId: "p5", doctor: "Dr. Priya Sharma", scheduledDate: "2026-06-01", type: "In-Person" as const, reason: "Quarterly dental check-up", status: "scheduled" as const, autoScheduled: false },
  { id: "fu-005", patient: "Rahul Mehra", patientId: "p3", doctor: "Dr. Sneha Reddy", scheduledDate: "2026-09-08", type: "In-Person" as const, reason: "6-month cleaning", status: "scheduled" as const, autoScheduled: true },
  { id: "fu-006", patient: "Vikram Singh", patientId: "p1", doctor: "Dr. Amit Patel", scheduledDate: "2026-03-20", type: "AI Call" as const, reason: "Back pain progress check", status: "scheduled" as const, autoScheduled: true },
  { id: "fu-007", patient: "Sonal Desai", patientId: "p4", doctor: "Dr. Amit Patel", scheduledDate: "2026-03-08", type: "AI Call" as const, reason: "Post-crown pain assessment", status: "completed" as const, autoScheduled: true },
];

/* ─── Clinic Reports ─── */

export const monthlyRevenueData = [
  { month: "Oct", revenue: 285000, appointments: 380, patients: 142 },
  { month: "Nov", revenue: 312000, appointments: 410, patients: 158 },
  { month: "Dec", revenue: 298000, appointments: 365, patients: 135 },
  { month: "Jan", revenue: 340000, appointments: 425, patients: 168 },
  { month: "Feb", revenue: 365000, appointments: 448, patients: 175 },
  { month: "Mar", revenue: 390000, appointments: 470, patients: 190 },
];

export const topDiagnoses = [
  { name: "Dental Caries", count: 145, percentage: 28 },
  { name: "Gingivitis", count: 98, percentage: 19 },
  { name: "Root Canal", count: 76, percentage: 15 },
  { name: "Periodontitis", count: 62, percentage: 12 },
  { name: "Crown/Bridge", count: 48, percentage: 9 },
  { name: "Extraction", count: 42, percentage: 8 },
  { name: "Others", count: 49, percentage: 9 },
];

export const doctorPerformance = [
  { name: "Dr. Priya Sharma", appointments: 185, revenue: 168000, rating: 4.9, completionRate: 96 },
  { name: "Dr. Amit Patel", appointments: 162, revenue: 142000, rating: 4.7, completionRate: 94 },
  { name: "Dr. Sneha Reddy", appointments: 123, revenue: 80000, rating: 4.8, completionRate: 98 },
];

export const busiestHours = [
  { hour: "9 AM", mon: 8, tue: 6, wed: 7, thu: 9, fri: 8, sat: 5 },
  { hour: "10 AM", mon: 10, tue: 9, wed: 8, thu: 10, fri: 11, sat: 7 },
  { hour: "11 AM", mon: 9, tue: 10, wed: 9, thu: 8, fri: 10, sat: 8 },
  { hour: "12 PM", mon: 6, tue: 7, wed: 5, thu: 6, fri: 7, sat: 4 },
  { hour: "1 PM", mon: 3, tue: 4, wed: 3, thu: 4, fri: 3, sat: 2 },
  { hour: "2 PM", mon: 7, tue: 8, wed: 7, thu: 8, fri: 9, sat: 5 },
  { hour: "3 PM", mon: 8, tue: 9, wed: 8, thu: 7, fri: 8, sat: 6 },
  { hour: "4 PM", mon: 7, tue: 6, wed: 7, thu: 8, fri: 7, sat: 4 },
  { hour: "5 PM", mon: 5, tue: 4, wed: 5, thu: 5, fri: 6, sat: 0 },
];

/* ─── Clinic Notifications ─── */

export const clinicNotifications = [
  { id: "n1", type: "appointment" as const, title: "New Appointment Booked", message: "Vikram Singh booked a follow-up for March 24, 10:00 AM with Dr. Priya Sharma", time: "5 min ago", read: false },
  { id: "n2", type: "ai-call" as const, title: "AI Call Completed", message: "AI receptionist handled call from +91 98765 43210. Appointment rescheduled successfully.", time: "12 min ago", read: false },
  { id: "n3", type: "follow-up" as const, title: "Overdue Follow-up", message: "Sonal Desai missed her crown adjustment follow-up scheduled for March 11", time: "2 hours ago", read: false },
  { id: "n4", type: "patient" as const, title: "New Patient Registered", message: "Ananya Iyer registered via QR code. Appointment scheduled for extraction.", time: "3 hours ago", read: true },
  { id: "n5", type: "billing" as const, title: "Payment Received", message: "₹3,500 payment received from Vikram Singh for INV-001 (Root Canal Treatment)", time: "5 hours ago", read: true },
  { id: "n6", type: "appointment" as const, title: "Appointment Cancelled", message: "Deepak Nair cancelled his checkup appointment for March 12, 12:00 PM", time: "6 hours ago", read: true },
  { id: "n7", type: "ai-call" as const, title: "AI Call — Booking Failed", message: "AI couldn't book appointment for caller — no available slots for requested date. Caller asked to try again.", time: "8 hours ago", read: true },
  { id: "n8", type: "follow-up" as const, title: "Follow-up Reminder Sent", message: "Automated SMS reminder sent to Karan Malhotra for June 1 appointment", time: "1 day ago", read: true },
];

/* ─── Patient Health Data ─── */

export const patientHealthData = {
  healthScore: 78,
  bpHistory: [
    { date: "Oct", systolic: 122, diastolic: 78 },
    { date: "Nov", systolic: 125, diastolic: 80 },
    { date: "Dec", systolic: 124, diastolic: 79 },
    { date: "Jan", systolic: 128, diastolic: 82 },
    { date: "Feb", systolic: 130, diastolic: 84 },
    { date: "Mar", systolic: 128, diastolic: 82 },
  ],
  weightHistory: [
    { date: "Oct", weight: 76.2 },
    { date: "Nov", weight: 77.0 },
    { date: "Dec", weight: 77.8 },
    { date: "Jan", weight: 78.1 },
    { date: "Feb", weight: 78.3 },
    { date: "Mar", weight: 78.5 },
  ],
  sugarHistory: [
    { date: "Oct", fasting: 118, postMeal: 156 },
    { date: "Nov", fasting: 125, postMeal: 162 },
    { date: "Dec", fasting: 130, postMeal: 168 },
    { date: "Jan", fasting: 135, postMeal: 172 },
    { date: "Feb", fasting: 140, postMeal: 178 },
    { date: "Mar", fasting: 142, postMeal: 180 },
  ],
  currentMedications: [
    { name: "Amoxicillin", dosage: "500mg", frequency: "3x daily", remaining: "2 days" },
    { name: "Ibuprofen", dosage: "400mg", frequency: "As needed", remaining: "1 day" },
    { name: "Chlorhexidine Mouthwash", dosage: "10ml", frequency: "2x daily", remaining: "8 days" },
  ],
  upcomingTests: [
    { test: "HbA1c", date: "2026-03-20", lab: "PathCare Diagnostics" },
    { test: "Lipid Panel", date: "2026-03-20", lab: "PathCare Diagnostics" },
    { test: "Dental X-ray (OPG)", date: "2026-03-24", lab: "SmileCare Dental" },
  ],
  doctorNotes: [
    { date: "2026-03-10", doctor: "Dr. Priya Sharma", note: "Root canal Stage 1 successful. Monitor for pain/swelling. Return in 2 weeks." },
    { date: "2026-02-20", doctor: "Dr. Amit Patel", note: "Lower back pain — postural. Start physiotherapy. Review lifestyle factors." },
  ],
};

/* ─── Patient Profile ─── */

export const patientProfile = {
  name: "Vikram Singh",
  email: "vikram.singh@email.com",
  phone: "+91 98765 43210",
  dateOfBirth: "1992-05-14",
  gender: "Male",
  bloodType: "B+",
  address: "42 Pali Hill, Bandra West, Mumbai 400050",
  emergencyContact: { name: "Meera Singh", relation: "Wife", phone: "+91 98765 43211" },
  allergies: ["Penicillin", "Sulfa drugs", "Latex"],
  conditions: ["Pre-diabetic", "Mild hypertension", "Chronic lower back pain"],
  linkedClinics: [
    { name: "SmileCare Main", doctor: "Dr. Priya Sharma", since: "2025-06-15" },
    { name: "SmileCare Andheri", doctor: "Dr. Amit Patel", since: "2025-09-10" },
  ],
  communicationPrefs: { sms: true, email: true, aiCalls: true, whatsapp: false },
};

/* ─── Admin Reports ─── */

export const adminRevenueByClinic = [
  { month: "Oct", smileCare: 285000, healthFirst: 520000, brightEyes: 98000, dermGlow: 165000, pediaCare: 310000 },
  { month: "Nov", smileCare: 312000, healthFirst: 545000, brightEyes: 105000, dermGlow: 172000, pediaCare: 325000 },
  { month: "Dec", smileCare: 298000, healthFirst: 510000, brightEyes: 92000, dermGlow: 158000, pediaCare: 315000 },
  { month: "Jan", smileCare: 340000, healthFirst: 580000, brightEyes: 110000, dermGlow: 185000, pediaCare: 340000 },
  { month: "Feb", smileCare: 365000, healthFirst: 612000, brightEyes: 118000, dermGlow: 192000, pediaCare: 355000 },
  { month: "Mar", smileCare: 390000, healthFirst: 645000, brightEyes: 125000, dermGlow: 205000, pediaCare: 370000 },
];

export const userAcquisition = [
  { month: "Oct", doctors: 12, staff: 28, patients: 1420 },
  { month: "Nov", doctors: 15, staff: 32, patients: 1680 },
  { month: "Dec", doctors: 11, staff: 25, patients: 1520 },
  { month: "Jan", doctors: 18, staff: 38, patients: 1950 },
  { month: "Feb", doctors: 22, staff: 42, patients: 2200 },
  { month: "Mar", doctors: 20, staff: 40, patients: 2100 },
];

export const topClinics = [
  { name: "HealthFirst Clinic", revenue: 3412000, patients: 2400, doctors: 12, growth: 18.2 },
  { name: "SmileCare Dental", revenue: 1990000, patients: 820, doctors: 4, growth: 14.5 },
  { name: "PediaCare Children", revenue: 2015000, patients: 1100, doctors: 5, growth: 12.8 },
  { name: "DermGlow Skin Center", revenue: 1077000, patients: 560, doctors: 3, growth: 22.1 },
  { name: "BrightEyes Optics", revenue: 648000, patients: 340, doctors: 2, growth: 8.4 },
];

/* ─── Admin Audit Logs ─── */

export const auditLogs = [
  { id: "log-001", timestamp: "2026-03-13 09:42:15", user: "Dr. Priya Sharma", action: "VIEW_RECORD", resource: "Patient: Vikram Singh", ip: "103.21.58.12", details: "Accessed patient medical records" },
  { id: "log-002", timestamp: "2026-03-13 09:38:22", user: "System (AI)", action: "AI_CALL", resource: "Phone: +91 98765 43210", ip: "—", details: "AI receptionist call — appointment rescheduled" },
  { id: "log-003", timestamp: "2026-03-13 09:15:40", user: "Anika Patel", action: "CREATE", resource: "Appointment: a8", ip: "103.21.58.15", details: "Created appointment for Sonal Desai" },
  { id: "log-004", timestamp: "2026-03-13 08:52:11", user: "Dr. Amit Patel", action: "PRESCRIBE", resource: "Rx: rx-004", ip: "103.21.58.18", details: "Created prescription for Sonal Desai" },
  { id: "log-005", timestamp: "2026-03-13 08:30:05", user: "Super Admin", action: "UPDATE_SETTINGS", resource: "Platform: AI Config", ip: "103.21.58.10", details: "Updated AI voice model to v3.2" },
  { id: "log-006", timestamp: "2026-03-12 17:45:30", user: "Dr. Priya Sharma", action: "COMPLETE", resource: "Appointment: a2", ip: "103.21.58.12", details: "Marked appointment as completed" },
  { id: "log-007", timestamp: "2026-03-12 16:20:18", user: "Rohit Verma", action: "UPDATE_QUEUE", resource: "Queue: Position 3", ip: "103.21.58.20", details: "Updated queue — moved patient to consultation" },
  { id: "log-008", timestamp: "2026-03-12 15:10:42", user: "System (AI)", action: "SEND_REMINDER", resource: "SMS: +91 54321 09876", ip: "—", details: "Sent appointment reminder to Karan Malhotra" },
  { id: "log-009", timestamp: "2026-03-12 14:05:55", user: "Preethi Nair", action: "CREATE_INVOICE", resource: "Invoice: INV-005", ip: "103.21.58.22", details: "Generated invoice for Karan Malhotra — ₹2,000" },
  { id: "log-010", timestamp: "2026-03-12 11:30:28", user: "Dr. Priya Sharma", action: "SHARE_RX", resource: "Rx: rx-001", ip: "103.21.58.12", details: "Shared prescription with Vikram Singh via patient portal" },
  { id: "log-011", timestamp: "2026-03-12 10:15:09", user: "Super Admin", action: "SUSPEND_CLINIC", resource: "Clinic: OrthoPlus Bone", ip: "103.21.58.10", details: "Suspended clinic — payment overdue" },
  { id: "log-012", timestamp: "2026-03-12 09:00:00", user: "System", action: "BACKUP", resource: "Database: Full", ip: "—", details: "Daily automated database backup completed" },
];

/* ─── Organizations ─── */

export const organizationsList = [
  {
    id: "org-001",
    name: "SmileCare Healthcare Pvt. Ltd.",
    owner: "Dr. Priya Sharma",
    email: "admin@smilecare.com",
    phone: "+91 22 4000 1111",
    plan: "Professional" as const,
    status: "active" as const,
    registeredDate: "2025-04-10",
    gstin: "27AABCS1234A1Z5",
    address: "123 MG Road, Fort, Mumbai 400001",
    totalClinics: 3,
    totalDoctors: 7,
    totalPatients: 1440,
    monthlyRevenue: 390000,
    clinics: [
      { id: "oc-1", name: "SmileCare Main", address: "123 MG Road, Mumbai", city: "Mumbai", doctors: 3, patients: 820, status: "active" as const, timing: "9AM - 8PM" },
      { id: "oc-2", name: "SmileCare Andheri", address: "45 Link Road, Andheri", city: "Mumbai", doctors: 2, patients: 380, status: "active" as const, timing: "10AM - 7PM" },
      { id: "oc-3", name: "SmileCare Thane", address: "78 Station Road, Thane", city: "Thane", doctors: 2, patients: 240, status: "inactive" as const, timing: "9AM - 5PM" },
    ],
    activity: [
      { date: "2026-03-12", event: "Clinic 'SmileCare Andheri' added 1 new doctor" },
      { date: "2026-03-10", event: "Subscription renewed — Professional plan" },
      { date: "2026-03-05", event: "AI Voice model updated to v3.2" },
      { date: "2026-02-28", event: "New clinic branch 'SmileCare Thane' registered" },
      { date: "2026-02-15", event: "50 new patients registered across all branches" },
    ],
  },
  {
    id: "org-002",
    name: "HealthFirst Medical Group",
    owner: "Dr. Rajesh Kumar",
    email: "admin@healthfirst.com",
    phone: "+91 11 4500 2222",
    plan: "Enterprise" as const,
    status: "active" as const,
    registeredDate: "2024-11-20",
    gstin: "07AABHF5678B2Z9",
    address: "221 Connaught Place, New Delhi 110001",
    totalClinics: 5,
    totalDoctors: 12,
    totalPatients: 2400,
    monthlyRevenue: 645000,
    clinics: [
      { id: "oc-4", name: "HealthFirst CP", address: "221 Connaught Place", city: "Delhi", doctors: 4, patients: 800, status: "active" as const, timing: "8AM - 9PM" },
      { id: "oc-5", name: "HealthFirst Dwarka", address: "Sector 12, Dwarka", city: "Delhi", doctors: 3, patients: 620, status: "active" as const, timing: "9AM - 8PM" },
      { id: "oc-6", name: "HealthFirst Noida", address: "Sector 18, Noida", city: "Noida", doctors: 2, patients: 450, status: "active" as const, timing: "9AM - 7PM" },
      { id: "oc-7", name: "HealthFirst Gurgaon", address: "DLF Phase 3, Gurgaon", city: "Gurgaon", doctors: 2, patients: 380, status: "active" as const, timing: "10AM - 7PM" },
      { id: "oc-8", name: "HealthFirst Faridabad", address: "NIT 5, Faridabad", city: "Faridabad", doctors: 1, patients: 150, status: "pending" as const, timing: "9AM - 5PM" },
    ],
    activity: [
      { date: "2026-03-13", event: "New branch 'HealthFirst Faridabad' enrollment submitted" },
      { date: "2026-03-08", event: "Monthly billing cycle completed — ₹6,45,000" },
      { date: "2026-03-01", event: "AI call volume exceeded 500 — auto-upgraded quota" },
    ],
  },
  {
    id: "org-003",
    name: "BrightEyes Vision Care",
    owner: "Dr. Sunita Menon",
    email: "contact@brighteyes.in",
    phone: "+91 20 3000 3333",
    plan: "Basic" as const,
    status: "active" as const,
    registeredDate: "2025-08-05",
    gstin: "27AABBV9012C3Z1",
    address: "55 FC Road, Shivajinagar, Pune 411005",
    totalClinics: 1,
    totalDoctors: 2,
    totalPatients: 340,
    monthlyRevenue: 125000,
    clinics: [
      { id: "oc-9", name: "BrightEyes FC Road", address: "55 FC Road, Pune", city: "Pune", doctors: 2, patients: 340, status: "active" as const, timing: "10AM - 6PM" },
    ],
    activity: [
      { date: "2026-03-10", event: "Plan upgrade inquiry — considering Professional" },
      { date: "2026-02-20", event: "First 300 patients milestone reached" },
    ],
  },
  {
    id: "org-004",
    name: "DermGlow Aesthetics",
    owner: "Dr. Meera Joshi",
    email: "hello@dermglow.in",
    phone: "+91 80 4200 4444",
    plan: "Professional" as const,
    status: "pending" as const,
    registeredDate: "2026-03-08",
    gstin: "29AABDG3456D4Z7",
    address: "12 Indiranagar, Bangalore 560038",
    totalClinics: 2,
    totalDoctors: 3,
    totalPatients: 560,
    monthlyRevenue: 205000,
    clinics: [
      { id: "oc-10", name: "DermGlow Indiranagar", address: "12 Indiranagar", city: "Bangalore", doctors: 2, patients: 380, status: "active" as const, timing: "10AM - 7PM" },
      { id: "oc-11", name: "DermGlow Koramangala", address: "80ft Road, Koramangala", city: "Bangalore", doctors: 1, patients: 180, status: "pending" as const, timing: "11AM - 6PM" },
    ],
    activity: [
      { date: "2026-03-08", event: "Organization registration submitted — pending verification" },
      { date: "2026-03-08", event: "KYC documents uploaded for review" },
    ],
  },
  {
    id: "org-005",
    name: "PediaCare Kids Health",
    owner: "Dr. Anand Mehta",
    email: "admin@pediacare.in",
    phone: "+91 44 4800 5555",
    plan: "Professional" as const,
    status: "active" as const,
    registeredDate: "2025-06-15",
    gstin: "33AABPC7890E5Z3",
    address: "88 Anna Salai, Chennai 600002",
    totalClinics: 2,
    totalDoctors: 5,
    totalPatients: 1100,
    monthlyRevenue: 370000,
    clinics: [
      { id: "oc-12", name: "PediaCare Anna Salai", address: "88 Anna Salai", city: "Chennai", doctors: 3, patients: 700, status: "active" as const, timing: "8AM - 8PM" },
      { id: "oc-13", name: "PediaCare T. Nagar", address: "15 Usman Road, T. Nagar", city: "Chennai", doctors: 2, patients: 400, status: "active" as const, timing: "9AM - 7PM" },
    ],
    activity: [
      { date: "2026-03-11", event: "Added 2 new pediatric specialists" },
      { date: "2026-03-01", event: "Patient satisfaction survey completed — 4.8/5" },
    ],
  },
  {
    id: "org-006",
    name: "OrthoPlus Orthopedics",
    owner: "Dr. Vikrant Reddy",
    email: "info@orthoplus.in",
    phone: "+91 40 4600 6666",
    plan: "Basic" as const,
    status: "suspended" as const,
    registeredDate: "2025-09-22",
    gstin: "36AABOP2345F6Z8",
    address: "34 Banjara Hills, Hyderabad 500034",
    totalClinics: 1,
    totalDoctors: 2,
    totalPatients: 280,
    monthlyRevenue: 0,
    clinics: [
      { id: "oc-14", name: "OrthoPlus Banjara", address: "34 Banjara Hills", city: "Hyderabad", doctors: 2, patients: 280, status: "suspended" as const, timing: "9AM - 5PM" },
    ],
    activity: [
      { date: "2026-03-12", event: "Account suspended — payment overdue (60 days)" },
      { date: "2026-02-10", event: "Payment reminder sent — 2nd notice" },
      { date: "2026-01-12", event: "Payment reminder sent — 1st notice" },
    ],
  },
];

export const orgOnboardingRequests = [
  { id: "onb-001", orgName: "MedLife Wellness", owner: "Dr. Kavita Nair", email: "kavita@medlife.in", phone: "+91 98111 22233", plan: "Professional", clinicsCount: 3, city: "Kochi", submittedDate: "2026-03-13", status: "under-review" as const, kycStatus: "verified" as const },
  { id: "onb-002", orgName: "CureWell Hospitals", owner: "Dr. Sanjay Gupta", email: "sanjay@curewell.in", phone: "+91 98222 33344", plan: "Enterprise", clinicsCount: 8, city: "Ahmedabad", submittedDate: "2026-03-12", status: "under-review" as const, kycStatus: "pending" as const },
  { id: "onb-003", orgName: "VisionFirst Eye Care", owner: "Dr. Renu Kapoor", email: "renu@visionfirst.in", phone: "+91 98333 44455", plan: "Basic", clinicsCount: 1, city: "Jaipur", submittedDate: "2026-03-11", status: "approved" as const, kycStatus: "verified" as const },
  { id: "onb-004", orgName: "KidsCare Pediatrics", owner: "Dr. Mohan Das", email: "mohan@kidscare.in", phone: "+91 98444 55566", plan: "Professional", clinicsCount: 2, city: "Lucknow", submittedDate: "2026-03-10", status: "rejected" as const, kycStatus: "failed" as const },
];

export const orgGrowthData = [
  { month: "Oct", organizations: 32, clinics: 58 },
  { month: "Nov", organizations: 36, clinics: 68 },
  { month: "Dec", organizations: 40, clinics: 76 },
  { month: "Jan", organizations: 45, clinics: 88 },
  { month: "Feb", organizations: 52, clinics: 102 },
  { month: "Mar", organizations: 58, clinics: 115 },
];
