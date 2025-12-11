-- Create subscriptions table to store user stock subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stock_ticker text not null,
  created_at timestamp with time zone default now(),
  unique(user_id, stock_ticker)
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- RLS policies for subscriptions
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "subscriptions_delete_own"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
