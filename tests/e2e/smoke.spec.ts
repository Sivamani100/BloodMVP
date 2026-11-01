import { test, expect } from '@playwright/test';

test.describe('Blood MVP - Comprehensive Browser Smoke Tests', () => {
  test('1. Home page renders hero, CTAs, and navigation', async ({ page }) => {
    await page.goto('/en');

    // Page title and main headings
    await expect(page).toHaveTitle(/Blood/);
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();

    // Verify key action buttons
    const needBloodBtn = page.getByRole('link', { name: /Need Blood/i });
    await expect(needBloodBtn.first()).toBeVisible();

    const becomeDonorBtn = page.getByRole('link', { name: /Become a donor/i });
    await expect(becomeDonorBtn.first()).toBeVisible();
  });

  test('2. Need Blood page renders blood groups, urgency levels, and blood banks', async ({ page }) => {
    await page.goto('/en/need-blood');

    // Urgency buttons
    await expect(page.getByText(/Right now|Within 6 hours/i).first()).toBeVisible();

    // Blood groups
    await expect(page.getByRole('button', { name: 'O+', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'A+', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'B+', exact: true })).toBeVisible();

    // Units
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible();

    // Nearest blood banks
    await expect(page.getByText(/Nearest blood banks/i).first()).toBeVisible();
    await page.waitForTimeout(2000);
    const bankCards = page.locator('text=TEST Blood Bank');
    await expect(bankCards.first()).toBeVisible();
  });

  test('3. Become Donor route securely enforces auth and redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/en/become-donor');

    // Middleware redirect to login with next param
    await expect(page).toHaveURL(/\/en\/login\?next=%2Fen%2Fbecome-donor/);
    await expect(page.getByText(/Enter your mobile number/i)).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Code/i })).toBeVisible();
  });

  test('4. Login page renders phone OTP authentication form', async ({ page }) => {
    await page.goto('/en/login');

    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Code/i })).toBeVisible();
  });

  test('5. How It Works and Privacy pages render correctly', async ({ page }) => {
    await page.goto('/en/how-it-works');
    await expect(page.getByText(/How Blood Works|3-Minute Response/i).first()).toBeVisible();

    await page.goto('/en/privacy');
    await expect(page.getByText(/Privacy/i).first()).toBeVisible();

    await page.goto('/en/terms');
    await expect(page.getByText(/Terms/i).first()).toBeVisible();
  });
});
