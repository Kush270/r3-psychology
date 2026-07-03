-- ================================================================
-- Incremental migration: per-user psychometric results
-- Run once in Supabase > SQL Editor if you already ran schema.sql
-- before this table existed. Safe to re-run.
-- ================================================================

create table if not exists public.psychometric_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_code text not null,        -- 'dass21' | 'k10' | 'pcl5'
  test_name text not null,
  score text not null,            -- e.g. 'D:10 A:12 S:14' or '24'
  interpretation text not null,
  answers jsonb,                  -- raw per-question answers
  created_at timestamptz not null default now()
);

alter table public.psychometric_results enable row level security;

drop policy if exists "own rows" on public.psychometric_results;
create policy "own rows" on public.psychometric_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
