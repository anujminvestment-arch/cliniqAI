"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) return request(path, options);
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || error.error || "Request failed");
  }

  return res.json();
}

async function refreshToken(): Promise<boolean> {
  const refresh = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: "", refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    request<{ user: { id: string; name: string; email: string }; membership: { clinic_id: string; role: string }; access_token: string; refresh_token: string }>(
      "/api/auth/login", { method: "POST", body: { email, password } }
    ),
  register: (data: Record<string, string | undefined>) =>
    request("/api/auth/register", { method: "POST", body: data }),
  me: () => request("/api/auth/me"),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request("/api/auth/change-password", { method: "POST", body: { current_password: currentPassword, new_password: newPassword } }),
  forgotPassword: (email: string) =>
    request("/api/auth/forgot-password", { method: "POST", body: { email } }),
};

// Users
export const users = {
  getProfile: () => request("/api/users/me/profile"),
  updateProfile: (data: Record<string, string>) =>
    request("/api/users/me/profile", { method: "PUT", body: data }),
};

// Doctors
export const doctors = {
  list: (params?: { search?: string; specialization?: string; limit?: number; offset?: number }) =>
    request<{ doctors: any[]; total: number }>(`/api/doctors${buildQuery(params || {})}`),
  getById: (id: string) => request(`/api/doctors/${id}`),
  create: (data: Record<string, any>) =>
    request("/api/doctors", { method: "POST", body: data }),
  update: (id: string, data: Record<string, any>) =>
    request(`/api/doctors/${id}`, { method: "PUT", body: data }),
  delete: (id: string) =>
    request(`/api/doctors/${id}`, { method: "DELETE" }),
  getSchedule: (id: string, date?: string) =>
    request(`/api/doctors/${id}/schedule${buildQuery({ schedule_date: date })}`),
};

// Patients
export const patients = {
  list: (params?: { search?: string; limit?: number; offset?: number }) =>
    request<{ patients: any[]; total: number }>(`/api/patients${buildQuery(params || {})}`),
  getById: (id: string) => request(`/api/patients/${id}`),
  getMe: () => request("/api/patients/me"),
  create: (data: Record<string, any>) =>
    request("/api/patients", { method: "POST", body: data }),
  update: (id: string, data: Record<string, any>) =>
    request(`/api/patients/${id}`, { method: "PUT", body: data }),
  getAppointments: (id: string, params?: { status?: string }) =>
    request(`/api/patients/${id}/appointments${buildQuery(params || {})}`),
};

// Staff
export const staff = {
  list: (params?: { role?: string; search?: string; limit?: number; offset?: number }) =>
    request<{ staff: any[]; total: number }>(`/api/staff${buildQuery(params || {})}`),
  create: (data: Record<string, any>) =>
    request("/api/staff", { method: "POST", body: data }),
  update: (id: string, data: Record<string, any>) =>
    request(`/api/staff/${id}`, { method: "PUT", body: data }),
  delete: (id: string) =>
    request(`/api/staff/${id}`, { method: "DELETE" }),
};

// Appointments
export const appointments = {
  list: (params?: { appointment_date?: string; status?: string; doctor_id?: string; patient_id?: string; limit?: number; offset?: number }) =>
    request<{ appointments: any[]; total: number }>(`/api/appointments${buildQuery(params || {})}`),
  getToday: () => request<{ appointments: any[]; stats: any }>("/api/appointments/today"),
  getSlots: (doctorId: string, date: string) =>
    request(`/api/appointments/slots${buildQuery({ doctor_id: doctorId, slot_date: date })}`),
  create: (data: Record<string, any>) =>
    request("/api/appointments", { method: "POST", body: data }),
  update: (id: string, data: Record<string, any>) =>
    request(`/api/appointments/${id}`, { method: "PUT", body: data }),
  updateStatus: (id: string, status: string, reason?: string) =>
    request(`/api/appointments/${id}/status`, { method: "PATCH", body: { status, cancellation_reason: reason } }),
};

// Queue
export const queue = {
  get: (params?: { doctor_id?: string; queue_date?: string }) =>
    request<{ queue: any[]; total: number }>(`/api/queue${buildQuery(params || {})}`),
  stats: () => request("/api/queue/stats"),
  checkIn: (data: { patient_id: string; doctor_id: string; appointment_id?: string; type?: string }) =>
    request("/api/queue/check-in", { method: "POST", body: data }),
  callNext: (doctorId: string) =>
    request(`/api/queue/call-next${buildQuery({ doctor_id: doctorId })}`, { method: "POST" }),
  skip: (entryId: string) =>
    request(`/api/queue/skip${buildQuery({ entry_id: entryId })}`, { method: "POST" }),
  tvQueue: (clinicSlug: string) =>
    request<{ clinic_name: string; clinic_slug: string; timestamp: string; doctors: any[] }>(
      `/api/queue/tv/${clinicSlug}`
    ),
  myPosition: () => request<any>("/api/queue/my-position"),
  myQueue: () => request<any>("/api/queue/my-queue"),
};

