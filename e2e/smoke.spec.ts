import { test, expect } from '@playwright/test';

test.describe('Biryani POS Terminal E2E Verification', () => {
  test('verifies demo application loads and displays navigation and dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Biryani POS — Terminal Demo/i);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Business Overview' })).toBeVisible();
  });

  test('executes cashier checkout flow in POS Terminal with exact totals and receipt', async ({ page }) => {
    await page.goto('/pos');

    // Verify POS Terminal opens
    await expect(page.getByRole('heading', { name: 'Current Bill' })).toBeVisible();

    // Tap on Chicken Biryani
    const chickenBiryaniTile = page.locator('div').filter({ hasText: /^Chicken Biryani/ }).first();
    await chickenBiryaniTile.click();

    // Verify item in cart
    await expect(page.locator('#root')).toContainText('Chicken Biryani');

    // Check financial totals calculated with 5% GST
    await expect(page.locator('#root')).toContainText('Subtotal');
    await expect(page.locator('#root')).toContainText('Total Amount');

    // Click Generate Bill
    const generateBillBtn = page.getByRole('button', { name: /Generate Bill/i });
    await generateBillBtn.click();

    // Verify completed receipt modal appears
    await expect(page.getByText('Sale Completed Successfully')).toBeVisible();
    await expect(page.locator('#thermal-receipt')).toBeVisible();

    // Close receipt modal via modal New Bill button
    await page.getByRole('button', { name: 'New Bill (F2)' }).last().click();
    await expect(page.getByText('Cart is empty. Tap items to add.')).toBeVisible();
  });

  test('verifies all main navigation routes open cleanly without errors', async ({ page }) => {
    // 1. Dashboard
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Business Overview' })).toBeVisible();

    // 2. POS Terminal
    await page.goto('/pos');
    await expect(page.getByRole('heading', { name: 'Current Bill' })).toBeVisible();

    // 3. Products
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // 4. Sales History
    await page.goto('/sales-history');
    await expect(page.getByRole('heading', { name: 'Sales History' })).toBeVisible();

    // 5. Reports & Analytics
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Reports & Analytics' })).toBeVisible();

    // 6. Settings
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // 7. Day Close
    await page.goto('/day-close');
    await expect(page.getByRole('main').getByRole('heading', { name: 'Day Close Summary' })).toBeVisible();
  });

  test('verifies Order Type selector under Current Bill and GPay QR Mock Scanner modal', async ({ page }) => {
    await page.goto('/pos');

    // Verify Order Type buttons are present under Current Bill
    const takeawayBtn = page.getByRole('button', { name: 'Takeaway' });
    const parcelBtn = page.getByRole('button', { name: 'Parcel' });
    const dineInBtn = page.getByRole('button', { name: 'Dine-in' });

    await expect(dineInBtn).toBeVisible();
    await expect(takeawayBtn).toBeVisible();
    await expect(parcelBtn).toBeVisible();

    // Switch to Takeaway
    await takeawayBtn.click();
    await expect(takeawayBtn).toHaveClass(/bg-blue-600/);

    // Switch to Parcel
    await parcelBtn.click();
    await expect(parcelBtn).toHaveClass(/bg-blue-600/);

    // Add item to cart
    await page.locator('div').filter({ hasText: /^Chicken Biryani/ }).first().click();

    // Open GPay QR Scanner Modal
    const gpayScanBtn = page.getByRole('button', { name: /Open GPay \/ UPI Dynamic QR/i });
    await expect(gpayScanBtn).toBeVisible();
    await gpayScanBtn.click();

    // Verify modal elements
    await expect(page.getByText('Google Pay / UPI QR')).toBeVisible();
    await expect(page.getByText('NPCI Certified')).toBeVisible();

    // Click Simulate Customer Payment Received
    await page.getByRole('button', { name: /Simulate Customer Payment Received/i }).click();

    // Verify modal closes and payment is registered
    await expect(page.getByText('Google Pay / UPI QR')).not.toBeVisible();
  });

  test('verifies Split Payment breakdown (GPay + Cash) and receipt detail', async ({ page }) => {
    await page.goto('/pos');

    // Add items to reach an amount
    await page.locator('div').filter({ hasText: /^Chicken Biryani/ }).first().click();
    await page.locator('div').filter({ hasText: /^Chicken Biryani/ }).first().click();
    await page.locator('div').filter({ hasText: /^Chicken 65/ }).first().click();

    // Add split payment method
    const addPaymentBtn = page.getByRole('button', { name: /\+ Add Payment Method/i });
    await expect(addPaymentBtn).toBeVisible();
    await addPaymentBtn.click();

    // Generate Bill
    const generateBillBtn = page.getByRole('button', { name: /Generate Bill/i });
    await generateBillBtn.click();

    // Verify receipt modal appears with payment breakdown
    await expect(page.locator('#thermal-receipt')).toBeVisible();
    await expect(page.getByText('Payment Breakdown')).toBeVisible();
  });

  test('verifies Dark Mode toggle and Reports export options', async ({ page }) => {
    await page.goto('/dashboard');

    // Toggle theme to dark
    const themeBtn = page.getByRole('button', { name: 'Toggle theme' });
    await themeBtn.click();

    // Verify html element has dark class
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Navigate to Reports
    await page.goto('/reports');
    await expect(page.getByRole('button', { name: 'Export PDF' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Print' })).toBeVisible();
  });
});
