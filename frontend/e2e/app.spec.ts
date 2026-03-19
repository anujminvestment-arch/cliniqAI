import { test, expect } from '@playwright/test';

const API = 'http://localhost:8000/api';

// ── Landing Page ─────────────────────────────────────────────
test('landing page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/CliniqAI/);
  await page.screenshot({ path: 'e2e/screenshots/01-landing.png', fullPage: true });
});

// ── Login Flow ───────────────────────────────────────────────
test('login as clinic owner', async ({ page }) => {
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  await page.fill('input[type="email"]', 'rajesh@cityclinic.in');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.screenshot({ path: 'e2e/screenshots/02-login-filled.png' });

  await page.click('button[type="submit"]');
  await page.waitForURL('**/clinic**', { timeout: 15000 });
  await page.screenshot({ path: 'e2e/screenshots/03-clinic-dashboard.png', fullPage: true });

  // Should see dashboard with stats
  await expect(page.locator('body')).toContainText(/dashboard|appointments|queue/i);
});

test('login as patient', async ({ page }) => {
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  await page.fill('input[type="email"]', 'vikram@patient.com');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/patient**', { timeout: 15000 });
  await page.screenshot({ path: 'e2e/screenshots/04-patient-dashboard.png', fullPage: true });
});

// ── Clinic Owner: Navigate Pages ─────────────────────────────
test.describe('Clinic Owner Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'rajesh@cityclinic.in');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/clinic**', { timeout: 15000 });
  });

  test('queue page shows patients', async ({ page }) => {
    await page.goto('/clinic/queue');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/05-queue.png', fullPage: true });
    // Should show queue data
    await expect(page.locator('body')).toContainText(/queue|token|waiting/i);
  });

  test('doctors page loads', async ({ page }) => {
    await page.goto('/clinic/doctors');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/06-doctors.png', fullPage: true });
    await expect(page.locator('body')).toContainText(/Rajesh|Priya|Amit/i);
  });

  test('patients page loads', async ({ page }) => {
    await page.goto('/clinic/patients');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/07-patients.png', fullPage: true });
    await expect(page.locator('body')).toContainText(/Vikram|Ananya|Mohammed/i);
  });

  test('appointments page loads', async ({ page }) => {
    await page.goto('/clinic/appointments');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/08-appointments.png', fullPage: true });
  });

  test('billing page loads', async ({ page }) => {
    await page.goto('/clinic/billing');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/09-billing.png', fullPage: true });
  });

  test('prescriptions page loads', async ({ page }) => {
    await page.goto('/clinic/prescriptions');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/10-prescriptions.png', fullPage: true });
  });

  test('analytics page loads', async ({ page }) => {
    await page.goto('/clinic/analytics');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/11-analytics.png', fullPage: true });
  });
});

// ── TV Queue Display ─────────────────────────────────────────
test('TV queue display loads (public)', async ({ page }) => {
  await page.goto('/queue-tv?clinic=city-dental-bangalore');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/12-tv-queue.png', fullPage: true });
  await expect(page.locator('body')).toContainText(/City Dental|queue|token/i);
});

// ── API Tests ────────────────────────────────────────────────
test('API: health check', async ({ request }) => {
  const res = await request.get(`${API}/health`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.status).toBe('ok');
});

test('API: login returns token', async ({ request }) => {
  const res = await request.post(`${API}/auth/login`, {
    data: { email: 'rajesh@cityclinic.in', password: 'Admin@123' },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.access_token).toBeTruthy();
});

test('API: voice simulate - search doctors for dant dard', async ({ request }) => {
  // Get clinic ID
  const loginRes = await request.post(`${API}/auth/login`, {
    data: { email: 'rajesh@cityclinic.in', password: 'Admin@123' },
  });
  const { access_token } = await loginRes.json();

  const clinicRes = await request.get(`${API}/clinics/me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const { id: clinicId } = await clinicRes.json();

  // Search doctors
  const res = await request.post(`${API}/voice/simulate`, {
    data: {
      action: 'search_doctors',
      clinic_id: clinicId,
      params: { symptoms: ['dant dard'] },
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.doctors.length).toBeGreaterThan(0);
  expect(body.doctors[0].specialization).toBe('Dentist');
});

test('API: voice simulate - search doctors for bukhar', async ({ request }) => {
  const loginRes = await request.post(`${API}/auth/login`, {
    data: { email: 'rajesh@cityclinic.in', password: 'Admin@123' },
  });
  const { access_token } = await loginRes.json();

  const clinicRes = await request.get(`${API}/clinics/me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const { id: clinicId } = await clinicRes.json();

  const res = await request.post(`${API}/voice/simulate`, {
    data: {
      action: 'search_doctors',
      clinic_id: clinicId,
      params: { symptoms: ['bukhar'] },
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.doctors.length).toBeGreaterThan(0);
  expect(body.doctors[0].specialization).toBe('General Physician');
});

test('API: voice providers shows both available', async ({ request }) => {
  const res = await request.get(`${API}/voice/providers`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.sarvam.available).toBe(true);
  expect(body.whisper.available).toBe(true);
});

test('API: queue stats returns data', async ({ request }) => {
  const loginRes = await request.post(`${API}/auth/login`, {
    data: { email: 'rajesh@cityclinic.in', password: 'Admin@123' },
  });
  const { access_token } = await loginRes.json();

  const res = await request.get(`${API}/queue/stats`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.total_today).toBeGreaterThan(0);
});
