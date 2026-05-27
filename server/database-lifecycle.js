export const coreTableNames = [
  'users',
  'sessions',
  'posts',
  'moderation_rules',
  'post_reviews',
  'post_comments',
  'comment_reviews',
  'activity_logs',
  'board_memberships',
  'board_invites',
  'saved_smart_lists',
  'user_profiles',
  'user_preferences',
  'user_onboarding',
  'notification_reads',
];

const sqliteSchema = `
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    board_slug TEXT NOT NULL DEFAULT 'all-company',
    visibility TEXT NOT NULL DEFAULT 'Public',
    status TEXT NOT NULL,
    risk_level TEXT NOT NULL DEFAULT 'None',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS moderation_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL UNIQUE,
    risk_level TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_by TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS post_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    reviewer_role TEXT NOT NULL,
    status TEXT NOT NULL,
    reviewer TEXT,
    note TEXT,
    created_at TEXT NOT NULL,
    reviewed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS post_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT NOT NULL,
    author TEXT NOT NULL,
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Published',
    risk_level TEXT NOT NULL DEFAULT 'None',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS comment_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    post_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    reviewer_role TEXT NOT NULL,
    status TEXT NOT NULL,
    reviewer TEXT,
    note TEXT,
    created_at TEXT NOT NULL,
    reviewed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    username TEXT,
    role TEXT,
    post_id TEXT,
    task_id INTEGER,
    session_id TEXT,
    at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS board_memberships (
    username TEXT NOT NULL,
    board_slug TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Member',
    joined_at TEXT NOT NULL,
    PRIMARY KEY (username, board_slug)
  );
  CREATE TABLE IF NOT EXISTS board_invites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_slug TEXT NOT NULL,
    inviter TEXT NOT NULL,
    invitee TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS saved_smart_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    name TEXT NOT NULL,
    query TEXT NOT NULL DEFAULT '',
    status_filter TEXT NOT NULL DEFAULT '',
    risk_filter TEXT NOT NULL DEFAULT '',
    board_slug TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_profiles (
    username TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_preferences (
    username TEXT PRIMARY KEY,
    theme TEXT NOT NULL DEFAULT 'System',
    notifications_enabled INTEGER NOT NULL DEFAULT 1,
    default_board_slug TEXT NOT NULL DEFAULT 'all-company',
    digest_cadence TEXT NOT NULL DEFAULT 'Daily',
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_onboarding (
    username TEXT PRIMARY KEY,
    profile_completed INTEGER NOT NULL DEFAULT 0,
    joined_board INTEGER NOT NULL DEFAULT 0,
    saved_smart_list INTEGER NOT NULL DEFAULT 0,
    reviewed_post INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notification_reads (
    username TEXT NOT NULL,
    notification_id TEXT NOT NULL,
    read_at TEXT NOT NULL,
    PRIMARY KEY (username, notification_id)
  );
`;

const postgresSchema = `
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    board_slug TEXT NOT NULL DEFAULT 'all-company',
    visibility TEXT NOT NULL DEFAULT 'Public',
    status TEXT NOT NULL,
    risk_level TEXT NOT NULL DEFAULT 'None',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS moderation_rules (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    keyword TEXT NOT NULL UNIQUE,
    risk_level TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_by TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS post_reviews (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    post_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    reviewer_role TEXT NOT NULL,
    status TEXT NOT NULL,
    reviewer TEXT,
    note TEXT,
    created_at TEXT NOT NULL,
    reviewed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS post_comments (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    post_id TEXT NOT NULL,
    author TEXT NOT NULL,
    comment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Published',
    risk_level TEXT NOT NULL DEFAULT 'None',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS comment_reviews (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    comment_id INTEGER NOT NULL,
    post_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    reviewer_role TEXT NOT NULL,
    status TEXT NOT NULL,
    reviewer TEXT,
    note TEXT,
    created_at TEXT NOT NULL,
    reviewed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    username TEXT,
    role TEXT,
    post_id TEXT,
    task_id INTEGER,
    session_id TEXT,
    at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS board_memberships (
    username TEXT NOT NULL,
    board_slug TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Member',
    joined_at TEXT NOT NULL,
    PRIMARY KEY (username, board_slug)
  );
  CREATE TABLE IF NOT EXISTS board_invites (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    board_slug TEXT NOT NULL,
    inviter TEXT NOT NULL,
    invitee TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS saved_smart_lists (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL,
    name TEXT NOT NULL,
    query TEXT NOT NULL DEFAULT '',
    status_filter TEXT NOT NULL DEFAULT '',
    risk_filter TEXT NOT NULL DEFAULT '',
    board_slug TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_profiles (
    username TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_preferences (
    username TEXT PRIMARY KEY,
    theme TEXT NOT NULL DEFAULT 'System',
    notifications_enabled INTEGER NOT NULL DEFAULT 1,
    default_board_slug TEXT NOT NULL DEFAULT 'all-company',
    digest_cadence TEXT NOT NULL DEFAULT 'Daily',
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_onboarding (
    username TEXT PRIMARY KEY,
    profile_completed INTEGER NOT NULL DEFAULT 0,
    joined_board INTEGER NOT NULL DEFAULT 0,
    saved_smart_list INTEGER NOT NULL DEFAULT 0,
    reviewed_post INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notification_reads (
    username TEXT NOT NULL,
    notification_id TEXT NOT NULL,
    read_at TEXT NOT NULL,
    PRIMARY KEY (username, notification_id)
  );
`;

