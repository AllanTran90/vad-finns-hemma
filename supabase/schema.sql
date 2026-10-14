-- Pantry table
create table public.pantry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text,
  quantity numeric,
  unit text,
  expires_at date,
  created_at timestamptz not null default now()
);

alter table public.pantry enable row level security;

-- Pantry policies
create policy "Users can view own pantry"
  on public.pantry for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own pantry"
  on public.pantry for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own pantry"
  on public.pantry for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own pantry"
  on public.pantry for delete
  to authenticated
  using ((select auth.uid()) = user_id);
