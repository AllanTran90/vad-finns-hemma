-- 30 Oct 2026: size limits and a maximum number of rows per user.
--
-- For a project that was set up BEFORE this date (supabase/schema.sql already
-- contains all of this for new projects, so do NOT run this file on a new project).
-- Open the Supabase SQL Editor, paste this whole file and press Cmd+Enter.
--
-- Safe to run: it only adds rules and does not change any saved row. But a rule
-- fails if an old row already breaks it, so run the check query from
-- CODE-REVIEW.md (Security review, area 2) first. It should show 0, 0, 0.

alter table public.pantry
  add constraint pantry_name_check
  check (char_length(name) between 1 and 40);

alter table public.favorites
  add constraint favorites_name_check
    check (char_length(name) between 1 and 200),
  add constraint favorites_ingredients_check
    check (octet_length(ingredients::text) <= 20000),
  add constraint favorites_instructions_check
    check (octet_length(instructions::text) <= 20000),
  add constraint favorites_cuisine_check
    check (char_length(cuisine) <= 50),
  add constraint favorites_allergens_check
    check (octet_length(allergens::text) <= 2000);

alter table public.preferences
  add constraint preferences_allergens_check
  check (
    cardinality(allergens) <= 30
    and octet_length(array_to_string(allergens, ',')) <= 500
  );

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

create trigger pantry_row_limit
  before insert on public.pantry
  for each row execute function public.limit_rows_per_user(50);

create trigger favorites_row_limit
  before insert on public.favorites
  for each row execute function public.limit_rows_per_user(100);
