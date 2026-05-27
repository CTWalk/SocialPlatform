import { test, expect } from '@playwright/test';
import { resilientLocator } from './utils/resilient-locator.mjs';

const appBaseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:4201';
const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3001';

test('MVP smoke flow works end-to-end', async ({ page, request }, testInfo) => {
  await page.goto(appBaseUrl);

  const usernameInput = await resilientLocator(page, {
    description: 'smoke login username input',
    primary: { locator: (currentPage) => currentPage.getByLabel('Username'), strategy: 'aria-label' },
    fallbacks: [
      { selector: 'input[formcontrolname="username"]', strategy: 'form-control-name' },
    ],
  }, testInfo);

  const roleSelect = await resilientLocator(page, {
    description: 'smoke login role select',
    primary: { locator: (currentPage) => currentPage.getByLabel('Role'), strategy: 'aria-label' },
    fallbacks: [
      { selector: 'select[formcontrolname="role"]', strategy: 'form-control-name' },
    ],
  }, testInfo);

  const loginButton = await resilientLocator(page, {
    description: 'smoke login submit button',
    primary: { locator: (currentPage) => currentPage.getByRole('button', { name: 'Sign in' }), strategy: 'role-name' },
    fallbacks: [
      { selector: 'button[type="submit"]', strategy: 'semantic-submit' },
    ],
  }, testInfo);

  await usernameInput.element.fill('admin.user');
  await roleSelect.element.selectOption('Administrator');
  await loginButton.element.click();

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByTestId('dashboard-page')).toBeVisible();
  await expect(page.getByTestId('nav-feed')).toBeVisible();
  await page.getByTestId('nav-feed').click();
  await expect(page).toHaveURL(/feed/);

  await expect(page.getByTestId('create-post-form')).toBeVisible();

  await page.getByTestId('post-author-input').fill('admin.user');
  await page.getByTestId('post-content-input').fill('Smoke test confidential post for the company feed.');
  await page.getByTestId('create-post-button').click();

  await expect(page.getByText('Smoke test confidential post for the company feed.').first()).toBeVisible();

  const approveLayerButton = await resilientLocator(page, {
    description: 'smoke approve review layer button',
    primary: { locator: (currentPage) => currentPage.getByLabel(/Approve review layer for/i).first(), strategy: 'aria-label-regex' },
    fallbacks: [
      { selector: 'button:has-text("Approve layer")', strategy: 'text-match' },
    ],
  }, testInfo);

  await approveLayerButton.element.click();

  const profileLink = await resilientLocator(page, {
    description: 'smoke profile navigation link',
    primary: { locator: (currentPage) => currentPage.getByRole('link', { name: 'Profile' }), strategy: 'role-name' },
    fallbacks: [
      { locator: (currentPage) => currentPage.getByTestId('nav-profile'), strategy: 'data-testid' },
    ],
  }, testInfo);

  await profileLink.element.click();

  const adminToolsLink = await resilientLocator(page, {
    description: 'smoke admin tools link',
    primary: { locator: (currentPage) => currentPage.getByRole('link', { name: 'Admin Tools' }), strategy: 'role-name' },
    fallbacks: [
      { locator: (currentPage) => currentPage.getByTestId('profile-link-admin'), strategy: 'data-testid' },
    ],
  }, testInfo);

  await adminToolsLink.element.click();
  await expect(page.getByTestId('admin-page')).toBeVisible();
  const adminHeaders = {
    'x-role': 'Administrator',
    'x-username': 'admin.user',
  };

  await request.post(`${apiBaseUrl}/users`, {
    headers: adminHeaders,
    data: { username: 'playwright.user', role: 'Viewer' },
  });

  await page.reload();
  await expect(page).toHaveURL(/admin/);
  await expect(page.getByTestId('admin-page')).toBeVisible();

  const postsResponse = await request.get(`${apiBaseUrl}/posts`);
  const posts = await postsResponse.json();
  expect(posts.some((item) => item.content === 'Smoke test confidential post for the company feed.')).toBeTruthy();

  const usersResponse = await request.get(`${apiBaseUrl}/users`, {
    headers: adminHeaders,
  });
  const users = await usersResponse.json();
  expect(users.some((item) => item.username === 'playwright.user')).toBeTruthy();
});
