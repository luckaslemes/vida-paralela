-- VIDA PARALELA | Schema inicial PostgreSQL / Supabase
-- Execute no SQL Editor do seu projeto Supabase.
-- Todas as tabelas privadas usam RLS e ficam isoladas por usuário.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'America/Sao_Paulo',
  plan text not null default 'free' check (plan in ('free','premium')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'personal',
  target_date date,
  status text not null default 'active' check (status in ('active','completed','paused')),
  created_at timestamptz not null default now()
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  context text,
  decision_date date,
  status text not null default 'considering' check (status in ('considering','decided','reviewed')),
  chosen_path text,
  actual_outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  decision_id uuid references public.decisions(id) on delete cascade,
  label text not null,
  description text,
  assumptions jsonb not null default '{}'::jsonb,
  outcomes jsonb not null default '{}'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  opportunities jsonb not null default '[]'::jsonb,
  horizon_years integer[] not null default array[1,5,10],
  is_hypothetical boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income','expense')),
  description text not null,
  amount numeric(14,2) not null check (amount > 0),
  category text not null default 'other',
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  due_at timestamptz,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  reminder_type text not null default 'general',
  scheduled_at timestamptz,
  recurrence text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  source text not null default 'personal',
  reflection_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nova conversa',
  module text not null default 'general',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','premium')),
  status text not null default 'inactive' check (status in ('inactive','trialing','active','past_due','canceled')),
  provider text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- Índices para consultas comuns
create index if not exists idx_goals_user on public.goals(user_id, status);
create index if not exists idx_decisions_user on public.decisions(user_id, created_at desc);
create index if not exists idx_scenarios_decision on public.scenarios(decision_id);
create index if not exists idx_transactions_user_date on public.transactions(user_id, transaction_date desc);
create index if not exists idx_tasks_user_due on public.tasks(user_id, due_at);
create index if not exists idx_reminders_user_schedule on public.reminders(user_id, scheduled_at);
create index if not exists idx_reflections_user_date on public.reflections(user_id, reflection_date desc);
create index if not exists idx_ai_messages_conversation on public.ai_messages(conversation_id, created_at);

-- Ativar RLS em todas as tabelas com dados pessoais
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.decisions enable row level security;
alter table public.scenarios enable row level security;
alter table public.transactions enable row level security;
alter table public.tasks enable row level security;
alter table public.reminders enable row level security;
alter table public.reflections enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.subscriptions enable row level security;

-- Políticas de acesso: cada pessoa só acessa os próprios registros.
drop policy if exists "profile own select" on public.profiles;
create policy "profile own select" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profile own update" on public.profiles;
create policy "profile own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profile own insert" on public.profiles;
create policy "profile own insert" on public.profiles for insert with check (auth.uid() = id);

do $$
declare t text;
begin
  foreach t in array array['goals','decisions','scenarios','transactions','tasks','reminders','reflections','ai_conversations','ai_messages','subscriptions']
  loop
    execute format('drop policy if exists %I on public.%I', t || ' own access', t);
    execute format('create policy %I on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t || ' own access', t);
  end loop;
end $$;

-- Criar automaticamente o perfil quando um usuário se cadastrar.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'inactive');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Observação: não permita que o cliente altere plan/status livremente.
-- A gestão de premium e trial deve ser feita futuramente por backend seguro/webhook.
