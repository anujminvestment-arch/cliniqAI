import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 1440, height: 900 },
  headless: false,
  launchOptions: { slowMo: 500 },
});

const API = 'http://localhost:8000/api';

test('Phase 1 Full Demo', async ({ page }) => {
  test.setTimeout(300000);

  // ── 1. Landing Page ──────────────────────────────────────
  console.log('>>> 1. Landing Page');
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/demo-01-landing.png', fullPage: true });

  // ── 2. Login as Clinic Owner ─────────────────────────────
  console.log('>>> 2. Login as Clinic Owner');
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Check if login form exists
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
  const passwordInput = page.locator('input[type="password"], input[name="password"]');

  if (await emailInput.count() === 0) {
    console.log('Login form not found on /login, checking page content...');
    const content = await page.content();
    console.log('Page title:', await page.title());
    await page.screenshot({ path: 'e2e/screenshots/demo-02-login-debug.png', fullPage: true });

    // Maybe we need to use API login directly and set token
    console.log('>>> Using API login instead...');
    const loginRes = await page.request.post(`${API}/auth/login`, {
      data: { email: 'rajesh@cityclinic.in', password: 'Admin@123' },
    });
    const loginData = await loginRes.json();
    console.log('Login response:', JSON.stringify(loginData).substring(0, 200));

    if (loginData.access_token) {
      // Set token in localStorage and navigate
      await page.evaluate((token) => {
        localStorage.setItem('access_token', token);
      }, loginData.access_token);

      if (loginData.refresh_token) {
        await page.evaluate((token) => {
          localStorage.setItem('refresh_token', token);
        }, loginData.refresh_token);
      }

      // Store user data if returned
      if (loginData.user) {
        await page.evaluate((user) => {
          localStorage.setItem('user', JSON.stringify(user));
        }, loginData.user);
      }

      await page.goto('/clinic', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
    }
  } else {
    await emailInput.first().fill('rajesh@cityclinic.in');
    await passwordInput.first().fill('Admin@123');
    await page.screenshot({ path: 'e2e/screenshots/demo-02-login-filled.png' });
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
  }

  await page.screenshot({ path: 'e2e/screenshots/demo-03-after-login.png', fullPage: true });
  console.log('Current URL after login:', page.url());

  // ── 3. Clinic Dashboard ──────────────────────────────────
  console.log('>>> 3. Clinic Dashboard');
  await page.goto('/clinic', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-04-clinic-dashboard.png', fullPage: true });

  // ── 4. Queue Page ────────────────────────────────────────
  console.log('>>> 4. Queue Page');
  await page.goto('/clinic/queue', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-05-queue.png', fullPage: true });

  // ── 5. Doctors Page ──────────────────────────────────────
  console.log('>>> 5. Doctors Page');
  await page.goto('/clinic/doctors', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-06-doctors.png', fullPage: true });

  // ── 6. Patients Page ─────────────────────────────────────
  console.log('>>> 6. Patients Page');
  await page.goto('/clinic/patients', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-07-patients.png', fullPage: true });

  // ── 7. Appointments Page ─────────────────────────────────
  console.log('>>> 7. Appointments Page');
  await page.goto('/clinic/appointments', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-08-appointments.png', fullPage: true });

  // ── 8. Billing Page ──────────────────────────────────────
  console.log('>>> 8. Billing Page');
  await page.goto('/clinic/billing', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-09-billing.png', fullPage: true });

  // ── 9. Prescriptions Page ────────────────────────────────
  console.log('>>> 9. Prescriptions Page');
  await page.goto('/clinic/prescriptions', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-10-prescriptions.png', fullPage: true });

  // ── 10. Analytics Page ───────────────────────────────────
  console.log('>>> 10. Analytics Page');
  await page.goto('/clinic/analytics', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-11-analytics.png', fullPage: true });

  // ── 11. AI Settings / Knowledge Base ─────────────────────
  console.log('>>> 11. AI Settings');
  await page.goto('/clinic/ai-settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-12-ai-settings.png', fullPage: true });

  // ── 12. Staff Page ───────────────────────────────────────
  console.log('>>> 12. Staff Page');
  await page.goto('/clinic/staff', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-13-staff.png', fullPage: true });

  // ── 13. Feedback Page ────────────────────────────────────
  console.log('>>> 13. Feedback Page');
  await page.goto('/clinic/feedback', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-14-feedback.png', fullPage: true });

  // ── 14. TV Queue Display ─────────────────────────────────
  console.log('>>> 14. TV Queue Display');
  await page.goto('/queue-tv?clinic=city-dental-bangalore', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-15-tv-queue.png', fullPage: true });

  // ── 15. Patient Portal ───────────────────────────────────
  console.log('>>> 15. Patient Portal');
  // Login as patient
  const patientLogin = await page.request.post(`${API}/auth/login`, {
    data: { email: 'vikram@patient.com', password: 'Admin@123' },
  });
  const patientData = await patientLogin.json();
  await page.evaluate((token) => {
    localStorage.setItem('access_token', token);
  }, patientData.access_token);
  if (patientData.refresh_token) {
    await page.evaluate((token) => {
      localStorage.setItem('refresh_token', token);
    }, patientData.refresh_token);
  }

  await page.goto('/patient', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-16-patient-dashboard.png', fullPage: true });

  // ── 16. Patient Queue View ───────────────────────────────
  console.log('>>> 16. Patient Queue');
  await page.goto('/patient/queue', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-17-patient-queue.png', fullPage: true });

  // ── 17. Patient Appointments ─────────────────────────────
  console.log('>>> 17. Patient Appointments');
  await page.goto('/patient/appointments', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-18-patient-appointments.png', fullPage: true });

  // ── 18. Patient Prescriptions ────────────────────────────
  console.log('>>> 18. Patient Prescriptions');
  await page.goto('/patient/prescriptions', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-19-patient-prescriptions.png', fullPage: true });

  // ── 19. Patient Billing ──────────────────────────────────
  console.log('>>> 19. Patient Billing');
  await page.goto('/patient/billing', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/screenshots/demo-20-patient-billing.png', fullPage: true });

  console.log('>>> DEMO COMPLETE! All screenshots saved to e2e/screenshots/');

  // Keep browser open for 30 seconds so user can see
  await page.waitForTimeout(30000);
});
