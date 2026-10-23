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

-- Favorites table
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  ingredients jsonb not null,
  instructions jsonb not null,
  cook_time_minutes integer,
  cuisine text,
  kid_friendly boolean,
  created_at timestamptz not null default now()
);

alter table public.favorites enable row level security;


-- Favorites policies
create policy "Users can view own favorites"
  on public.favorites for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own favorites"
  on public.favorites for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own favorites"
  on public.favorites for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete
  to authenticated
  using ((select auth.uid()) = user_id);


-- Favorites: allergens of the saved recipe (added in sprint 4)
alter table public.favorites
  add column allergens jsonb not null default '[]'::jsonb;


-- Preferences table: one row per user (added in sprint 4)
create table public.preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  allergens text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.preferences enable row level security;

-- Preferences policies (insert + update are both needed for upsert)
create policy "Users can view own preferences"
  on public.preferences for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own preferences"
  on public.preferences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own preferences"
  on public.preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


-- Preferences: diet (added in sprint 4)
alter table public.preferences
  add column diet text not null default 'none'
  check (diet in (
    'none',
    'pescatarian',
    'lacto_ovo_vegetarian',
    'lacto_vegetarian',
    'ovo_vegetarian',
    'vegan'
  ));
