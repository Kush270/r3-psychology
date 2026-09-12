-- ================================================================
-- r3psychology.com — Dashboard + CPD schema
--
-- Run this once in the Supabase dashboard: Project > SQL Editor > New query
-- > paste this whole file > Run. Safe to re-run (idempotent).
-- ================================================================

create extension if not exists "pgcrypto";

-- ---------- CPD ----------

create table if not exists public.cpd_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  title text not null default 'Dr',
  first_name text not null default '',
  last_name text not null default '',
  member_number text not null default '',
  grade text not null default 'Member',
  registration text not null default 'General registration',
  reduced boolean not null default false,
  endorsements text[] not null default '{}',
  plan_reviewed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.cpd_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  need text not null,
  activities text not null,
  dates text not null,
  outcomes text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cpd_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  date date not null,
  type text not null,
  activity text not null,
  details text not null,
  peer numeric not null default 0,
  active numeric not null default 0,
  other numeric not null default 0,
  colleagues text not null default '',
  reflection text not null,
  created_at timestamptz not null default now()
);

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

-- ---------- Dashboard (LaunchDesk) ----------

create table if not exists public.dashboards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'My Dashboard',
  visibility text not null default 'private',
  active_tab_id uuid,
  theme jsonb not null default '{"accent":"#2f6b75","wallpaper":""}',
  updated_at timestamptz not null default now()
);

create table if not exists public.dashboard_tabs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  visibility text not null default 'private',
  column_count int not null default 3,
  sort_order int not null default 0
);

create table if not exists public.dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  tab_id uuid not null references public.dashboard_tabs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  config jsonb not null default '{}',
  layout jsonb not null default '{}',
  appearance jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'dashboards_active_tab_fk'
  ) then
    alter table public.dashboards
      add constraint dashboards_active_tab_fk
      foreign key (active_tab_id) references public.dashboard_tabs(id) on delete set null;
  end if;
end $$;

-- ---------- Row Level Security: every table is private to its owner ----------

alter table public.cpd_profile enable row level security;
alter table public.cpd_plans enable row level security;
alter table public.cpd_activities enable row level security;
alter table public.psychometric_results enable row level security;
alter table public.dashboards enable row level security;
alter table public.dashboard_tabs enable row level security;
alter table public.dashboard_widgets enable row level security;

-- RLS and table privileges are separate checks. Anonymous visitors need no
-- direct table access; signed-in users receive only the operations used by the
-- browser applications.
revoke all on table public.cpd_profile, public.cpd_plans, public.cpd_activities,
  public.psychometric_results, public.dashboards, public.dashboard_tabs,
  public.dashboard_widgets from anon;

revoke all on table public.cpd_profile, public.cpd_plans, public.cpd_activities,
  public.psychometric_results, public.dashboards, public.dashboard_tabs,
  public.dashboard_widgets from authenticated;

grant select, update on table public.cpd_profile to authenticated;
grant select, insert, update, delete on table public.cpd_plans, public.cpd_activities,
  public.psychometric_results, public.dashboards, public.dashboard_tabs,
  public.dashboard_widgets to authenticated;

-- Remove the earlier broad policies when this file is re-run.
drop policy if exists "own rows" on public.cpd_profile;
drop policy if exists "own rows" on public.cpd_plans;
drop policy if exists "own rows" on public.cpd_activities;
drop policy if exists "own rows" on public.psychometric_results;
drop policy if exists "own rows" on public.dashboards;
drop policy if exists "own rows" on public.dashboard_tabs;
drop policy if exists "own rows" on public.dashboard_widgets;

