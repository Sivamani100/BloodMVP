import { test, expect } from '@playwright/test';

test.describe('Blood MVP - Comprehensive Mobile-First UI & E2E Smoke Tests', () => {
  test('1. Mobile Home page renders hero card, 3D IV bag, actions, and stats', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto('/en');

    // Page title and main brand heading
    await expect(page).toHaveTitle(/Blood/);
    await expect(page.getByText('RaktKhoj').first()).toBeVisible();

    // Hero card
    await expect(page.getByRole('heading', { name: /Need blood right now\?/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Find Blood Now/i })).toBeVisible();

    // Dual action cards
    await expect(page.getByText('Become a Donor').first()).toBeVisible();
    await expect(page.getByText('Find Blood Camps').first()).toBeVisible();

    // Stats bar
    await expect(page.getByText('56 L')).toBeVisible();
    await expect(page.getByText('4.7 K')).toBeVisible();
    await expect(page.getByText('2.7 L')).toBeVisible();
  });

  test('2. Need Blood multi-step wizard navigates smoothly through mobile flow', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto('/en/need-blood');

    // Step 1: Blood Group
    await expect(page.getByText('Step 1 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: /What is the blood group of the patient\?/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /O\+/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /A\+/ })).toBeVisible();

    // Select O+ and proceed to Step 2
    await page.getByRole('button', { name: /O\+/ }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: Location
    await expect(page.getByText('Step 2 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Share patient's location/i })).toBeVisible();
    await expect(page.getByText(/We have added state & district/i)).toBeVisible();

    // Confirm location to Step 3
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Step 3: Hospital Selection
    await expect(page.getByText('Step 3 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Confirm the hospital patient is at/i })).toBeVisible();
    await expect(page.getByPlaceholder('Search hospital by name')).toBeVisible();

    // Confirm hospital to Blood Banks directory
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Step 4: Blood Banks directory
    await expect(page.getByRole('heading', { name: 'Blood Banks' })).toBeVisible();
    await expect(page.getByText(/Showing .* Bank\(s\)/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Search Donors Near You/i })).toBeVisible();
  });

  test('3. Become Donor route securely enforces auth and redirects unauthenticated users to login', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto('/en/become-donor');

    // Middleware redirect to login with next param
    await expect(page).toHaveURL(/\/en\/login\?next=%2Fen%2Fbecome-donor/);
    await expect(page.getByText(/Sign in to RaktKhoj/i)).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Verification Code/i })).toBeVisible();
  });

  test('4. Login page renders phone OTP authentication form', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto('/en/login');

    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Verification Code/i })).toBeVisible();
  });

  test('5. How It Works and Privacy pages render correctly', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto('/en/how-it-works');
    await expect(page.getByText(/How Blood Works|3-Minute Response/i).first()).toBeVisible();

    await page.goto('/en/privacy');
    await expect(page.getByText(/Privacy/i).first()).toBeVisible();

    await page.goto('/en/terms');
    await expect(page.getByText(/Terms/i).first()).toBeVisible();
  });
});
