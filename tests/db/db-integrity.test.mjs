import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import { newDb } from 'pg-mem';
import { createDatabase } from '../../server/db.js';
import { coreTableNames, initializeDatabase, listExistingTables } from '../../server/database-lifecycle.js';

const artifactDir = path.join(process.cwd(), 'tests', 'artifacts', 'db');
const summaryJsonPath = path.join(artifactDir, 'db-verification-summary.json');
const summaryMdPath = path.join(artifactDir, 'db-verification-summary.md');
const records = [];
const tempDirs = [];

function record(result) {
  records.push({
    timestamp: new Date().toISOString(),
    ...result,
  });
}

function normalizeExecutionArgs(args) {
  if (args.length === 1 && (Array.isArray(args[0]) || isPlainObject(args[0]))) {
    return args[0];
  }
  return args;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function transformPositionalSql(sql, values) {
  let index = 0;
  return {
    text: sql.replace(/\?/g, () => {
      index += 1;
      return `$${index}`;
    }),
    values,
  };
}

function transformNamedSql(sql, params) {
  const values = [];
  const text = sql.replace(/@([A-Za-z_][A-Za-z0-9_]*)/g, (_match, key) => {
    values.push(params[key]);
    return `$${values.length}`;
  });
  return { text, values };
}

function transformSqlForPg(sql, params) {
  if (isPlainObject(params)) {
    return transformNamedSql(sql, params);
  }
  return transformPositionalSql(sql, Array.isArray(params) ? params : []);
}

function splitSqlStatements(sql) {
  return sql
    .split(/;\s*\n/g)
    .map((statement) => statement.trim())
    .filter(Boolean)
    .map((statement) => `${statement};`);
}

async function withSqliteDb(label, fn) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `social-platform-${label}-`));
  tempDirs.push(tempDir);
  const sqliteFile = path.join(tempDir, `${label}.db`);
  const previousDbFile = process.env.DB_FILE;
  const previousUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  process.env.DB_FILE = sqliteFile;

  const db = await createDatabase();
  try {
    return await fn(db, { sqliteFile, tempDir });
  } finally {
    await db.close();
    if (previousDbFile === undefined) delete process.env.DB_FILE;
    else process.env.DB_FILE = previousDbFile;
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
  }
}

async function withRealPostgresDb(fn) {
  if (!process.env.DATABASE_URL) return null;
  const previousDbFile = process.env.DB_FILE;
  delete process.env.DB_FILE;
  const db = await createDatabase();
  try {
    return await fn(db);
  } finally {
    await db.close();
    if (previousDbFile === undefined) delete process.env.DB_FILE;
    else process.env.DB_FILE = previousDbFile;
  }
}

function createPgMemAdapter() {
  const memoryDb = newDb({ autoCreateForeignKeyIndices: true });
  const { Pool } = memoryDb.adapters.createPg();
  const pool = new Pool();

  return {
    dialect: 'postgres',
    async exec(sql) {
      for (const statement of splitSqlStatements(sql)) {
        await pool.query(statement);
      }
    },
    prepare(sql) {
      return {
        get: async (...args) => {
          const params = normalizeExecutionArgs(args);
          const { text, values } = transformSqlForPg(sql, params);
          const result = await pool.query(text, values);
          return result.rows[0];
        },
        all: async (...args) => {
          const params = normalizeExecutionArgs(args);
          const { text, values } = transformSqlForPg(sql, params);
          const result = await pool.query(text, values);
          return result.rows;
        },
        run: async (...args) => {
          const params = normalizeExecutionArgs(args);
          const { text, values } = transformSqlForPg(sql, params);
          const result = await pool.query(text, values);
          return {
            changes: result.rowCount,
            rowCount: result.rowCount,
            lastInsertRowid: result.rows[0]?.id ?? null,
            rows: result.rows,
          };
        },
      };
    },
    async close() {
      await pool.end();
    },
  };
}

async function assertCoreSchemaAndSeed(db, label) {
  await initializeDatabase(db);
  const tables = await listExistingTables(db);
  const missingTables = coreTableNames.filter((table) => !tables.includes(table));
  assert.deepEqual(missingTables, [], `${label}: missing core tables`);

  const usersCount = Number((await db.prepare('SELECT COUNT(*) AS count FROM users').get())?.count ?? 0);
  const rulesCount = Number((await db.prepare('SELECT COUNT(*) AS count FROM moderation_rules').get())?.count ?? 0);
  const postsCount = Number((await db.prepare('SELECT COUNT(*) AS count FROM posts').get())?.count ?? 0);

  assert.ok(usersCount >= 6, `${label}: expected seeded users`);
  assert.ok(rulesCount >= 3, `${label}: expected seeded moderation rules`);
  assert.ok(postsCount >= 3, `${label}: expected seeded posts`);

  const sessionId = `session-${randomUUID()}`;
  await db.prepare('INSERT INTO sessions (id, username, role, created_at) VALUES (?, ?, ?, ?)').run(
    sessionId,
    'db.tester',
    'Administrator',
    new Date().toISOString(),
  );
  const insertedSession = await db.prepare('SELECT id, username FROM sessions WHERE id = ?').get(sessionId);
  assert.equal(insertedSession?.id, sessionId, `${label}: expected inserted session`);

  record({
    suite: 'db-integrity',
    dialect: label,
    status: 'passed',
    detail: `users=${usersCount}, rules=${rulesCount}, posts=${postsCount}`,
  });
}

