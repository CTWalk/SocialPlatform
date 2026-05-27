import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool, types } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

types.setTypeParser(20, (value) => Number(value));

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeExecutionArgs(args) {
  if (args.length === 1 && (Array.isArray(args[0]) || isPlainObject(args[0]))) {
    return args[0];
  }
  return args;
}

function invokeSqliteStatement(statement, method, args) {
  const params = normalizeExecutionArgs(args);
  if (Array.isArray(params)) {
    return statement[method](...params);
  }
  if (isPlainObject(params)) {
    return statement[method](params);
  }
  return statement[method](params);
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

function transformSqlForPostgres(sql, params) {
  if (isPlainObject(params)) {
    return transformNamedSql(sql, params);
  }
  return transformPositionalSql(sql, Array.isArray(params) ? params : []);
}

function resolveSqliteFile() {
  return process.env.DB_FILE
    ? path.resolve(process.env.DB_FILE)
    : path.join(__dirname, 'social_platform.db');
}

function createSqliteDatabase() {
  const db = new Database(resolveSqliteFile());
  db.pragma('journal_mode = WAL');

  return {
    dialect: 'sqlite',
    async exec(sql) {
      db.exec(sql);
    },
    pragma(value) {
      return db.pragma(value);
    },
    prepare(sql) {
      const statement = db.prepare(sql);
      return {
        get: async (...args) => invokeSqliteStatement(statement, 'get', args),
        all: async (...args) => invokeSqliteStatement(statement, 'all', args),
        run: async (...args) => invokeSqliteStatement(statement, 'run', args),
      };
    },
    async close() {
      db.close();
    },
  };
}

function createPostgresDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX ?? '5'),
  });

  return {
    dialect: 'postgres',
    async exec(sql) {
      await pool.query(sql);
    },
    pragma() {
      return [];
    },
    prepare(sql) {
      return {
        get: async (...args) => {
          const params = normalizeExecutionArgs(args);
          const { text, values } = transformSqlForPostgres(sql, params);
          const result = await pool.query(text, values);
          return result.rows[0];
        },
        all: async (...args) => {
          const params = normalizeExecutionArgs(args);
          const { text, values } = transformSqlForPostgres(sql, params);
          const result = await pool.query(text, values);
          return result.rows;
        },
        run: async (...args) => {
          const params = normalizeExecutionArgs(args);
          const { text, values } = transformSqlForPostgres(sql, params);
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

export async function createDatabase() {
  if (process.env.DATABASE_URL) {
    return createPostgresDatabase();
  }

  return createSqliteDatabase();
}
