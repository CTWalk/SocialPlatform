import { test, expect } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:4201';
const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3001';
const uiTimeout = 20000;

test('board route context survives navigation history', async ({ page, request }) => {
  const postBody = `History continuity post ${Date.now()}`;

  await page.goto(baseUrl);
  await page.getByLabel('Username').fill('mia.chen');
  await page.getByLabel('Role').selectOption('Member');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/home/);
  const createResponse = await request.post(`${apiBaseUrl}/posts`, {
    headers: {
      'x-role': 'Member',
      'x-username': 'mia.chen',
    },
    data: {
      author: 'mia.chen',
      boardSlug: 'engineering',
      content: postBody,
    },
  });
  expect(createResponse.status()).toBe(201);
  const created = await createResponse.json();

  await page.goto(`${baseUrl}/boards?board=${encodeURIComponent(created.boardSlug)}&postId=${encodeURIComponent(created.id)}`);
  const detail = page.getByTestId('feed-post-detail');
  await expect(page).toHaveURL(new RegExp(`board=engineering.*postId=${created.id}`));
  await expect(detail).toContainText(postBody, { timeout: uiTimeout });

  await page.getByTestId('nav-discover').click();
  await expect(page).toHaveURL(/discover/);

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`board=engineering.*postId=${created.id}`));
  await expect(detail).toContainText(postBody, { timeout: uiTimeout });

  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(/boards\?board=engineering$/);
  await expect(page.locator('[data-testid^="board-post-"]').filter({ hasText: postBody }).first()).toBeVisible({ timeout: uiTimeout });
});
