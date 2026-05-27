import { test, expect, devices } from '@playwright/test';

const appBaseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:4201';
const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3001';
const { defaultBrowserType: _iphoneBrowser, ...iPhone13 } = devices['iPhone 13'];
const uiTimeout = 20000;

async function login(page, { username, role }) {
  await test.step(`login as ${role}`, async () => {
    await page.goto(appBaseUrl);
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Role').selectOption(role);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/home|dashboard/, { timeout: uiTimeout });
  });
}

async function resetSession(page) {
  await test.step('reset session', async () => {
    await page.goto(appBaseUrl);
    await page.evaluate(() => {
      localStorage.removeItem('social-platform-session');
    });
  });
}

async function clickVisibleNav(page, desktopTestId, mobileTestId) {
  const desktop = page.getByTestId(desktopTestId);
  const mobile = page.getByTestId(mobileTestId);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (await mobile.isVisible().catch(() => false)) {
      await mobile.click();
      return;
    }

    if (await desktop.isVisible().catch(() => false)) {
      await desktop.click();
      return;
    }

    await page.waitForTimeout(200);
  }

  throw new Error(`Navigation controls "${desktopTestId}" and "${mobileTestId}" never became visible.`);
}

async function createFlaggedPost(page, request, { author, content }) {
  return test.step('seed a flagged post for review flow', async () => {
    const createResponse = await request.post(`${apiBaseUrl}/posts`, {
      headers: {
        'x-role': 'Member',
        'x-username': author,
      },
      data: {
        author,
        content,
        boardSlug: 'engineering',
      },
    });

    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();

    expect(created.id).toBeTruthy();
    expect(created.author).toBe(author);
    expect(created.status).toBe('Pending Review');
    expect(created.riskLevel).toBe('High');
    expect(Array.isArray(created.tasks)).toBeTruthy();
    expect(created.tasks.length).toBeGreaterThanOrEqual(1);
    return created;
  });
}

async function openReviewQueueFromActivity(page) {
  await test.step('open review queue from activity', async () => {
    await clickVisibleNav(page, 'nav-activity', 'nav-activity-mobile');
    await expect(page.getByTestId('activity-page')).toBeVisible({ timeout: uiTimeout });

    const reviewQueueLink = page.getByRole('link', { name: 'Review queue' }).first();
    await expect(reviewQueueLink).toBeVisible({ timeout: uiTimeout });
    await reviewQueueLink.scrollIntoViewIfNeeded();

    try {
      await reviewQueueLink.click({ timeout: 5000 });
    } catch {
      await page.goto(`${appBaseUrl}/moderation/review`);
    }

    await expect(page).toHaveURL(/moderation\/review/, { timeout: uiTimeout });
    await expect.poll(async () => {
      if (await page.getByTestId('review-page').isVisible().catch(() => false)) {
        return 'desktop';
      }
      if (await page.locator('[data-testid^="review-task-"]').first().isVisible().catch(() => false)) {
        return 'task-list';
      }
      return '';
    }, { timeout: uiTimeout }).not.toBe('');
  });
}

async function openReviewTask(page, postToken) {
  return test.step(`open review task for ${postToken}`, async () => {
    const card = page.locator('[data-testid^="review-task-"]').filter({ hasText: postToken }).first();
    await expect(card).toBeVisible({ timeout: uiTimeout });
    await card.click();
    await expect(page.getByTestId('review-post-detail')).toBeVisible({ timeout: uiTimeout });
    await expect(page.getByTestId('review-post-detail')).toContainText(postToken);
    return card;
  });
}

async function approveAllPendingLayers(page, postToken) {
  await test.step(`approve all pending layers for ${postToken}`, async () => {
    const matchingCards = () => page.locator('[data-testid^="review-task-"]').filter({ hasText: postToken });

    await expect.poll(async () => await matchingCards().count(), { timeout: uiTimeout }).toBeGreaterThan(0);

    for (let remaining = await matchingCards().count(); remaining > 0; remaining = await matchingCards().count()) {
      await openReviewTask(page, postToken);
      await page.getByTestId('review-post-detail').getByRole('button', { name: /^Approve$/ }).click();
      await expect.poll(async () => await matchingCards().count(), { timeout: uiTimeout }).toBeLessThan(remaining);
    }
  });
}

async function rejectFirstPendingLayer(page, postToken) {
  await test.step(`reject first pending layer for ${postToken}`, async () => {
    await openReviewTask(page, postToken);
    const rejectResponsePromise = page.waitForResponse((response) =>
      response.request().method() === 'PATCH' && response.url().endsWith('/reject'),
    );
    await page.getByTestId('review-post-detail').getByRole('button', { name: /^Reject$/ }).click();
    const rejectResponse = await rejectResponsePromise;
    expect(rejectResponse.ok()).toBeTruthy();
  });
}

async function openThreadFromBoards(page, post) {
  await test.step(`reopen board thread ${post.id}`, async () => {
    await page.goto(`${appBaseUrl}/boards?board=${encodeURIComponent(post.boardSlug)}&postId=${encodeURIComponent(post.id)}`);
    const detail = page.getByTestId('feed-post-detail');
    await expect(detail).toBeVisible({ timeout: uiTimeout });
    await expect(detail).toContainText(post.content);
  });
}

test.describe('review moderation transitions', () => {
  test('desktop approve path keeps review flow stable across layer approvals', async ({ page, request }) => {
    const token = `desktop-approve-${Date.now()}`;
    const memberUsername = `member.${token}`;
    const content = `This confidential migration post ${token} needs full approval.`;

    await login(page, { username: memberUsername, role: 'Member' });
    const created = await createFlaggedPost(page, request, { author: memberUsername, content });

    await resetSession(page);
    await login(page, { username: 'manager.one', role: 'Administrator' });
    await openReviewQueueFromActivity(page);
    await approveAllPendingLayers(page, token);

    await resetSession(page);
    await login(page, { username: memberUsername, role: 'Member' });
    await openThreadFromBoards(page, created);
    await expect(page.getByTestId('feed-post-detail')).toContainText('Published');
  });

  test.describe('mobile reject path keeps review access stable', () => {
    test.use(iPhone13);

    test('member and reviewer can complete the rejection route on mobile', async ({ page, request }) => {
      const token = `mobile-reject-${Date.now()}`;
      const memberUsername = `member.${token}`;
      const content = `This confidential mobile migration post ${token} should be rejected.`;

      await login(page, { username: memberUsername, role: 'Member' });
      const created = await createFlaggedPost(page, request, { author: memberUsername, content });

      await resetSession(page);
      await login(page, { username: 'manager.one', role: 'Administrator' });
      await openReviewQueueFromActivity(page);
      await rejectFirstPendingLayer(page, token);

      await resetSession(page);
      await login(page, { username: memberUsername, role: 'Member' });
      await openThreadFromBoards(page, created);
      await expect(page.getByTestId('feed-post-detail')).toContainText('Rejected');
    });
  });
});
