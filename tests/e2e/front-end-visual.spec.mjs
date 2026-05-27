import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:4201';
const outputRoot = path.join('tests', 'screenshots');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function saveShot(page, category, name) {
  const dir = path.join(outputRoot, category);
  await ensureDir(dir);
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
}

test.describe('Company social platform visual flow', () => {
  test('captures the main user journey', async ({ page }) => {
    await page.goto(baseUrl);

    await expect(page.getByRole('heading', { name: 'Mammoth' })).toBeVisible();
    await saveShot(page, '01-login', 'login-screen');

    await page.getByLabel('Username').fill('admin.user');
    await page.getByLabel('Role').selectOption('Administrator');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/home/);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await saveShot(page, '02-dashboard', 'dashboard');

    await page.getByTestId('nav-boards').click();
    await expect(page.getByTestId('create-post-form')).toBeVisible();
    await saveShot(page, '03-cases', 'cases-page');

    await page.getByTestId('post-author-input').fill('admin.user');
    await page.getByTestId('post-content-input').fill('Visual snapshot post for the company feed.');
    await page.getByTestId('create-post-button').click();

    await expect(page.getByText('Visual snapshot post for the company feed.').first()).toBeVisible();
    await saveShot(page, '04-created-case', 'created-case');

    await page.getByTestId(/board-post-/).first().click();
    await page.getByRole('button', { name: 'Reload details' }).first().click();
    await saveShot(page, '05-workflow', 'workflow-updated');

    await page.getByTestId('nav-admin').click();
    await expect(page.getByTestId('admin-page')).toBeVisible();
    await saveShot(page, '06-admin', 'admin-page');
  });
});
