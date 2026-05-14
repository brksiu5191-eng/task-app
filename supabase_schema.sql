-- Daily Tasks App Schema
-- Run this in the Supabase SQL Editor

-- Tasks table
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  frequency text not null check (frequency in ('daily', 'weekdays', 'weekends', 'weekly', 'custom')),
  days_of_week integer[] default '{}',
  color text default '#6366f1',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Task completions table
create table if not exists task_completions (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_date date not null,
  completed_at timestamptz default now(),
  unique(task_id, completed_date)
);

-- Row Level Security
alter table tasks enable row level security;
alter table task_completions enable row level security;

-- Policies: users can only access their own data
create policy "Users can manage their own tasks"
  on tasks for all
  using (auth.uid() = user_id);

create policy "Users can manage their own completions"
  on task_completions for all
  using (auth.uid() = user_id);
