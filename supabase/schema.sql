-- ZELLA — schema completo (rodar uma vez no SQL Editor do Supabase)
-- Versão: 2026-04-14

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES (1 row por usuário, id = auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text default '',
  xp int default 0,
  level int default 1,
  coins int default 0,
  streak int default 0,
  current_step int default 1,
  current_phase int default 1,
  revenue numeric default 0,
  fixed_costs numeric default 0,
  total_balance numeric default 0,
  ie numeric default 0,
  is_metric numeric default 0,
  id_metric numeric default 0,
  rs numeric default 0,
  active_avatar text default 'default',
  unlocked_avatars text[] default array['default'],
  active_character text default 'panda',
  unlocked_characters text[] default array['panda'],
  active_theme text default 'classic',
  unlocked_themes text[] default array['classic'],
  active_title text,
  unlocked_titles text[] default array[]::text[],
  inventory jsonb default '{"freezeStreak":0,"xpMultiplier":0}'::jsonb,
  goals jsonb default '[]'::jsonb,
  daily_quiz_completed_at timestamptz,
  daily_coins_earned int default 0,
  last_login_date text,
  has_onboarded boolean default false,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRANSACTIONS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount numeric not null,
  category text not null,
  type text not null check (type in ('income','expense')),
  description text,
  date timestamptz not null default now(),
  is_ai_generated boolean default false,
  created_at timestamptz default now()
);
create index if not exists transactions_user_date_idx on transactions(user_id, date desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- MISSIONS (catálogo global)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  category text,
  icon text,
  xp_reward int default 0,
  coins_reward int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- USER_MISSIONS (completions)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists user_missions (
  user_id uuid not null references profiles(id) on delete cascade,
  mission_id uuid not null references missions(id) on delete cascade,
  score int default 0,
  completed_at timestamptz default now(),
  primary key (user_id, mission_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW: leaderboard público (sem dados financeiros)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace view leaderboard_view as
  select id, coalesce(nullif(name, ''), 'Jogador') as name, xp, streak, current_step, level
  from profiles
  where xp > 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table missions enable row level security;
alter table user_missions enable row level security;

-- Drop antigas (re-run safety)
drop policy if exists "profiles self read"   on profiles;
drop policy if exists "profiles self update" on profiles;
drop policy if exists "profiles self insert" on profiles;
drop policy if exists "tx self read"   on transactions;
drop policy if exists "tx self insert" on transactions;
drop policy if exists "tx self update" on transactions;
drop policy if exists "tx self delete" on transactions;
drop policy if exists "missions public read" on missions;
drop policy if exists "um self read"   on user_missions;
drop policy if exists "um self write"  on user_missions;
drop policy if exists "um self update" on user_missions;

-- Profiles: user only sees/updates own row
create policy "profiles self read"   on profiles for select using (auth.uid() = id);
create policy "profiles self update" on profiles for update using (auth.uid() = id);
create policy "profiles self insert" on profiles for insert with check (auth.uid() = id);

-- Transactions: scoped per user
create policy "tx self read"   on transactions for select using (auth.uid() = user_id);
create policy "tx self insert" on transactions for insert with check (auth.uid() = user_id);
create policy "tx self update" on transactions for update using (auth.uid() = user_id);
create policy "tx self delete" on transactions for delete using (auth.uid() = user_id);

-- Missions: catálogo público
create policy "missions public read" on missions for select using (true);

-- User_missions: scoped per user
create policy "um self read"   on user_missions for select using (auth.uid() = user_id);
create policy "um self write"  on user_missions for insert with check (auth.uid() = user_id);
create policy "um self update" on user_missions for update using (auth.uid() = user_id);

-- Leaderboard view: leitura pública (via anon/authenticated)
grant select on leaderboard_view to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER: cria row em profiles quando novo usuário se cadastra em auth.users
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER: updated_at automático
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_touch_updated_at on profiles;
create trigger profiles_touch_updated_at
before update on profiles
for each row execute function public.touch_updated_at();
