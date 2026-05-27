import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:4201';
const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3001';
const outputRoot = path.join('tests', 'screenshots', 'role-matrix');
const roles = [
  { role: 'Administrator', canCreate: true, canManage: true },
  { role: 'Moderator', canCreate: true, canManage: false },
  { role: 'Auditor', canCreate: true, canManage: false },
  { role: 'Reviewer', canCreate: true, canManage: false },
  { role: 'Approver', canCreate: true, canManage: false },
  { role: 'Member', canCreate: true, canManage: false },
  { role: 'Viewer', canCreate: false, canManage: false },
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function saveShot(page, category, name) {
  const dir = path.join(outputRoot, category);
  await ensureDir(dir);
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
}

test.describe('Role matrix evidence', () => {
  for (const item of roles) {
    test(`role ${item.role}`, async ({ page, request }) => {
      await page.goto(baseUrl);
      await page.getByLabel('Username').fill(`evidence.${item.role.toLowerCase()}`);
      await page.getByLabel('Role').selectOption(item.role);
      await page.getByRole('button', { name: 'Sign in' }).click();

      await expect(page).toHaveURL(/home/);
      await page.getByTestId('nav-boards').click();
      await expect(page).toHaveURL(/boards/);
      await expect(page.getByTestId('feed-page')).toBeVisible();
      await saveShot(page, item.role.toLowerCase(), 'cases-view');

      if (item.canCreate) {
        await page.getByTestId('post-author-input').fill(`evidence.${item.role.toLowerCase()}`);
        await page.getByTestId('post-content-input').fill(`Matrix post ${item.role}`);
        const createBtn = page.getByTestId('create-post-button');
        await expect(createBtn).toBeEnabled();
      } else {
        await expect(page.getByTestId('create-post-form')).toHaveCount(0);
      }

      await page.goto(`${baseUrl}/admin`);
      await saveShot(page, item.role.toLowerCase(), 'admin-view');

      const usersResponse = await request.post(`${apiBaseUrl}/users`, {
        headers: {
          'x-role': item.role,
          'x-username': `evidence.${item.role.toLowerCase()}`,
        },
        data: { username: `temp.${item.role.toLowerCase()}`, role: 'Viewer' },
      });

      if (item.canManage) {
        await expect(usersResponse.ok()).toBeTruthy();
      } else {
        expect(usersResponse.status()).toBe(403);
      }
    });
  }
});
