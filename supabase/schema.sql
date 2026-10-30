-- Vad finns hemma? Database schema
--
-- How to use: open the Supabase SQL Editor (New query), paste this whole file
-- and press Cmd+Enter (Ctrl+Enter on Windows). Use a new, empty project:
-- running it twice gives "already exists" errors.
--
-- Every table has row level security (RLS), so each user only sees their own rows.
-- The tables also have size limits and a maximum number of rows per user, because
-- the app's own limits do not stop someone who talks to the database directly.
-- If you change this file, also change shared/database.types.ts and the copy in README.md.


-- Pantry: the ingredients a user has at home
create table public.pantry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- 40 = MAX_INGREDIENT_LENGTH in shared/limits.ts
  name text not null check (char_length(name) between 1 and 40),
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
  -- The size limits are generous (a normal recipe is about 2 000 characters),
  -- they only stop someone from storing huge texts.
  name text not null check (char_length(name) between 1 and 200),
  ingredients jsonb not null check (octet_length(ingredients::text) <= 20000),
  instructions jsonb not null check (octet_length(instructions::text) <= 20000),
  cook_time_minutes integer,
  cuisine text check (char_length(cuisine) <= 50),
  kid_friendly boolean,
  allergens jsonb not null default '[]'::jsonb
    check (octet_length(allergens::text) <= 2000),
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
  allergens text[] not null default '{}'
    check (
      cardinality(allergens) <= 30
      and octet_length(array_to_string(allergens, ',')) <= 500
    ),
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


-- Row limits: at most a number of rows per user in a table.
-- The app checks this too, but the browser talks to Supabase directly, so the
-- database must enforce it as well. Otherwise anyone could fill the database.
-- The function counts the rows of the user who inserts (RLS only lets them see
-- their own) and refuses the insert when the limit is reached. The limit is the
-- argument given to the trigger (tg_argv[0]). A trigger that runs "for each row"
-- also counts the rows added earlier in the same insert, so one big insert of
-- 500 rows is stopped too.
create function public.limit_rows_per_user()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  current_rows bigint;
begin
  execute format(
    'select count(*) from %I.%I where user_id = $1',
    tg_table_schema,
    tg_table_name
  )
  into current_rows
  using new.user_id;

  if current_rows >= tg_argv[0]::int then
    raise exception 'Too many rows in %: the limit is % per user.',
      tg_table_name, tg_argv[0]
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

-- 50 = MAX_INGREDIENTS in shared/limits.ts
create trigger pantry_row_limit
  before insert on public.pantry
  for each row execute function public.limit_rows_per_user(50);

create trigger favorites_row_limit
  before insert on public.favorites
  for each row execute function public.limit_rows_per_user(100);


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
