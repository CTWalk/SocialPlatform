import { test, expect, devices } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:4201';
const outputRoot = path.join('tests', 'screenshots', 'mobile', 'playwright');
const { defaultBrowserType: _iphoneBrowser, ...iphone13 } = devices['iPhone 13'];

test.use(iphone13);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function saveShot(page, name) {
  const dir = path.join(outputRoot, 'iphone-13');
  await ensureDir(dir);
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
}

test('captures member journey on iPhone 13', async ({ page }) => {
  const uniquePost = `Mobile visual post ${Date.now()}`;

  await page.goto(baseUrl);
  await expect(page.getByRole('heading', { name: 'Social Platform' })).toBeVisible();
  await saveShot(page, '01-login');

  await page.getByLabel('Username').fill('mia.chen');
  await page.getByLabel('Role').selectOption('Member');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/home/);
  await expect(page.getByTestId('dashboard-page')).toBeVisible();
  await expect(page.getByTestId('tab-home-mobile')).toBeVisible();
  await expect(page.getByTestId('tab-discover-mobile')).toBeVisible();
  await expect(page.getByTestId('tab-activity-mobile')).toBeVisible();
  await expect(page.getByTestId('tab-profile-mobile')).toBeVisible();
  await saveShot(page, '02-dashboard');

  await page.getByTestId('mobile-search-shortcut').click();
  await expect(page.getByTestId('search-page')).toBeVisible();
  await saveShot(page, '03-search');

  await page.goto(`${baseUrl}/boards`);
  await expect(page.getByTestId('create-post-form')).toBeVisible();

  await page.getByTestId('post-author-input').fill('mia.chen');
  await page.getByTestId('post-content-input').fill(uniquePost);
  await page.getByTestId('create-post-button').click();
  await expect(page.getByText(uniquePost).first()).toBeVisible();

  await page.getByText(uniquePost).first().click();
  await expect(page.getByTestId('feed-post-detail')).toBeVisible();
  await saveShot(page, '04-post-detail');
});

test('captures reviewer tabs on iPhone 13', async ({ page }) => {
  await page.goto(baseUrl);
  await page.getByLabel('Username').fill('reviewer.lee');
  await page.getByLabel('Role').selectOption('Reviewer');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/home/);
  await expect(page.getByTestId('tab-home-mobile')).toBeVisible();
  await expect(page.getByTestId('tab-activity-mobile')).toBeVisible();
  await expect(page.getByTestId('tab-profile-mobile')).toBeVisible();

  await page.getByTestId('tab-profile-mobile').click();
  await page.getByTestId('profile-link-review').click();
  await expect(page.getByTestId('review-page')).toBeVisible();
  await saveShot(page, '05-reviewer-review');
});
