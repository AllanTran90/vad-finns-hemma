# Vad finns hemma? (What's in my kitchen?)

A web app that turns the ingredients you already have at home into a dinner
suggestion. Add ingredients by hand or by taking a photo, pick a cuisine, and
get a recipe from AI. The goal is to avoid shopping and to reduce food waste.

Live: https://vad-finns-hemma.vercel.app

This is my thesis project (examensarbete) at Yrgo, web development.

## Features

- Log in, create an account, or continue as a guest (a guest can later turn the
  account into a real one and keep the data)
- Add ingredients by hand or by photo. The AI reads the photo and I can correct
  the list before it is saved
- Pick a cuisine (or "Surprise me") and get a recipe
- Choose a diet and allergies. They are sent to the AI, and the recipe card
  warns if a recipe still contains an allergen
- Save favorite recipes
- Swedish and English, light and dark mode, mobile first

## Tech stack

- Nuxt 4 (Vue): the frontend in `app/`
- Nuxt server routes: the backend in `server/`. The Claude API key stays here
  and never reaches the browser
- Supabase: database and auth (`@nuxtjs/supabase`), with row level security
  so every user only sees their own data
- Claude API: recipes and photo recognition
- Zod: validates what the browser sends and what the AI answers. Schemas are
  shared in `shared/schemas/`
- Vitest: automatic tests for the Zod schemas
- Vercel: deploy

## Setup guide (from zero, no programming knowledge needed)

This guide takes you from nothing to a working copy of the app on your own
computer. It takes about 30 minutes. Just follow the steps in order and copy and
paste exactly what is written in the grey boxes. Almost everything is done in
the terminal. Only the accounts and the keys have to be done in the browser.

What you need

