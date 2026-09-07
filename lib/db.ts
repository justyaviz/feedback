import { Pool } from "pg";

let pool: Pool | null = null;
let schemaReady = false;
let schemaPromise: Promise<void> | null = null;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return url;
}

function shouldUseSSL(url: string) {
  const explicit = String(process.env.DB_SSL || "").toLowerCase();
  if (["1", "true", "yes", "require"].includes(explicit)) return true;
  if (["0", "false", "no", "disable"].includes(explicit)) return false;

  // Railway private networking generally does not need forced SSL.
  return /sslmode=require/i.test(url) || /railway\.app/i.test(url);
}

export function db() {
  if (!pool) {
    const connectionString = getDatabaseUrl();
    pool = new Pool({
      connectionString,
      ssl: shouldUseSSL(connectionString) ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DB_POOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      statement_timeout: 15_000,
      query_timeout: 15_000
    });

    pool.on("error", (err) => {
      console.error("[db] unexpected pool error", err);
    });
  }
  return pool;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withDbRetry<T>(
  fn: () => Promise<T>,
  attempts = 4
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i === attempts - 1) break;
      await sleep(400 * Math.pow(2, i));
    }
  }

  throw lastError;
}

export async function ensureSchema() {
  if (schemaReady) return;
  if (schemaPromise) return schemaPromise;

  schemaPromise = withDbRetry(async () => {
    await db().query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS feedback_responses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        branch TEXT NOT NULL,
        role TEXT NOT NULL,
        marketing_score INTEGER NOT NULL CHECK (marketing_score BETWEEN 1 AND 10),
        liked_activities TEXT[] NOT NULL DEFAULT '{}',
        biggest_problem TEXT NOT NULL DEFAULT '',
        best_channels TEXT[] NOT NULL DEFAULT '{}',
        support_level TEXT NOT NULL CHECK (support_level IN ('Ha', 'Qisman', 'Yo‘q')),
        needed_help TEXT[] NOT NULL DEFAULT '{}',
        customer_feedback TEXT NOT NULL DEFAULT '',
        competitor_idea TEXT NOT NULL DEFAULT '',
        one_action TEXT NOT NULL DEFAULT '',
        plus_feedback TEXT NOT NULL DEFAULT '',
        minus_feedback TEXT NOT NULL DEFAULT '',
        exact_help TEXT NOT NULL DEFAULT '',
        user_agent TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE feedback_responses
        ADD COLUMN IF NOT EXISTS user_agent TEXT NOT NULL DEFAULT '';

      CREATE INDEX IF NOT EXISTS feedback_responses_created_at_idx
        ON feedback_responses (created_at DESC);

      CREATE INDEX IF NOT EXISTS feedback_responses_branch_idx
        ON feedback_responses (branch);

      CREATE INDEX IF NOT EXISTS feedback_responses_support_level_idx
        ON feedback_responses (support_level);
    `);

    schemaReady = true;
  }).finally(() => {
    schemaPromise = null;
  });

  return schemaPromise;
}

export async function dbPing() {
  const started = Date.now();
  await withDbRetry(() => db().query("SELECT 1"), 2);
  return Date.now() - started;
}
