import { test, expect, devices } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:4201';
const outputRoot = path.join('tests', 'screenshots', 'mobile', 'playwright');
const { defaultBrowserType: _pixelBrowser, ...pixel5 } = devices['Pixel 5'];

test.use(pixel5);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function saveShot(page, name) {
  const dir = path.join(outputRoot, 'pixel-5');
  await ensureDir(dir);
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
}

test('captures admin journey on Pixel 5', async ({ page }) => {
  await page.goto(baseUrl);
  await expect(page.getByRole('heading', { name: 'Social Platform' })).toBeVisible();
  await page.getByLabel('Username').fill('admin.user');
  await page.getByLabel('Role').selectOption('Administrator');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/home/);
  await expect(page.getByTestId('dashboard-page')).toBeVisible();
  await expect(page.getByTestId('tab-home-mobile')).toBeVisible();
  await expect(page.getByTestId('tab-discover-mobile')).toBeVisible();
  await expect(page.getByTestId('tab-activity-mobile')).toBeVisible();
  await expect(page.getByTestId('tab-profile-mobile')).toBeVisible();
  await saveShot(page, '01-dashboard');

  await page.getByTestId('tab-profile-mobile').click();
  await page.getByTestId('profile-link-rules').click();
  await expect(page.getByTestId('rules-page')).toBeVisible();
  await saveShot(page, '02-rules');

  await page.goto(`${baseUrl}/profile`);
  await expect(page.getByTestId('profile-page')).toBeVisible();
  await saveShot(page, '03-profile');

  await page.getByTestId('profile-link-admin').scrollIntoViewIfNeeded();
  await page.getByTestId('profile-link-admin').click();
  await expect(page.getByTestId('admin-page')).toBeVisible();
  await saveShot(page, '04-administration');
});
