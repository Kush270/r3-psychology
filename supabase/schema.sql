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

-- ---------- Dashboard (LaunchDesk) ----------

create table if not exists public.dashboards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'My Dashboard',
  visibility text not null default 'private',
  active_tab_id uuid,
  theme jsonb not null default '{"accent":"#285b54","wallpaper":""}',
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
alter table public.dashboards enable row level security;
alter table public.dashboard_tabs enable row level security;
alter table public.dashboard_widgets enable row level security;

drop policy if exists "own rows" on public.cpd_profile;
create policy "own rows" on public.cpd_profile for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.cpd_plans;
create policy "own rows" on public.cpd_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.cpd_activities;
create policy "own rows" on public.cpd_activities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.dashboards;
create policy "own rows" on public.dashboards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.dashboard_tabs;
create policy "own rows" on public.dashboard_tabs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.dashboard_widgets;
create policy "own rows" on public.dashboard_widgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- New-user bootstrap ----------
-- The moment someone signs up, give them an empty CPD profile and a default
-- dashboard with one "Home" tab, so the apps never have to handle a
-- no-row-yet case on first login.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
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
  for each row execute function public.handle_new_user();
