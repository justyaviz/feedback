import { Pool } from "pg";

let pool: Pool | null = null;
let schemaReady = false;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return url;
}

export function db() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
      max: 10,
      idleTimeoutMillis: 30000
    });
  }
  return pool;
}

export async function ensureSchema() {
  if (schemaReady) return;

  await db().query(`
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS feedback_responses_created_at_idx
      ON feedback_responses (created_at DESC);
    CREATE INDEX IF NOT EXISTS feedback_responses_branch_idx
      ON feedback_responses (branch);
  `);

  schemaReady = true;
}
