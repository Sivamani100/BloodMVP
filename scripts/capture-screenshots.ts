import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function waitForServer(url: string, timeoutMs: number = 20000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function capture() {
  const outDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Check if server is running, otherwise start it
  let serverProcess: any = null;
  const isRunning = await waitForServer('http://localhost:3000/api/health', 2000);
  if (!isRunning) {
    console.log('Starting production Next.js server on port 3000...');
    serverProcess = spawn('npx', ['next', 'start'], {
      shell: true,
      stdio: 'ignore',
      env: { ...process.env, PORT: '3000' },
    });
    const ready = await waitForServer('http://localhost:3000/api/health', 25000);
    if (!ready) {
      throw new Error('Server failed to start in time');
    }
  }

  const browser = await chromium.launch({ channel: 'chrome' });
  // Pixel 7 mobile viewport
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  console.log('1. Capturing Mobile Home Page...');
  await page.goto('http://localhost:3000/en');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, '01-mobile-home.png'), fullPage: true });

  console.log('2. Capturing Need Blood Wizard - Step 1 Blood Group...');
  await page.goto('http://localhost:3000/en/need-blood');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, '02-mobile-step1-blood-group.png'), fullPage: true });

  console.log('3. Capturing Need Blood Wizard - Step 2 Location...');
  await page.getByRole('button', { name: /O\+/ }).first().click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '03-mobile-step2-location.png'), fullPage: true });

  console.log('4. Capturing Need Blood Wizard - Step 3 Hospital...');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '04-mobile-step3-hospital.png'), fullPage: true });

  console.log('5. Capturing Need Blood Wizard - Step 4 Blood Banks...');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, '05-mobile-step4-banks.png'), fullPage: true });

  console.log('6. Capturing Need Blood Wizard - Step 5 Donors Found...');
  await page.getByRole('button', { name: /Search Donors Near You/i }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '06-mobile-step5-donors-found.png'), fullPage: true });

  console.log('7. Capturing Need Blood Wizard - Step 6 Patient Details...');
  await page.getByRole('button', { name: 'Continue now' }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '07-mobile-step6-patient-details.png'), fullPage: true });

  console.log('8. Capturing Need Blood Wizard - Step 7 Message Request...');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '08-mobile-step7-message-request.png'), fullPage: true });

  console.log('9. Capturing Login Page...');
  await page.goto('http://localhost:3000/en/login');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, '09-mobile-login.png'), fullPage: true });

  await browser.close();

  if (serverProcess) {
    serverProcess.kill();
  }

  console.log('All screenshots captured in:', outDir);
}

capture().catch(console.error);
