import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Badger/i);
});

test('has working navigation', async ({ page }) => {
  await page.goto('/');

  // Add your navigation tests here
  // Example: await page.click('text=Dashboard');
  // await expect(page).toHaveURL(/dashboard/);
});
