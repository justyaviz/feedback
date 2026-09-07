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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
