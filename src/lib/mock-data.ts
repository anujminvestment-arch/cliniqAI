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
