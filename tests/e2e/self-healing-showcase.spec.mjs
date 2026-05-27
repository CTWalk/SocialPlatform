import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import { readHealingEntries, resetHealingArtifacts, writeHealingSummary, healingSummaryPath } from '../utils/healing-report.mjs';
import { resilientLocator } from '../utils/resilient-locator.mjs';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:4201';

test.describe('Self-healing locator showcase', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    await resetHealingArtifacts();
  });

  test.afterAll(async () => {
    const entries = await readHealingEntries();
    await writeHealingSummary(entries);
  });

  test('heals stale login and navigation selectors while logging evidence', async ({ page }, testInfo) => {
    await page.goto(baseUrl);

    const usernameInput = await resilientLocator(page, {
      description: 'login username input',
      primary: { selector: '[data-legacy-id="username-input"]', strategy: 'legacy-data-attribute' },
      fallbacks: [
        { locator: (currentPage) => currentPage.getByLabel('Username'), strategy: 'aria-label' },
        { selector: 'input[formcontrolname="username"]', strategy: 'form-control-name' },
      ],
    }, testInfo);

    const roleSelect = await resilientLocator(page, {
      description: 'login role select',
      primary: { selector: '#legacy-role-select', strategy: 'legacy-id' },
      fallbacks: [
        { locator: (currentPage) => currentPage.getByLabel('Role'), strategy: 'aria-label' },
        { selector: 'select[formcontrolname="role"]', strategy: 'form-control-name' },
      ],
    }, testInfo);

    const loginButton = await resilientLocator(page, {
      description: 'login submit button',
      primary: { selector: '#submit-btn', strategy: 'legacy-id' },
      fallbacks: [
        { locator: (currentPage) => currentPage.getByRole('button', { name: 'Sign in' }), strategy: 'role-name' },
        { selector: 'button[type="submit"]', strategy: 'semantic-submit' },
      ],
    }, testInfo);

    expect(usernameInput.healed).toBeTruthy();
    expect(roleSelect.healed).toBeTruthy();
    expect(loginButton.healed).toBeTruthy();

    await usernameInput.element.fill('admin.user');
    await roleSelect.element.selectOption('Administrator');
    await loginButton.element.click();

    await expect(page).toHaveURL(/home/);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    const rulesTab = await resilientLocator(page, {
      description: 'keyword rules entry',
      primary: { selector: 'nav >> text=Moderation Rules', strategy: 'stale-nav-label' },
      fallbacks: [
        { locator: (currentPage) => currentPage.getByRole('link', { name: 'Rules' }), strategy: 'desktop-role-name' },
        { locator: (currentPage) => currentPage.getByTestId('nav-rules'), strategy: 'data-testid' },
      ],
    }, testInfo);

    expect(rulesTab.healed).toBeTruthy();
    await rulesTab.element.click();
    await expect(page.getByTestId('rules-page')).toBeVisible();

    const entries = await readHealingEntries();
    expect(entries.length).toBeGreaterThanOrEqual(4);
    expect(entries.some((entry) => entry.description === 'login submit button')).toBeTruthy();
  });

  test('writes a markdown healing summary artifact', async ({ page }, testInfo) => {
    await page.goto(baseUrl);

    const usernameInput = await resilientLocator(page, {
      description: 'login username input summary run',
      primary: { selector: '[data-legacy-id="username-input"]', strategy: 'legacy-data-attribute' },
      fallbacks: [
        { locator: (currentPage) => currentPage.getByLabel('Username'), strategy: 'aria-label' },
      ],
    }, testInfo);

    const roleSelect = await resilientLocator(page, {
      description: 'login role select summary run',
      primary: { selector: '#legacy-role-select', strategy: 'legacy-id' },
      fallbacks: [
        { locator: (currentPage) => currentPage.getByLabel('Role'), strategy: 'aria-label' },
      ],
    }, testInfo);

    const loginButton = await resilientLocator(page, {
      description: 'login submit button summary run',
      primary: { selector: '#submit-btn', strategy: 'legacy-id' },
      fallbacks: [
        { locator: (currentPage) => currentPage.getByRole('button', { name: 'Sign in' }), strategy: 'role-name' },
      ],
    }, testInfo);

    await usernameInput.element.fill('mia.chen');
    await roleSelect.element.selectOption('Member');
    await loginButton.element.click();

    const profileLink = await resilientLocator(page, {
      description: 'profile quick navigation',
      primary: { selector: 'a[href="/legacy-profile"]', strategy: 'stale-route' },
      fallbacks: [
        { locator: (currentPage) => currentPage.getByRole('link', { name: 'Profile' }), strategy: 'role-name' },
        { locator: (currentPage) => currentPage.getByTestId('nav-profile'), strategy: 'data-testid' },
      ],
    }, testInfo);

    expect(profileLink.healed).toBeTruthy();
    await profileLink.element.click();
    await expect(page.getByTestId('profile-page')).toBeVisible();

    const entries = await readHealingEntries();
    await writeHealingSummary(entries);
    const summary = await fs.readFile(healingSummaryPath, 'utf8');
    expect(entries.length).toBeGreaterThan(0);
    expect(summary).toContain('Self-Healing Summary');
    expect(summary).toContain('profile quick navigation');
  });
});
