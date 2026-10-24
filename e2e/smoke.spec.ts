import { test, expect } from '@playwright/test';

test.describe('POS Demo Environment Smoke Test', () => {
  test('verifies demo application loads and displays title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Biryani POS — Terminal Demo/i);
    await expect(page.getByText('Biryani POS — Terminal Demo Environment')).toBeVisible();
  });
});
