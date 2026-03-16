import { test, expect } from '@playwright/test';

test('placeholder - app loads', async ({ page }) => {
  // Replace with real test once the app is built
  test.skip(true, 'App not yet implemented');
  await page.goto('/');
  await expect(page).toHaveTitle(/CliniqAI/);
});
