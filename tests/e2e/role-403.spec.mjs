import { test, expect } from '@playwright/test';

const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3001';

test('viewer cannot create users or posts through the API', async ({ request }) => {
  const userCreate = await request.post(`${apiBaseUrl}/users`, {
    headers: {
      'x-role': 'Viewer',
      'x-username': 'viewer.test',
    },
    data: { username: 'viewer-blocked', role: 'Auditor' },
  });
  expect(userCreate.status()).toBe(403);

  const postCreate = await request.post(`${apiBaseUrl}/posts`, {
    headers: {
      'x-role': 'Viewer',
      'x-username': 'viewer.test',
    },
    data: {
      author: 'viewer.test',
      content: 'Blocked post',
    },
  });
  expect(postCreate.status()).toBe(403);
});
