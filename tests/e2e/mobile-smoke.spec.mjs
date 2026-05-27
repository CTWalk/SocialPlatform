import { test, expect, devices } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:4201';
const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3001';
const { defaultBrowserType: _iphoneBrowser, ...iphone13 } = devices['iPhone 13'];
const { defaultBrowserType: _pixelBrowser, ...pixel5 } = devices['Pixel 5'];

async function login(page, username, role) {
  await page.goto(baseUrl);
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Role').selectOption(role);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.describe('mobile smoke journeys', () => {
  test.describe('iPhone 13 member path', () => {
    test.use(iphone13);

    test('member can navigate tabs and open a thread detail', async ({ page, request }) => {
      const uniquePost = `Mobile smoke post ${Date.now()}`;

      await login(page, 'mia.chen', 'Member');
      await expect(page).toHaveURL(/home/);
      await expect(page.getByTestId('nav-home-mobile')).toBeVisible();
      await expect(page.getByTestId('nav-discover-mobile')).toBeVisible();
      await expect(page.getByTestId('nav-activity-mobile')).toBeVisible();
      await expect(page.getByTestId('nav-profile-mobile')).toBeVisible();

      await page.getByTestId('mobile-search-shortcut').click();
      await expect(page.getByTestId('search-page')).toBeVisible();

      const createResponse = await request.post(`${apiBaseUrl}/posts`, {
        headers: {
          'x-role': 'Member',
          'x-username': 'mia.chen',
        },
        data: {
          author: 'mia.chen',
          boardSlug: 'engineering',
          content: uniquePost,
        },
      });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();

      await page.goto(`${baseUrl}/boards?board=${encodeURIComponent(created.boardSlug)}&postId=${encodeURIComponent(created.id)}`);
      await expect(page.getByTestId('feed-post-detail')).toBeVisible();
      await expect(page.getByTestId('feed-post-detail')).toContainText(uniquePost);
    });
  });

  test.describe('Pixel 5 admin path', () => {
    test.use(pixel5);

    test('administrator can reach rules and admin from profile', async ({ page }) => {
      await login(page, 'admin.user', 'Administrator');
      await expect(page).toHaveURL(/home/);
      await expect(page.getByTestId('nav-profile-mobile')).toBeVisible();

      await page.getByTestId('nav-profile-mobile').click();
      await expect(page.getByTestId('profile-page')).toBeVisible();

      await page.getByTestId('profile-gear-btn').click();
      await page.getByTestId('profile-gear-settings').click();
      await expect(page.getByTestId('settings-page')).toBeVisible();

      await page.getByText('Moderation rules', { exact: true }).click();
      await expect(page.getByTestId('rules-page')).toBeVisible();

      await page.goto(`${baseUrl}/settings`);
      await expect(page.getByTestId('settings-page')).toBeVisible();
      await page.getByText('User administration', { exact: true }).click();
      await expect(page.getByTestId('admin-page')).toBeVisible();
    });
  });
});
