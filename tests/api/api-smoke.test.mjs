import test from 'node:test';
import assert from 'node:assert/strict';

const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3001';

async function request(path, options = {}) {
  const { headers = {}, ...rest } = options;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...rest,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  });
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { response, body };
}

test('health and meta endpoints are available', async () => {
  const health = await request('/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.body?.ok, true);
  assert.ok(
    health.body?.database === undefined || ['sqlite', 'postgres'].includes(health.body.database),
    `Unexpected database value: ${health.body?.database}`,
  );

  const meta = await request('/meta');
  assert.equal(meta.response.status, 200);
  assert.ok(Array.isArray(meta.body.roles));
  assert.ok(Array.isArray(meta.body.workflow));
  assert.ok(Array.isArray(meta.body.riskLevels));
});

test('viewer cannot create posts', async () => {
  const postCreate = await request('/posts', {
    method: 'POST',
    headers: {
      'x-role': 'Viewer',
      'x-username': 'viewer.test',
    },
    body: JSON.stringify({ author: 'viewer.test', content: 'Blocked post from API test.' }),
  });

  assert.equal(postCreate.response.status, 403);
});

test('member can create a normal published post', async () => {
  const content = `API smoke post ${Date.now()}`;
  const created = await request('/posts', {
    method: 'POST',
    headers: {
      'x-role': 'Member',
      'x-username': 'member.test',
    },
    body: JSON.stringify({ author: 'member.test', content }),
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body.status, 'Published');
  assert.equal(created.body.riskLevel, 'None');
  assert.equal(created.body.content, content);
});

test('keyword-triggered post uses layered review', async () => {
  const triggered = await request('/posts', {
    method: 'POST',
    headers: {
      'x-role': 'Member',
      'x-username': 'member.test',
    },
    body: JSON.stringify({ author: 'member.test', content: 'This confidential item needs review.' }),
  });

  assert.equal(triggered.response.status, 201);
  assert.equal(triggered.body.status, 'Pending Review');
  assert.equal(triggered.body.riskLevel, 'High');
  assert.equal(triggered.body.tasks.length, 3);
});

test('moderator can manage keyword rules', async () => {
  const keyword = `test-${Date.now()}`;
  const created = await request('/keyword-rules', {
    method: 'POST',
    headers: {
      'x-role': 'Moderator',
      'x-username': 'moderator.test',
    },
    body: JSON.stringify({ keyword, riskLevel: 'Low' }),
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body.keyword, keyword);
  assert.equal(created.body.riskLevel, 'Low');
});

test('mentions and inbox endpoints surface collaboration signals', async () => {
  const mentionPost = await request('/posts', {
    method: 'POST',
    headers: {
      'x-role': 'Member',
      'x-username': 'mia.chen',
    },
    body: JSON.stringify({
      author: 'mia.chen',
      boardSlug: 'engineering',
      content: 'Need @auditor.one to review this confidential rollout note.',
    }),
  });

  assert.equal(mentionPost.response.status, 201);

  const mentions = await request('/mentions', {
    headers: {
      'x-role': 'Reviewer',
      'x-username': 'auditor.one',
    },
  });

  assert.equal(mentions.response.status, 200);
  assert.ok(mentions.body.some((item) => item.postId === mentionPost.body.id));

  const inbox = await request('/inbox', {
    headers: {
      'x-role': 'Reviewer',
      'x-username': 'auditor.one',
    },
  });

  assert.equal(inbox.response.status, 200);
  assert.ok(inbox.body.some((item) => item.kind === 'mention' || item.kind === 'review'));
});

test('board memberships and saved smart lists persist user preferences', async () => {
  const memberships = await request('/board-memberships', {
    headers: {
      'x-role': 'Member',
      'x-username': 'mia.chen',
    },
  });

  assert.equal(memberships.response.status, 200);
  assert.ok(Array.isArray(memberships.body));

  const joined = await request('/board-memberships', {
    method: 'POST',
    headers: {
      'x-role': 'Member',
      'x-username': 'mia.chen',
    },
    body: JSON.stringify({ boardSlug: 'design' }),
  });

  assert.equal(joined.response.status, 201);
  assert.ok(joined.body.some((item) => item.boardSlug === 'design'));

  const savedList = await request('/saved-smart-lists', {
    method: 'POST',
    headers: {
      'x-role': 'Member',
      'x-username': 'mia.chen',
    },
    body: JSON.stringify({
      name: `High risk watch ${Date.now()}`,
      statusFilter: 'Pending Review',
      riskFilter: 'High',
      boardSlug: 'engineering',
    }),
  });

  assert.equal(savedList.response.status, 201);
  assert.ok(savedList.body.some((item) => item.boardSlug === 'engineering' && item.riskFilter === 'High'));
});

test('board invites and recommendations support collaborative board growth', async () => {
  const createdInvite = await request('/board-invites', {
    method: 'POST',
    headers: {
      'x-role': 'Member',
      'x-username': 'mia.chen',
    },
    body: JSON.stringify({
      boardSlug: 'engineering',
      invitee: `invitee.${Date.now()}`,
    }),
  });

  assert.equal(createdInvite.response.status, 201);
  const pendingInvite = createdInvite.body.find((item) => item.boardSlug === 'engineering' && item.status === 'Pending');
  assert.ok(pendingInvite);

  const duplicateInvite = await request('/board-invites', {
    method: 'POST',
    headers: {
      'x-role': 'Member',
      'x-username': 'mia.chen',
    },
    body: JSON.stringify({
      boardSlug: 'engineering',
      invitee: pendingInvite.invitee,
    }),
  });

  assert.equal(duplicateInvite.response.status, 200);
  assert.equal(
    duplicateInvite.body.filter((item) => item.boardSlug === 'engineering' && item.invitee === pendingInvite.invitee && item.status === 'Pending').length,
    1,
  );

  const inviteeView = await request('/board-invites', {
    headers: {
      'x-role': 'Member',
      'x-username': pendingInvite.invitee,
    },
  });

  assert.equal(inviteeView.response.status, 200);
  const visibleInvite = inviteeView.body.find((item) => item.id === pendingInvite.id);
  assert.ok(visibleInvite);

  const accepted = await request(`/board-invites/${pendingInvite.id}`, {
    method: 'PATCH',
    headers: {
      'x-role': 'Member',
      'x-username': pendingInvite.invitee,
    },
    body: JSON.stringify({ action: 'accept' }),
  });

  assert.equal(accepted.response.status, 200);
  assert.ok(accepted.body.some((item) => item.id === pendingInvite.id && item.status === 'Accepted'));

  const memberships = await request('/board-memberships', {
    headers: {
      'x-role': 'Member',
      'x-username': pendingInvite.invitee,
    },
  });

  assert.equal(memberships.response.status, 200);
  assert.ok(memberships.body.some((item) => item.boardSlug === 'engineering' && item.role === 'Member'));

  const recommendations = await request('/board-recommendations', {
    headers: {
      'x-role': 'Member',
      'x-username': 'kevin.liu',
    },
  });

  assert.equal(recommendations.response.status, 200);
  assert.ok(Array.isArray(recommendations.body));
  assert.ok(recommendations.body.every((item) => item.boardSlug !== 'all-company'));

  const ownerInvite = await request('/board-invites', {
    method: 'POST',
    headers: {
      'x-role': 'Member',
      'x-username': 'mia.chen',
    },
    body: JSON.stringify({
      boardSlug: 'engineering',
      invitee: `owner.queue.${Date.now()}`,
    }),
  });

  assert.equal(ownerInvite.response.status, 201);
  const withdrawTarget = ownerInvite.body.find((item) => item.boardSlug === 'engineering' && item.invitee.startsWith('owner.queue.'));
  assert.ok(withdrawTarget);

  const withdrawn = await request(`/board-invites/${withdrawTarget.id}`, {
    method: 'DELETE',
    headers: {
      'x-role': 'Member',
      'x-username': 'mia.chen',
    },
  });

  assert.equal(withdrawn.response.status, 200);
  assert.ok(!withdrawn.body.some((item) => item.id === withdrawTarget.id));
});

test('profile and preferences persist personal setup', async () => {
  const updatedProfile = await request('/me/profile', {
    method: 'PUT',
    headers: {
      'x-role': 'Member',
      'x-username': 'mia.chen',
    },
    body: JSON.stringify({
      displayName: 'Mia Product Chen',
      title: 'Launch Coordinator',
      location: 'Taipei',
      bio: 'Coordinates product communication and moderation handoff.',
    }),
  });

  assert.equal(updatedProfile.response.status, 200);
  assert.equal(updatedProfile.body.displayName, 'Mia Product Chen');

  const updatedPreferences = await request('/me/preferences', {
    method: 'PUT',
    headers: {
      'x-role': 'Member',
      'x-username': 'mia.chen',
    },
    body: JSON.stringify({
      theme: 'Dark',
      notificationsEnabled: false,
      defaultBoardSlug: 'design',
      digestCadence: 'Weekly',
    }),
  });

  assert.equal(updatedPreferences.response.status, 200);
  assert.equal(updatedPreferences.body.theme, 'Dark');
  assert.equal(updatedPreferences.body.notificationsEnabled, false);
  assert.equal(updatedPreferences.body.defaultBoardSlug, 'design');
  assert.equal(updatedPreferences.body.digestCadence, 'Weekly');
});

test('notifications and onboarding reflect first-run product progress', async () => {
  const journeyUser = `journey.${Date.now()}`;

  const initialOnboarding = await request('/me/onboarding', {
    headers: {
      'x-role': 'Member',
      'x-username': journeyUser,
    },
  });

  assert.equal(initialOnboarding.response.status, 200);
  assert.equal(initialOnboarding.body.profileCompleted, false);
  assert.equal(initialOnboarding.body.joinedBoard, false);

  const updatedProfile = await request('/me/profile', {
    method: 'PUT',
    headers: {
      'x-role': 'Member',
      'x-username': journeyUser,
    },
    body: JSON.stringify({
      displayName: 'Journey User',
      title: 'Platform Tester',
      location: 'Taipei',
      bio: 'Completing onboarding for smoke coverage.',
    }),
  });

  assert.equal(updatedProfile.response.status, 200);

  const joinedBoard = await request('/board-memberships', {
    method: 'POST',
    headers: {
      'x-role': 'Member',
      'x-username': journeyUser,
    },
    body: JSON.stringify({ boardSlug: 'design' }),
  });

  assert.equal(joinedBoard.response.status, 201);

  const savedList = await request('/saved-smart-lists', {
    method: 'POST',
    headers: {
      'x-role': 'Member',
      'x-username': journeyUser,
    },
    body: JSON.stringify({
      name: `Journey list ${Date.now()}`,
      boardSlug: 'design',
      riskFilter: 'Low',
    }),
  });

  assert.equal(savedList.response.status, 201);

  const reviewPost = await request('/posts', {
    method: 'POST',
    headers: {
      'x-role': 'Member',
      'x-username': 'member.journey',
    },
    body: JSON.stringify({
      author: 'member.journey',
      content: 'This confidential rollout needs reviewer input.',
      boardSlug: 'engineering',
    }),
  });

  assert.equal(reviewPost.response.status, 201);

  const reviewed = await request(`/posts/${reviewPost.body.id}/approve`, {
    method: 'PATCH',
    headers: {
      'x-role': 'Reviewer',
      'x-username': 'reviewer.journey',
    },
    body: JSON.stringify({ note: 'Reviewed during onboarding smoke.' }),
  });

  assert.equal(reviewed.response.status, 200);

  const reviewerOnboarding = await request('/me/onboarding', {
    headers: {
      'x-role': 'Reviewer',
      'x-username': 'reviewer.journey',
    },
  });

  assert.equal(reviewerOnboarding.response.status, 200);
  assert.equal(reviewerOnboarding.body.reviewedPost, true);

  await request('/board-invites', {
    method: 'POST',
    headers: {
      'x-role': 'Member',
      'x-username': 'mia.chen',
    },
    body: JSON.stringify({
      boardSlug: 'engineering',
      invitee: journeyUser,
    }),
  });

  const notifications = await request('/notifications', {
    headers: {
      'x-role': 'Member',
      'x-username': journeyUser,
    },
  });

  assert.equal(notifications.response.status, 200);
  const inviteNotification = notifications.body.find((item) => item.kind === 'invite');
  assert.ok(inviteNotification);
  assert.equal(inviteNotification.read, false);

  const markedRead = await request(`/notifications/${encodeURIComponent(inviteNotification.id)}/read`, {
    method: 'PATCH',
    headers: {
      'x-role': 'Member',
      'x-username': journeyUser,
    },
  });

  assert.equal(markedRead.response.status, 200);
  assert.ok(markedRead.body.some((item) => item.id === inviteNotification.id && item.read === true));

  const finalOnboarding = await request('/me/onboarding', {
    headers: {
      'x-role': 'Member',
      'x-username': journeyUser,
    },
  });

  assert.equal(finalOnboarding.response.status, 200);
  assert.equal(finalOnboarding.body.profileCompleted, true);
  assert.equal(finalOnboarding.body.joinedBoard, true);
  assert.equal(finalOnboarding.body.savedSmartList, true);
});