- A computer (Mac, Windows or Linux) and an internet connection
- A free [Supabase](https://supabase.com) account (the database and the login)
- An [Anthropic](https://console.anthropic.com) account with a few dollars of
  credit (the AI that suggests recipes). Every recipe costs a fraction of a cent.

> Windows: use PowerShell wherever this guide says "terminal". Press the Windows
> key, type `PowerShell` and press Enter.
> Mac: press `Cmd + Space`, type `Terminal` and press Enter.

### Step 1. Install Node.js and Git (in the terminal)

Node.js is the program that runs the app. Git downloads the code. Copy the
commands for your computer, one at a time.

Windows (PowerShell):

```bash
winget install OpenJS.NodeJS.LTS
```

```bash
winget install Git.Git
```

Mac:

```bash
brew install node git
```

If the Mac says `brew: command not found`, install Homebrew first (it asks for
your computer password, which is not shown while you type), then run the `brew`
command above again:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Linux (Ubuntu and similar):

```bash
sudo apt install nodejs npm git
```

Now close the terminal, open it again and check that both worked:

```bash
node -v
git --version
```

If you see version numbers (for example `v22.11.0`) it worked. If you still see
"command not found", restart your computer and try again.

### Step 2. Download the code (in the terminal)

```bash
git clone https://github.com/AllanTran90/vad-finns-hemma.git
```

```bash
cd vad-finns-hemma
```

The code is now in a folder called `vad-finns-hemma`, and the terminal is inside
it. Every command below is run from this folder.

### Step 3. Create the database (in the browser)

Supabase is the database and the login system.

1. Go to https://supabase.com, sign up and click New project. Choose any
   name, make up a database password (save it somewhere) and click Create new
   project. Wait 1-2 minutes until it is ready.
2. In the left menu click SQL Editor, then New query.
3. Copy everything in the box below (the copy button in the top right corner
   of the box does it for you), paste it into the SQL Editor and press
   Cmd + Enter (Ctrl + Enter on Windows).

```sql
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
```

4. You should see "Success. No rows returned". That means the database is
   ready. (Only do this once per project. Running it a second time gives
   "already exists" errors, which is harmless.)
5. Turn on guest accounts: in the left menu click Authentication, then
   Sign In / Providers. Find Allow anonymous sign-ins, switch it on and
   click Save changes.
6. While you are testing, switch Confirm email off on the same page (under
   Email) and click Save changes. If it is on, every new user must click
   a link in an email, and Supabase only sends a few emails per hour on the free
   plan.

### Step 4. Get your keys (in the browser)

Supabase keys. Keep this page open, you paste them in Step 5.

- Project URL: click the Connect button at the top of the Supabase page
  (or go to Project Settings, then Data API). It looks like
  `https://abcdefgh.supabase.co`.
- Public key: go to Project Settings, then API Keys, and copy the
  publishable key (older projects call it the anon key).

Do not use the key called `secret` or `service_role`. It gives full access
to your database and must never be put in the app.

AI key (Anthropic):

1. Go to https://console.anthropic.com and sign up.
2. Under Billing, add a few dollars of credit.
3. Under API Keys, click Create Key, give it a name and copy the key
   (it starts with `sk-ant-`). You only see it once, so paste it somewhere safe.

### Step 5. Put the keys in the app (in the terminal)

Make a copy of the settings file:

```bash
cp .env.example .env
```

(On Windows PowerShell, use `copy .env.example .env` instead.)

Open the new file in a text editor from the terminal:

```bash
open -e .env
```

(On Windows PowerShell, use `notepad .env` instead.)

It looks like this. Paste each key after the `=` sign, with no spaces and no
quotes, and save the file:

```
NUXT_ANTHROPIC_API_KEY=sk-ant-your-key-here
NUXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=your-publishable-key-here
```

### Step 6. Install and start the app (in the terminal)

The first command downloads everything the app needs and takes a minute or two.

```bash
npm install
```

```bash
npm run dev
```

When you see a line with `http://localhost:3000`, open that address in your
browser. Create an account (or click Continue as guest), add a few
ingredients, pick a cuisine and press Get recipe.

To stop the app, click in the terminal and press `Ctrl + C`. To start it again
later, open the terminal, run `cd vad-finns-hemma` and then `npm run dev`.

### If something goes wrong

| What you see | What to do |
| --- | --- |
| `command not found: node`, `npm` or `git` | It is not installed, or the terminal was not restarted. Redo Step 1. |
| `winget` is not recognized (Windows) | Install Node.js from https://nodejs.org (the LTS version) and Git from https://git-scm.com instead, then restart the terminal. |
| `No such file or directory` after `cd` | You are in the wrong place. Redo Step 2 and make sure the clone finished. |
| `open -e .env` does nothing or says no such file | You are not in the `vad-finns-hemma` folder, or the `cp` command in Step 5 was not run. |
| The page does not open | Check that the terminal still shows `npm run dev` running, and that you used the address it printed. |
| "Could not load ingredients" or errors about a missing table | The SQL in Step 3 was not run. Run it in the Supabase SQL Editor. |
| "Continue as guest" shows an error | Anonymous sign-ins are off. Redo Step 3, point 5. |
| "Too many attempts right now" when creating an account | Supabase limits emails. Turn Confirm email off (Step 3, point 6) or wait an hour. |
| "Could not get a recipe" | The AI key is wrong or has no credit. Check Step 4 and `.env`, then stop the app (`Ctrl + C`) and start it again. |
| You changed `.env` and nothing happened | Stop the app (`Ctrl + C`) and start it again with `npm run dev`. |

### Put it on the internet (optional)

1. Put the code in your own GitHub repository and sign up at
   https://vercel.com with your GitHub account.
2. Click Add New, Project and choose the repository.
3. Under Environment Variables, add the same three variables as in your
   `.env` file.
4. Click Deploy. If you change a variable later, click Redeploy, because
   the values are only read when the app is built.

### Environment variables

| Name | What it is |
| --- | --- |
| `NUXT_ANTHROPIC_API_KEY` | Claude API key. Server only. |
| `NUXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL. |
| `NUXT_PUBLIC_SUPABASE_KEY` | The public (publishable/anon) key. |

Never use the Supabase `service_role` key in the frontend. New secrets must also
be added in Vercel, followed by a redeploy.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm test` | Run the Vitest tests |
| `npx nuxi typecheck` | Check the types |

## Project structure

```
app/            Frontend: pages, components, composables, middleware, utils
server/api/     Routes that call the Claude API (suggest, analyze-image)
server/utils/   requireUser (login check) and requireQuota (daily limit)
shared/         Code used by both sides: lists, Zod schemas, texts (i18n),
                database types
supabase/       schema.sql, the database schema
tests/          Vitest tests
```

## How it is protected

- The Claude API key is only used on the server
- Both server routes require a logged-in user (guests included)
- Everything the browser sends is checked with Zod before the prompt is built
  (cuisine, allergies and diet must come from our own lists, and the number and
  length of ingredients and the photo size are limited)
- Each user has a daily limit of Claude calls (stored in the database)
- The AI answer is checked with Zod before it is shown or saved
- Row level security on every table

## Documentation

- [AI-USE.md](AI-USE.md): a log of how I used AI during the project
- [PROGRESS.md](PROGRESS.md): the plan and the status
- [learn/](learn/): my notes explaining the code

## License

MIT, see [license](license).

## Author

Allan Tran