function now() {
  return new Date().toISOString();
}

function schemaForDialect(db) {
  return db.dialect === 'postgres' ? postgresSchema : sqliteSchema;
}

async function countRows(db, sql, ...params) {
  const row = await db.prepare(sql).get(...params);
  return Number(row?.count ?? 0);
}

async function ensurePostBoardColumn(db) {
  if (db.dialect !== 'sqlite') return;
  const columns = await db.prepare('PRAGMA table_info(posts)').all();
  const hasBoardSlug = columns.some((column) => column.name === 'board_slug');
  if (!hasBoardSlug) {
    await db.exec("ALTER TABLE posts ADD COLUMN board_slug TEXT NOT NULL DEFAULT 'all-company'");
  }
}

async function ensureBoardMembershipRoleColumn(db) {
  if (db.dialect !== 'sqlite') return;
  const columns = await db.prepare('PRAGMA table_info(board_memberships)').all();
  const hasRole = columns.some((column) => column.name === 'role');
  if (!hasRole) {
    await db.exec("ALTER TABLE board_memberships ADD COLUMN role TEXT NOT NULL DEFAULT 'Member'");
  }
}

async function ensureCommentModerationColumns(db) {
  if (db.dialect !== 'sqlite') return;
  const columns = await db.prepare('PRAGMA table_info(post_comments)').all();
  const hasStatus = columns.some((column) => column.name === 'status');
  const hasRiskLevel = columns.some((column) => column.name === 'risk_level');
  const hasUpdatedAt = columns.some((column) => column.name === 'updated_at');

  if (!hasStatus) {
    await db.exec("ALTER TABLE post_comments ADD COLUMN status TEXT NOT NULL DEFAULT 'Published'");
  }
  if (!hasRiskLevel) {
    await db.exec("ALTER TABLE post_comments ADD COLUMN risk_level TEXT NOT NULL DEFAULT 'None'");
  }
  if (!hasUpdatedAt) {
    await db.exec("ALTER TABLE post_comments ADD COLUMN updated_at TEXT");
  }

  await db.prepare(`
    UPDATE post_comments
    SET updated_at = COALESCE(NULLIF(updated_at, ''), created_at),
        status = COALESCE(NULLIF(status, ''), 'Published'),
        risk_level = COALESCE(NULLIF(risk_level, ''), 'None')
  `).run();
}

async function normalizeLegacyPostStatuses(db) {
  await db.prepare("UPDATE posts SET status = 'Pending Review' WHERE status = 'Under Review'").run();
}

async function migrateLegacyTables(db) {
  if (db.dialect !== 'sqlite') return;

  const legacyRules = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='keyword_rules'").get();
  const legacyTasks = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='review_tasks'").get();

  if (legacyRules && await countRows(db, 'SELECT COUNT(*) AS count FROM moderation_rules') === 0) {
    await db.prepare(`
      INSERT OR IGNORE INTO moderation_rules (id, keyword, risk_level, active, created_by, created_at)
      SELECT id, keyword, risk_level, active, created_by, created_at FROM keyword_rules
    `).run();
  }

  if (legacyTasks && await countRows(db, 'SELECT COUNT(*) AS count FROM post_reviews') === 0) {
    await db.prepare(`
      INSERT OR IGNORE INTO post_reviews (id, post_id, level, reviewer_role, status, reviewer, note, created_at, reviewed_at)
      SELECT id, post_id, level, reviewer_role, status, reviewer, note, created_at, reviewed_at FROM review_tasks
    `).run();
  }
}

