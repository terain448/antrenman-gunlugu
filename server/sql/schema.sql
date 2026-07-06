create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name varchar(120) not null,
  role varchar(32) not null check (role in ('admin', 'partner')),
  email varchar(180) unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references users(id) on delete cascade,
  title varchar(240) not null,
  completed boolean not null default false,
  task_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references users(id) on delete cascade,
  title varchar(240) not null,
  note text,
  event_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists water_entries (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references users(id) on delete cascade,
  amount_ml integer not null check (amount_ml > 0),
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists workouts (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references users(id) on delete cascade,
  day_name varchar(32) not null,
  name varchar(180) not null,
  sets integer not null,
  reps integer not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
