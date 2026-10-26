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
paste exactly what is written in the grey boxes.

What you need

- A computer (Mac, Windows or Linux) and an internet connection
- A free [Supabase](https://supabase.com) account (the database and the login)
- An [Anthropic](https://console.anthropic.com) account with a few dollars of
  credit (the AI that suggests recipes). Every recipe costs a fraction of a cent.

> Windows tip: use PowerShell wherever this guide says "terminal". Press
> the Windows key, type `PowerShell` and press Enter.
> Mac tip: press `Cmd + Space`, type `Terminal` and press Enter.

### Step 1. Install Node.js

Node.js is the program that runs the app.

1. Go to https://nodejs.org and download the version marked LTS.
2. Open the downloaded file and click Next/Continue until it is installed.
3. Close and reopen your terminal, then type this and press Enter:

```bash
node -v
```

If you see a number like `v22.11.0` it worked. If you see "command not found",
restart your computer and try again.

### Step 2. Download the code

1. Go to https://github.com/AllanTran90/vad-finns-hemma
2. Click the green Code button, then Download ZIP.
3. Unzip the file (double-click it). You get a folder called
   `vad-finns-hemma-main`. Move it to your Documents folder.
4. In the terminal, go into the folder:

```bash
cd Documents/vad-finns-hemma-main
```

(Tip: you can also type `cd ` with a space, then drag the folder from your file
browser into the terminal window and press Enter.)

### Step 3. Create the database (Supabase)

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
-- If you change this file, also change shared/database.types.ts.


-- Pantry: the ingredients a user has at home
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

### Step 4. Get your Supabase keys

You need two things from Supabase. Keep this page open, you will paste them in
Step 6.

- Project URL: click the Connect button at the top of the Supabase page
  (or go to Project Settings, then Data API). It looks like
  `https://abcdefgh.supabase.co`.
- Public key: go to Project Settings, then API Keys, and copy the
  publishable key (older projects call it the anon key).

Do not use the key called `secret` or `service_role`. It gives full access
to your database and must never be put in the app.

### Step 5. Get your AI key (Anthropic)

1. Go to https://console.anthropic.com and sign up.
2. Under Billing, add a few dollars of credit.
3. Under API Keys, click Create Key, give it a name and copy the key
   (it starts with `sk-ant-`). You only see it once, so paste it somewhere safe.

### Step 6. Put the keys in the app

Back in the terminal (you should still be inside the `vad-finns-hemma-main`
folder), make a copy of the settings file:

```bash
cp .env.example .env
```

(On Windows PowerShell, use `copy .env.example .env` instead.)

Now open the new file called `.env` in any text editor (Notepad, TextEdit, VS
Code). It looks like this. Paste each key after the `=` sign, with no spaces
and no quotes, and save the file:

```
NUXT_ANTHROPIC_API_KEY=sk-ant-your-key-here
NUXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=your-publishable-key-here
```

> The file starts with a dot, so it can be hidden. On Mac press
> `Cmd + Shift + .` in the Finder to show hidden files.

### Step 7. Start the app

In the terminal, run these two commands, one at a time. The first one downloads
everything the app needs and takes a minute or two.

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
later, go into the folder (Step 2, point 4) and run `npm run dev`.

### If something goes wrong

| What you see | What to do |
| --- | --- |
| `command not found: node` or `npm` | Node.js is not installed, or the terminal was not restarted. Redo Step 1. |
| `No such file or directory` after `cd` | You are in the wrong place. Redo Step 2, point 4. |
| The page does not open | Check that the terminal still shows `npm run dev` running, and that you used the address it printed. |
| "Could not load ingredients" or errors about a missing table | The SQL in Step 3 was not run. Run it in the Supabase SQL Editor. |
| "Continue as guest" shows an error | Anonymous sign-ins are off. Redo Step 3, point 5. |
| "Too many attempts right now" when creating an account | Supabase limits emails. Turn Confirm email off (Step 3, point 6) or wait an hour. |
| "Could not get a recipe" | The AI key is wrong or has no credit. Check Step 5 and `.env`, then stop the app (`Ctrl + C`) and start it again. |
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