// Billing
export const billing = {
  listInvoices: (params?: { status?: string; patient_id?: string; limit?: number; offset?: number }) =>
    request<{ invoices: any[]; total: number }>(`/api/invoices${buildQuery(params || {})}`),
  createInvoice: (data: Record<string, any>) =>
    request("/api/invoices", { method: "POST", body: data }),
  updateInvoice: (id: string, data: Record<string, any>) =>
    request(`/api/invoices/${id}`, { method: "PUT", body: data }),
  createRazorpayOrder: (invoiceId: string) =>
    request(`/api/invoices/razorpay-order${buildQuery({ invoice_id: invoiceId })}`, { method: "POST" }),
  listPayments: (params?: { limit?: number; offset?: number }) =>
    request<{ payments: any[] }>(`/api/payments${buildQuery(params || {})}`),
  recordPayment: (data: Record<string, any>) =>
    request("/api/payments/record", { method: "POST", body: data }),
};

// Prescriptions
export const prescriptions = {
  list: (params?: { patient_id?: string; limit?: number; offset?: number }) =>
    request<{ prescriptions: any[]; total?: number }>(`/api/prescriptions${buildQuery(params || {})}`),
  create: (data: Record<string, any>) =>
    request("/api/prescriptions", { method: "POST", body: data }),
  update: (id: string, data: Record<string, any>) =>
    request(`/api/prescriptions/${id}`, { method: "PUT", body: data }),
  sign: (id: string) =>
    request(`/api/prescriptions/${id}/sign`, { method: "POST" }),
};

// Notifications
export const notifications = {
  list: (params?: { channel?: string; status?: string; limit?: number; offset?: number }) =>
    request<{ notifications: any[] }>(`/api/notifications${buildQuery(params || {})}`),
  listTemplates: () => request<{ templates: any[] }>("/api/notifications/templates"),
};

// Compliance
export const compliance = {
  auditLogs: (params?: { action?: string; resource_type?: string; limit?: number; offset?: number }) =>
    request<{ audit_logs: any[]; total?: number }>(`/api/compliance/audit-logs${buildQuery(params || {})}`),
  consents: (params?: { patient_id?: string }) =>
    request<{ consents: any[] }>(`/api/compliance/consents${buildQuery(params || {})}`),
  createConsent: (data: Record<string, any>) =>
    request("/api/compliance/consents", { method: "POST", body: data }),
  revokeConsent: (id: string) =>
    request(`/api/compliance/consents/${id}/revoke`, { method: "POST" }),
  exportData: (patientId: string) =>
    request(`/api/compliance/export/${patientId}`),
};

// Knowledge Base
export const knowledgeBase = {
  list: (params?: { category?: string; search?: string }) =>
    request<{ entries: any[] }>(`/api/knowledge-base${buildQuery(params || {})}`),
  create: (data: Record<string, any>) =>
    request("/api/knowledge-base", { method: "POST", body: data }),
  update: (id: string, data: Record<string, any>) =>
    request(`/api/knowledge-base/${id}`, { method: "PUT", body: data }),
  delete: (id: string) =>
    request(`/api/knowledge-base/${id}`, { method: "DELETE" }),
};

// Analytics
export const analytics = {
  dashboard: () => request("/api/analytics/dashboard"),
  trends: (days?: number) =>
    request(`/api/analytics/trends${buildQuery({ days })}`),
  doctorPerformance: () => request("/api/analytics/doctor-performance"),
};

// Clinics
export const clinics = {
  getMe: () => request("/api/clinics/me"),
  updateMe: (data: Record<string, any>) =>
    request("/api/clinics/me", { method: "PUT", body: data }),
  listBranches: () => request<{ branches: any[] }>("/api/clinics/branches"),
  createBranch: (data: Record<string, any>) =>
    request("/api/clinics/branches", { method: "POST", body: data }),
  updateBranch: (id: string, data: Record<string, any>) =>
    request(`/api/clinics/branches/${id}`, { method: "PUT", body: data }),
};

// Consultations
export const consultations = {
  list: (params?: { patient_id?: string; doctor_id?: string; limit?: number; offset?: number }) =>
    request<{ consultations: any[]; total?: number }>(`/api/consultations${buildQuery(params || {})}`),
  create: (data: Record<string, any>) =>
    request("/api/consultations", { method: "POST", body: data }),
  update: (id: string, data: Record<string, any>) =>
    request(`/api/consultations/${id}`, { method: "PUT", body: data }),
};

// Follow-ups
export const followUps = {
  list: (days?: number) =>
    request<{ follow_ups: any[] }>(`/api/follow-ups${buildQuery({ days })}`),
};

// Admin
export const admin = {
  listClinics: (params?: { search?: string; limit?: number; offset?: number }) =>
    request<{ clinics: any[]; total: number }>(`/api/admin/clinics${buildQuery(params || {})}`),
  stats: () => request("/api/admin/stats"),
  listUsers: (params?: { search?: string; role?: string; limit?: number; offset?: number }) =>
    request<{ users: any[]; total: number }>(`/api/admin/users${buildQuery(params || {})}`),
};

// Feedback
export const feedback = {
  list: (params?: { doctor_id?: string; limit?: number; offset?: number }) =>
    request<{ feedback: any[]; avg_rating: number }>(`/api/feedback${buildQuery(params || {})}`),
  submit: (data: Record<string, any>) =>
    request("/api/feedback", { method: "POST", body: data }),
};

// Conversations
export const conversations = {
  list: (params?: { channel?: string; search?: string; limit?: number; offset?: number }) => {
    return request<any[]>(`/api/conversations${buildQuery(params || {})}`);
  },
  getById: (id: string) => request<any>(`/api/conversations/${id}`),
};

// Voice simulation
export const voice = {
  simulate: (clinicId: string, action: string, params: Record<string, unknown>) =>
    request("/api/voice/simulate", { method: "POST", body: { clinic_id: clinicId, action, params } }),
};
