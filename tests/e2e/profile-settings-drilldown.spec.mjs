import { test, expect } from '@playwright/test';

const appBaseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:4201';

test('profile and settings drill-down routes stay reachable', async ({ page }) => {
  await page.goto(appBaseUrl);

  await page.getByLabel('Username').fill('admin.user');
  await page.getByLabel('Role').selectOption('Administrator');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/home/);

  await page.getByTestId('nav-profile').click();
  await expect(page.getByTestId('profile-page')).toBeVisible();

  await page.getByText('Edit Profile', { exact: true }).click();
  await page.getByText('Edit Details', { exact: true }).click();
  await expect(page).toHaveURL(/profile\/edit\/details/);
  await expect(page.getByTestId('profile-edit-details-page')).toBeVisible();

  await page.getByRole('button', { name: 'Back to profile' }).click();
  await expect(page).toHaveURL(/profile$/);

  await page.getByTestId('sidebar-settings').click();
  await expect(page.getByTestId('settings-page')).toBeVisible();

  await page.getByText('Notifications', { exact: true }).click();
  await expect(page).toHaveURL(/settings\/notifications/);
  await expect(page.getByTestId('settings-notifications-page')).toBeVisible();

  await page.getByRole('button', { name: 'Back to settings' }).click();
  await expect(page).toHaveURL(/settings$/);

  await page.getByText('About', { exact: true }).click();
  await expect(page).toHaveURL(/settings\/about/);
  await expect(page.getByTestId('settings-about-page')).toBeVisible();
});
