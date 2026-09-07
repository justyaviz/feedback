-- ALOO Marketing Feedback
-- Supabase SQL Editor'ga bir marta ishga tushiring.

create extension if not exists "pgcrypto";

create table if not exists public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  branch text not null,
  role text not null,
  marketing_score int not null check (marketing_score between 1 and 10),
  liked_activities text[] not null default '{}',
  biggest_problem text not null default '',
  best_channels text[] not null default '{}',
  support_level text not null check (support_level in ('Ha', 'Qisman', 'Yo‘q')),
  needed_help text[] not null default '{}',
  customer_feedback text not null default '',
  competitor_idea text not null default '',
  one_action text not null default '',
  plus_feedback text not null default '',
  minus_feedback text not null default '',
  exact_help text not null default '',
  created_at timestamptz not null default now()
);

alter table public.feedback_responses enable row level security;

drop policy if exists "anon can submit feedback" on public.feedback_responses;
create policy "anon can submit feedback"
on public.feedback_responses
for insert
to anon
with check (true);

drop policy if exists "authenticated users can submit feedback" on public.feedback_responses;
create policy "authenticated users can submit feedback"
on public.feedback_responses
for insert
to authenticated
with check (true);

drop policy if exists "authenticated users can read feedback" on public.feedback_responses;
create policy "authenticated users can read feedback"
on public.feedback_responses
for select
to authenticated
using (true);

-- Ixtiyoriy: real-time ishlatmoqchi bo‘lsangiz
-- alter publication supabase_realtime add table public.feedback_responses;
