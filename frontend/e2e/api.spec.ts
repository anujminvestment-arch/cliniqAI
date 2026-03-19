import { test, expect } from '@playwright/test';

const API = 'http://localhost:8000/api';

async function getAuthToken(request: any): Promise<{ token: string; clinicId: string }> {
  const loginRes = await request.post(`${API}/auth/login`, {
    data: { email: 'rajesh@cityclinic.in', password: 'Admin@123' },
  });
  const { access_token } = await loginRes.json();
  const clinicRes = await request.get(`${API}/clinics/me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const { id: clinicId } = await clinicRes.json();
  return { token: access_token, clinicId };
}

// ── Health ────────────────────────────────────────────────────
test('health check', async ({ request }) => {
  const res = await request.get(`${API}/health`);
  expect(res.ok()).toBeTruthy();
  expect((await res.json()).status).toBe('ok');
});

// ── Auth ──────────────────────────────────────────────────────
test('login clinic owner', async ({ request }) => {
  const res = await request.post(`${API}/auth/login`, {
    data: { email: 'rajesh@cityclinic.in', password: 'Admin@123' },
  });
  expect(res.ok()).toBeTruthy();
  expect((await res.json()).access_token).toBeTruthy();
});

test('login patient', async ({ request }) => {
  const res = await request.post(`${API}/auth/login`, {
    data: { email: 'vikram@patient.com', password: 'Admin@123' },
  });
  expect(res.ok()).toBeTruthy();
  expect((await res.json()).access_token).toBeTruthy();
});

test('login wrong password fails', async ({ request }) => {
  const res = await request.post(`${API}/auth/login`, {
    data: { email: 'rajesh@cityclinic.in', password: 'wrong' },
  });
  expect(res.ok()).toBeFalsy();
});

// ── Doctors ───────────────────────────────────────────────────
test('list doctors', async ({ request }) => {
  const { token } = await getAuthToken(request);
  const res = await request.get(`${API}/doctors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.doctors.length).toBe(3);
});

// ── Patients ──────────────────────────────────────────────────
test('list patients', async ({ request }) => {
  const { token } = await getAuthToken(request);
  const res = await request.get(`${API}/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.patients.length).toBe(5);
});

// ── Queue ─────────────────────────────────────────────────────
test('queue stats', async ({ request }) => {
  const { token } = await getAuthToken(request);
  const res = await request.get(`${API}/queue/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.total_today).toBeGreaterThan(0);
  expect(body.waiting).toBeGreaterThanOrEqual(0);
});

test('queue list', async ({ request }) => {
  const { token } = await getAuthToken(request);
  const res = await request.get(`${API}/queue`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.queue.length).toBeGreaterThan(0);
});

test('TV queue display (public)', async ({ request }) => {
  const res = await request.get(`${API}/queue/tv/city-dental-bangalore`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.clinic_name).toContain('City Dental');
  expect(body.doctors.length).toBeGreaterThan(0);
});

// ── Appointments ──────────────────────────────────────────────
test('list today appointments', async ({ request }) => {
  const { token } = await getAuthToken(request);
  const res = await request.get(`${API}/appointments/today`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.appointments.length).toBeGreaterThan(0);
});

// ── Billing ───────────────────────────────────────────────────
test('list invoices', async ({ request }) => {
  const { token } = await getAuthToken(request);
  const res = await request.get(`${API}/invoices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.invoices.length).toBe(3);
});

// ── Prescriptions ─────────────────────────────────────────────
test('list prescriptions', async ({ request }) => {
  const { token } = await getAuthToken(request);
  const res = await request.get(`${API}/prescriptions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.prescriptions.length).toBe(2);
});

// ── Knowledge Base ────────────────────────────────────────────
test('list knowledge base entries', async ({ request }) => {
  const { token } = await getAuthToken(request);
  const res = await request.get(`${API}/knowledge-base`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.entries.length).toBeGreaterThanOrEqual(20);
});

// ── Analytics ─────────────────────────────────────────────────
test('dashboard analytics', async ({ request }) => {
  const { token } = await getAuthToken(request);
  const res = await request.get(`${API}/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
});

// ── Compliance ────────────────────────────────────────────────
test('list consents', async ({ request }) => {
  const { token } = await getAuthToken(request);
  const res = await request.get(`${API}/compliance/consents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.consents.length).toBeGreaterThan(0);
});

// ── Voice AI ──────────────────────────────────────────────────
test('voice providers status', async ({ request }) => {
  const res = await request.get(`${API}/voice/providers`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.sarvam.available).toBe(true);
  expect(body.whisper.available).toBe(true);
});

test('voice: search doctors for "dant dard" (Hindi tooth pain)', async ({ request }) => {
  const { clinicId } = await getAuthToken(request);
  const res = await request.post(`${API}/voice/simulate`, {
    data: { action: 'search_doctors', clinic_id: clinicId, params: { symptoms: ['dant dard'] } },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.doctors.length).toBeGreaterThan(0);
  expect(body.doctors[0].specialization).toBe('Dentist');
  expect(body.doctors[0].name).toContain('Rajesh');
});

test('voice: search doctors for "bukhar" (Hindi fever)', async ({ request }) => {
  const { clinicId } = await getAuthToken(request);
  const res = await request.post(`${API}/voice/simulate`, {
    data: { action: 'search_doctors', clinic_id: clinicId, params: { symptoms: ['bukhar'] } },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.doctors[0].specialization).toBe('General Physician');
  expect(body.doctors[0].name).toContain('Amit');
});

test('voice: check queue status', async ({ request }) => {
  const { clinicId } = await getAuthToken(request);
  const res = await request.post(`${API}/voice/simulate`, {
    data: { action: 'check_queue', clinic_id: clinicId, params: { patient_phone: '+919812345001' } },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.queue_length).toBeGreaterThan(0);
  expect(body.current_token).toBeTruthy();
});

test('voice: clinic info query (no query param)', async ({ request }) => {
  const { clinicId } = await getAuthToken(request);
  const res = await request.post(`${API}/voice/simulate`, {
    data: { action: 'clinic_info', clinic_id: clinicId, params: {} },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.name).toContain('City Dental');
});

// ── Feedback ──────────────────────────────────────────────────
test('list feedback', async ({ request }) => {
  const { token } = await getAuthToken(request);
  const res = await request.get(`${API}/feedback`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.feedback.length).toBe(3);
});
