-- Vad finns hemma? Database schema
--
-- How to use: open the Supabase SQL Editor (New query), paste this whole file
-- and press Cmd+Enter (Ctrl+Enter on Windows). Use a new, empty project:
-- running it twice gives "already exists" errors.
--
-- Every table has row level security (RLS), so each user only sees their own rows.
-- If you change this file, also change shared/database.types.ts.


-- Pantry: the ingredients a user has at home
create table public.pantry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.pantry enable row level security;

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


-- Favorites: saved recipes
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  ingredients jsonb not null,
  instructions jsonb not null,
  cook_time_minutes integer,
  cuisine text,
  kid_friendly boolean,
  allergens jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.favorites enable row level security;

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


-- Preferences: allergies and diet, one row per user
create table public.preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  allergens text[] not null default '{}',
  diet text not null default 'none'
    check (diet in (
      'none',
      'pescatarian',
      'lacto_ovo_vegetarian',
      'lacto_vegetarian',
      'ovo_vegetarian',
      'vegan'
    )),
  updated_at timestamptz not null default now()
);

alter table public.preferences enable row level security;

-- Insert and update are both needed for upsert.
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


-- Usage: daily limit for Claude calls, one row per user and day.
-- RLS is on and there are no policies, so the browser cannot read or change it.
-- Only the function below can, and it checks auth.uid().
create table public.usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  requests int not null default 0,
  primary key (user_id, day)
);

alter table public.usage enable row level security;

-- Counts one call for the logged-in user. Returns true if the call is allowed,
-- false if the user has already used max_per_day calls today.
create function public.increment_usage(max_per_day int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_requests int;
begin
  insert into public.usage as u (user_id, day, requests)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update
    set requests = u.requests + 1
    where u.requests < max_per_day
  returning u.requests into new_requests;

  return new_requests is not null;
end;
$$;

revoke execute on function public.increment_usage(int) from public, anon;
grant execute on function public.increment_usage(int) to authenticated;
