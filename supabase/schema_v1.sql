-- Enable pgcrypto extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Create steps table
create table if not exists steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  steps integer not null,
  created_at timestamp with time zone default now()
);

-- Create weights table
create table if not exists weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  weight_lbs numeric(5,2) not null,
  created_at timestamp with time zone default now()
);

-- Create workouts table (without log_datetime)
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  workout_name text not null,
  reps integer,
  weight numeric(6,2),
  time interval,
  distance numeric(6,2),
  calories numeric(6,2),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security on all tables
alter table steps enable row level security;
alter table weights enable row level security;
alter table workouts enable row level security;

-- Policies for steps table
create policy "Allow read for all on steps"
  on steps for select using (true);

create policy "Allow insert for owner on steps"
  on steps for insert with check (auth.uid() = user_id);

create policy "Allow update for owner on steps"
  on steps for update using (auth.uid() = user_id);

create policy "Allow delete for owner on steps"
  on steps for delete using (auth.uid() = user_id);

-- Policies for weights table
create policy "Allow read for all on weights"
  on weights for select using (true);

create policy "Allow insert for owner on weights"
  on weights for insert with check (auth.uid() = user_id);

create policy "Allow update for owner on weights"
  on weights for update using (auth.uid() = user_id);

create policy "Allow delete for owner on weights"
  on weights for delete using (auth.uid() = user_id);

-- Policies for workouts table
create policy "Allow read for all on workouts"
  on workouts for select using (true);

create policy "Allow insert for owner on workouts"
  on workouts for insert with check (auth.uid() = user_id);

create policy "Allow update for owner on workouts"
  on workouts for update using (auth.uid() = user_id);

create policy "Allow delete for owner on workouts"
  on workouts for delete using (auth.uid() = user_id);
