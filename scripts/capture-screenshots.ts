import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function capture() {
  const outDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  console.log('Capturing Home Page...');
  await page.goto('http://localhost:3000/en');
  await page.screenshot({ path: path.join(outDir, '01-home.png'), fullPage: true });

  console.log('Capturing Need Blood Wizard...');
  await page.goto('http://localhost:3000/en/need-blood');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '02-need-blood.png'), fullPage: true });

  console.log('Capturing Login Page...');
  await page.goto('http://localhost:3000/en/login');
  await page.screenshot({ path: path.join(outDir, '03-login.png'), fullPage: true });

  console.log('Capturing How It Works...');
  await page.goto('http://localhost:3000/en/how-it-works');
  await page.screenshot({ path: path.join(outDir, '04-how-it-works.png'), fullPage: true });

  await browser.close();
  console.log('All screenshots captured in:', outDir);
}

capture().catch(console.error);