async function seedIfEmpty(db) {
  if (await countRows(db, 'SELECT COUNT(*) AS count FROM users') === 0) {
    const insertUser = db.prepare('INSERT INTO users (username, role, active) VALUES (?, ?, ?)');
    await insertUser.run('mia.chen', 'Member', 1);
    await insertUser.run('kevin.liu', 'Member', 1);
    await insertUser.run('auditor.one', 'Reviewer', 1);
    await insertUser.run('auditor.two', 'Approver', 1);
    await insertUser.run('manager.one', 'Administrator', 1);
    await insertUser.run('moderator.one', 'Moderator', 1);
  }

  if (await countRows(db, 'SELECT COUNT(*) AS count FROM moderation_rules') === 0) {
    const insertRule = db.prepare('INSERT INTO moderation_rules (keyword, risk_level, active, created_by, created_at) VALUES (?, ?, ?, ?, ?)');
    await insertRule.run('project', 'Low', 1, 'manager.one', now());
    await insertRule.run('salary', 'Medium', 1, 'manager.one', now());
    await insertRule.run('confidential', 'High', 1, 'manager.one', now());
  }

  if (await countRows(db, 'SELECT COUNT(*) AS count FROM posts') === 0) {
    const insertPost = db.prepare(`
      INSERT INTO posts (id, author, content, board_slug, visibility, status, risk_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await insertPost.run('POST-1001', 'mia.chen', 'Working on our company project launch today.', 'all-company', 'Public', 'Published', 'Low', now(), now());
    await insertPost.run('POST-1002', 'kevin.liu', 'I need to update salary details for the new policy.', 'people-ops', 'Public', 'Pending Review', 'Medium', now(), now());
    await insertPost.run('POST-1003', 'mia.chen', 'This confidential plan needs extra approval.', 'engineering', 'Public', 'Pending Review', 'High', now(), now());

    const insertReview = db.prepare(`
      INSERT INTO post_reviews (post_id, level, reviewer_role, status, reviewer, note, created_at, reviewed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await insertReview.run('POST-1002', 1, 'Reviewer', 'Pending', null, 'Low keyword trigger', now(), null);
    await insertReview.run('POST-1003', 1, 'Reviewer', 'Approved', 'auditor.one', 'Layer 1 approved', now(), now());
    await insertReview.run('POST-1003', 2, 'Approver', 'Pending', null, 'Layer 2 pending', now(), null);
    await insertReview.run('POST-1003', 3, 'Moderator', 'Pending', null, 'Layer 3 pending', now(), null);
  }

  if (await countRows(db, 'SELECT COUNT(*) AS count FROM board_memberships') === 0) {
    const insertMembership = db.prepare(`
      INSERT INTO board_memberships (username, board_slug, role, joined_at)
      VALUES (?, ?, ?, ?)
    `);
    await insertMembership.run('mia.chen', 'all-company', 'Member', now());
    await insertMembership.run('mia.chen', 'engineering', 'Owner', now());
    await insertMembership.run('kevin.liu', 'all-company', 'Member', now());
    await insertMembership.run('kevin.liu', 'people-ops', 'Owner', now());
    await insertMembership.run('auditor.one', 'all-company', 'Member', now());
    await insertMembership.run('auditor.one', 'engineering', 'Member', now());
    await insertMembership.run('manager.one', 'all-company', 'Owner', now());
  }

  if (await countRows(db, 'SELECT COUNT(*) AS count FROM user_profiles') === 0) {
    const insertProfile = db.prepare(`
      INSERT INTO user_profiles (username, display_name, title, location, bio, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    await insertProfile.run('mia.chen', 'Mia Chen', 'Product Operations', 'Taipei', 'Bridges launch updates, moderation flow, and cross-team communication.', now());
    await insertProfile.run('kevin.liu', 'Kevin Liu', 'People Partner', 'Taipei', 'Coordinates policy updates and company-wide people operations messaging.', now());
    await insertProfile.run('auditor.one', 'Auditor One', 'Review Analyst', 'Remote', 'Handles moderation checks and layered approval flow.', now());
  }

  if (await countRows(db, 'SELECT COUNT(*) AS count FROM user_preferences') === 0) {
    const insertPreference = db.prepare(`
      INSERT INTO user_preferences (username, theme, notifications_enabled, default_board_slug, digest_cadence, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    await insertPreference.run('mia.chen', 'System', 1, 'engineering', 'Instant', now());
    await insertPreference.run('kevin.liu', 'Light', 1, 'people-ops', 'Daily', now());
    await insertPreference.run('auditor.one', 'Dark', 1, 'engineering', 'Instant', now());
  }
}

async function ensureDefaultModerationRules(db) {
  const upsertRule = db.prepare(`
    INSERT INTO moderation_rules (keyword, risk_level, active, created_by, created_at)
    VALUES (?, ?, 1, ?, ?)
    ON CONFLICT(keyword) DO UPDATE SET
      risk_level = excluded.risk_level,
      active = 1
  `);
  await upsertRule.run('project', 'Low', 'manager.one', now());
  await upsertRule.run('salary', 'Medium', 'manager.one', now());
  await upsertRule.run('confidential', 'High', 'manager.one', now());
}

export async function initializeDatabase(db) {
  await db.exec(schemaForDialect(db));
  await ensurePostBoardColumn(db);
  await ensureBoardMembershipRoleColumn(db);
  await ensureCommentModerationColumns(db);
  await normalizeLegacyPostStatuses(db);
  await migrateLegacyTables(db);
  await seedIfEmpty(db);
  await ensureDefaultModerationRules(db);
}

export async function listExistingTables(db) {
  if (db.dialect === 'sqlite') {
    const rows = await db.prepare(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all();
    return rows.map((row) => row.name);
  }

  const rows = await db.prepare(`
    SELECT table_name AS name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `).all();
  return rows.map((row) => row.name);
}
