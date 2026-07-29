-- Run this file in the Supabase SQL editor after adding your project credentials.
-- One compact shared document preserves the app's existing local data model while
-- daily notes remain independently queryable and realtime-friendly.
create extension if not exists pgcrypto;

create table if not exists public.couple_states (
  couple_id text primary key,
  state jsonb not null default '{"tasks":[],"events":[],"water":{},"steps":{},"workouts":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  couple_id text not null,
  author_id text not null,
  author_name text not null,
  body varchar(180) not null check (char_length(trim(body)) > 0),
  note_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (couple_id, author_id, note_date)
);

alter table public.couple_states enable row level security;
alter table public.daily_notes enable row level security;

-- This private two-person app currently uses its existing local login. These
-- policies let the Supabase anonymous key sync the shared dashboard; replace
-- them with couple-membership policies when Supabase Auth is enabled.
drop policy if exists "authenticated couple state access" on public.couple_states;
drop policy if exists "authenticated daily note access" on public.daily_notes;
create policy "couple state access" on public.couple_states for all to anon, authenticated using (true) with check (true);
create policy "daily note access" on public.daily_notes for all to anon, authenticated using (true) with check (true);

alter publication supabase_realtime add table public.couple_states, public.daily_notes;
