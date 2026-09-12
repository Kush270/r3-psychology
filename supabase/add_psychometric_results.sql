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
drop policy if exists "select own psychometrics" on public.psychometric_results;
drop policy if exists "insert own psychometrics" on public.psychometric_results;
drop policy if exists "update own psychometrics" on public.psychometric_results;
drop policy if exists "delete own psychometrics" on public.psychometric_results;
revoke all on table public.psychometric_results from anon;
revoke all on table public.psychometric_results from authenticated;
grant select, insert, update, delete on table public.psychometric_results to authenticated;

create policy "select own psychometrics" on public.psychometric_results for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "insert own psychometrics" on public.psychometric_results for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "update own psychometrics" on public.psychometric_results for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "delete own psychometrics" on public.psychometric_results for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists psychometric_results_user_id_idx
  on public.psychometric_results (user_id);