drop policy if exists "select own profile" on public.cpd_profile;
drop policy if exists "update own profile" on public.cpd_profile;
drop policy if exists "select own plans" on public.cpd_plans;
drop policy if exists "insert own plans" on public.cpd_plans;
drop policy if exists "update own plans" on public.cpd_plans;
drop policy if exists "delete own plans" on public.cpd_plans;
drop policy if exists "select own activities" on public.cpd_activities;
drop policy if exists "insert own activities" on public.cpd_activities;
drop policy if exists "update own activities" on public.cpd_activities;
drop policy if exists "delete own activities" on public.cpd_activities;
drop policy if exists "select own psychometrics" on public.psychometric_results;
drop policy if exists "insert own psychometrics" on public.psychometric_results;
drop policy if exists "update own psychometrics" on public.psychometric_results;
drop policy if exists "delete own psychometrics" on public.psychometric_results;
drop policy if exists "select own dashboard" on public.dashboards;
drop policy if exists "insert own dashboard" on public.dashboards;
drop policy if exists "update own dashboard" on public.dashboards;
drop policy if exists "delete own dashboard" on public.dashboards;
drop policy if exists "select own dashboard tabs" on public.dashboard_tabs;
drop policy if exists "insert own dashboard tabs" on public.dashboard_tabs;
drop policy if exists "update own dashboard tabs" on public.dashboard_tabs;
drop policy if exists "delete own dashboard tabs" on public.dashboard_tabs;
drop policy if exists "select own dashboard widgets" on public.dashboard_widgets;
drop policy if exists "insert own dashboard widgets" on public.dashboard_widgets;
drop policy if exists "update own dashboard widgets" on public.dashboard_widgets;
drop policy if exists "delete own dashboard widgets" on public.dashboard_widgets;

create policy "select own profile" on public.cpd_profile for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "update own profile" on public.cpd_profile for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "select own plans" on public.cpd_plans for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "insert own plans" on public.cpd_plans for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "update own plans" on public.cpd_plans for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "delete own plans" on public.cpd_plans for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "select own activities" on public.cpd_activities for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "insert own activities" on public.cpd_activities for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "update own activities" on public.cpd_activities for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "delete own activities" on public.cpd_activities for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "select own psychometrics" on public.psychometric_results for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "insert own psychometrics" on public.psychometric_results for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "update own psychometrics" on public.psychometric_results for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "delete own psychometrics" on public.psychometric_results for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "select own dashboard" on public.dashboards for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "insert own dashboard" on public.dashboards for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "update own dashboard" on public.dashboards for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      active_tab_id is null
      or exists (
        select 1 from public.dashboard_tabs
        where dashboard_tabs.id = dashboards.active_tab_id
          and dashboard_tabs.user_id = (select auth.uid())
      )
    )
  );
create policy "delete own dashboard" on public.dashboards for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "select own dashboard tabs" on public.dashboard_tabs for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "insert own dashboard tabs" on public.dashboard_tabs for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "update own dashboard tabs" on public.dashboard_tabs for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "delete own dashboard tabs" on public.dashboard_tabs for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "select own dashboard widgets" on public.dashboard_widgets for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "insert own dashboard widgets" on public.dashboard_widgets for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.dashboard_tabs
      where dashboard_tabs.id = dashboard_widgets.tab_id
        and dashboard_tabs.user_id = (select auth.uid())
    )
  );
create policy "update own dashboard widgets" on public.dashboard_widgets for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.dashboard_tabs
      where dashboard_tabs.id = dashboard_widgets.tab_id
        and dashboard_tabs.user_id = (select auth.uid())
    )
  );
create policy "delete own dashboard widgets" on public.dashboard_widgets for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists cpd_plans_user_id_idx on public.cpd_plans (user_id);
create index if not exists cpd_activities_user_id_idx on public.cpd_activities (user_id);
create index if not exists psychometric_results_user_id_idx on public.psychometric_results (user_id);
create index if not exists dashboard_tabs_user_id_idx on public.dashboard_tabs (user_id);
create index if not exists dashboard_widgets_user_id_idx on public.dashboard_widgets (user_id);
create index if not exists dashboard_widgets_tab_id_idx on public.dashboard_widgets (tab_id);

-- ---------- New-user bootstrap ----------
-- The moment someone signs up, give them an empty CPD profile and a default
-- dashboard with one "Home" tab, so the apps never have to handle a
-- no-row-yet case on first login.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  home_tab_id uuid;
begin
  insert into public.cpd_profile (user_id) values (new.id);
  insert into public.dashboards (user_id) values (new.id);

  insert into public.dashboard_tabs (user_id, title, visibility, column_count, sort_order)
  values (new.id, 'Home', 'private', 3, 0)
  returning id into home_tab_id;

  update public.dashboards set active_tab_id = home_tab_id where user_id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

revoke all on function private.handle_new_user() from public, anon, authenticated;
drop function if exists public.handle_new_user();