after(async () => {
  await fs.mkdir(artifactDir, { recursive: true });
  await fs.writeFile(summaryJsonPath, JSON.stringify(records, null, 2), 'utf8');

  const lines = [
    '# DB Verification Summary',
    '',
    `- Total checks: ${records.length}`,
    '',
    '## Results',
    ...records.map((entry) => `- ${entry.timestamp} | ${entry.dialect} | ${entry.status} | ${entry.detail}`),
    '',
  ];
  await fs.writeFile(summaryMdPath, lines.join('\n'), 'utf8');

  await Promise.all(tempDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

test('DB integrity suite', async (t) => {
  await t.test('sqlite initializes schema, seed data, and read-write behavior', async () => {
    await withSqliteDb('sqlite-integrity', async (db) => {
      await assertCoreSchemaAndSeed(db, 'sqlite');
    });
  });

  await t.test('sqlite upgrades legacy schema and migrates legacy data', async () => {
    await withSqliteDb('sqlite-legacy', async (db) => {
      await db.exec(`
        CREATE TABLE posts (
          id TEXT PRIMARY KEY,
          author TEXT NOT NULL,
          content TEXT NOT NULL,
          visibility TEXT NOT NULL DEFAULT 'Public',
          status TEXT NOT NULL,
          risk_level TEXT NOT NULL DEFAULT 'None',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE board_memberships (
          username TEXT NOT NULL,
          board_slug TEXT NOT NULL,
          joined_at TEXT NOT NULL,
          PRIMARY KEY (username, board_slug)
        );
        CREATE TABLE post_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id TEXT NOT NULL,
          author TEXT NOT NULL,
          comment TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE keyword_rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          keyword TEXT NOT NULL UNIQUE,
          risk_level TEXT NOT NULL,
          active INTEGER NOT NULL DEFAULT 1,
          created_by TEXT,
          created_at TEXT NOT NULL
        );
        CREATE TABLE review_tasks (
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
      `);

      await db.prepare(`
        INSERT INTO posts (id, author, content, visibility, status, risk_level, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run('POST-LEGACY', 'legacy.user', 'Legacy post content', 'Public', 'Under Review', 'High', '2025-01-01T00:00:00.000Z', '2025-01-01T00:00:00.000Z');

      await db.prepare(`
        INSERT INTO board_memberships (username, board_slug, joined_at)
        VALUES (?, ?, ?)
      `).run('legacy.user', 'engineering', '2025-01-01T00:00:00.000Z');

      await db.prepare(`
        INSERT INTO post_comments (post_id, author, comment, created_at)
        VALUES (?, ?, ?, ?)
      `).run('POST-LEGACY', 'legacy.user', 'Legacy moderated comment', '2025-01-01T00:00:00.000Z');

      await db.prepare(`
        INSERT INTO keyword_rules (keyword, risk_level, active, created_by, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run('secretsauce', 'High', 1, 'legacy.admin', '2025-01-01T00:00:00.000Z');

      await db.prepare(`
        INSERT INTO review_tasks (post_id, level, reviewer_role, status, reviewer, note, created_at, reviewed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run('POST-LEGACY', 1, 'Reviewer', 'Pending', null, 'Legacy pending review', '2025-01-01T00:00:00.000Z', null);

      await initializeDatabase(db);

      const migratedStatus = await db.prepare('SELECT status, board_slug AS boardSlug FROM posts WHERE id = ?').get('POST-LEGACY');
      assert.equal(migratedStatus?.status, 'Pending Review');
      assert.equal(migratedStatus?.boardSlug, 'all-company');

      const membership = await db.prepare('SELECT role FROM board_memberships WHERE username = ? AND board_slug = ?').get('legacy.user', 'engineering');
      assert.equal(membership?.role, 'Member');

      const migratedRule = await db.prepare('SELECT keyword FROM moderation_rules WHERE keyword = ?').get('secretsauce');
      assert.equal(migratedRule?.keyword, 'secretsauce');

      const migratedTask = await db.prepare('SELECT post_id AS postId, reviewer_role AS reviewerRole FROM post_reviews WHERE post_id = ?').get('POST-LEGACY');
      assert.equal(migratedTask?.postId, 'POST-LEGACY');
      assert.equal(migratedTask?.reviewerRole, 'Reviewer');

      const comment = await db.prepare('SELECT status, risk_level AS riskLevel, updated_at AS updatedAt FROM post_comments WHERE post_id = ?').get('POST-LEGACY');
      assert.equal(comment?.status, 'Published');
      assert.equal(comment?.riskLevel, 'None');
      assert.equal(comment?.updatedAt, '2025-01-01T00:00:00.000Z');

      record({
        suite: 'db-integrity',
        dialect: 'sqlite-legacy',
        status: 'passed',
        detail: 'legacy schema upgraded and migrated successfully',
      });
    });
  });

  await t.test('pg-mem validates postgres dialect schema and seed flow locally', async () => {
    const db = createPgMemAdapter();
    try {
      await assertCoreSchemaAndSeed(db, 'postgres-memory');
    } finally {
      await db.close();
    }
  });

  await t.test('real postgres adapter runs when DATABASE_URL is available', async (t) => {
    if (!process.env.DATABASE_URL) {
      record({
        suite: 'db-integrity',
        dialect: 'postgres-real',
        status: 'skipped',
        detail: 'DATABASE_URL not provided locally',
      });
      t.diagnostic('Skipping real Postgres verification because DATABASE_URL is not set.');
      return;
    }

    await withRealPostgresDb(async (db) => {
      await assertCoreSchemaAndSeed(db, 'postgres-real');
    });
  });
});
