# Code review and security review

What each review of the code found, what was fixed, and what was left on
purpose and why. This is the base for the quality part of the report. The sprint
plan and what is left to do is in PROGRESS.md.

Reviews:

- 24 Oct: first review (the server trusted too much of what the browser sent)
- 29 Oct: second review with the new model
- 30 Oct: /code-review on app, server and shared, one finding at a time
- Security review: not done yet, see the end of this file

## Code review (24 Oct), fix before hand-in

Priority order. The server trusts too much of what the browser sends.

- [x] 1. Zod schema for the request in /api/suggest
      (shared/schemas/suggestRequest.ts): cuisine from CUISINES, 1-50
      ingredients of max 60 characters, avoid/diet/lang from our lists. Return 400
      on invalid input. Then remove the manual avoid/diet filters.
- [x] 2. Vitest + tests for the request schema (and the recipe schema)
- [x] 3. Max size for the image in /api/analyze-image
- [x] 4. Show pantry errors under the form (not at the logout button), and
      give logout its own error ref
- [x] 5. Check "Confirm email" in Supabase: if on, signup must show
      "Check your email" instead of navigating to /
- [x] 6. Daily limit per user (usage table + increment_usage function in
      supabase/schema.sql, server/utils/requireQuota.ts, 30 calls per day).
      SQL must be run in Supabase before it works!

Smaller things, when there is time:

- [x] addIngredient (form) should skip duplicates like addIngredients does
- [x] Remove or explain unused pantry columns (category, quantity, unit,
      expires_at)
- [x] recipeSchema: .min(1) on strings and lists, .int().positive() on
      cook_time_minutes
- [x] Redirect a logged-in user from /login to /
- [x] .env.example with variable names only
- [x] Run Prettier (indentation in usePantry.ts, CuisineCard.vue, auth.ts)
      (installed as devDependency, settings in .prettierrc)
- [ ] findFavorite compares by name: two recipes with the same name count
      as one favorite (fine for now)
- [x] Idea: use Claude tool use with a JSON schema instead of JSON.parse
      (done 29 Oct with structured outputs, see below)
- [ ] Use vad-finns-hemma.vercel.app at hand-in (the git-main preview URL
      needs a Vercel login)

## Code review (29 Oct, new model)

- [x] Pantry limits shared with the server (shared/limits.ts): max 50
      ingredients of max 40 characters (lowered from 60). Before, a bigger pantry gave a 400 and
      only "could not get a recipe".
- [x] server/utils/askClaude.ts: one shared Claude call for both routes (DRY),
      with structured outputs (the API answers in the Zod schema's shape, no
      JSON.parse), stop_reason check, and 503 "AI is busy" when Claude is down
- [x] Stricter types: Allergen[] and Diet instead of string
- [x] A guest who logs in to a real account is warned first
- [x] Checked Auth > Rate Limits in Supabase (29 Oct): anonymous sign-ins are
      limited to 30 per hour per IP address. With 30 Claude calls per guest and
      day, one IP can make at most about 900 calls per hour. Haiku is cheap, so
      the cost stays small. Kept at 30, since many people share the school's IP.
      Write it as a known limitation in the report.
- [x] Emails are limited to 2 per hour for the whole project. A third signup
      within an hour gets "too many attempts" (auth.rateLimit). Decided (30 Oct):
      "Confirm email" is turned off in Supabase, so signup sends no email and the
      limit does not matter. The code still handles both modes, and the README
      tells people who set up their own Supabase to turn it off while testing.
- [ ] Known limitation: a call that fails at Claude still counts towards the
      daily limit (the quota is checked before the call)

## Code review (30 Oct, /code-review on app, server and shared)

Ten findings. Each one was checked against the real code before deciding.

Fixed:

- [x] 1. useRecipe took the cuisine as a plain string. Added `Cuisine` and
      `CuisineChoice` types in shared/cuisines.ts, so a wrong cuisine is now a
      type error in the editor and not a 400 from the server.
- [x] 4. askClaude had no timeout (the SDK waits up to 10 minutes). Added
      `timeout: 60_000` and `maxRetries: 1`. A timeout is an
      APIConnectionError, so the existing catch shows "the AI is busy" (503).
      Tested with `timeout: 1`.
- [x] 5. Ingredient names are free text in the prompt. The prompt now marks them
      as data (`<ingredients>` tags), and the comment in suggest.post.ts no
      longer says that nobody can sneak text into the prompt. Also found while
      testing: the allergen list showed "mustard, celery" for curry powder but
      the ingredient list did not say why. The prompt now asks Claude to explain
      hidden allergens on the ingredient line (for example "curry powder (may
      contain mustard and celery)").
- [x] 6. Double tap on the save button saved the recipe twice. A `savingFavorite`
      flag in index.vue ignores taps while a save or remove is running.
- [x] 8. usePreferences went back to a stale value when a save failed after a
      later save had succeeded. It now goes back to the last value the database
      confirmed (savedAllergens, savedDiet). Tested offline in DevTools.
- [x] 9. useImageScan sent a black image to Claude if the canvas had no 2d
      context. It now throws, and the scan shows its normal error.

Checked and left as they are (write these in the report):

- [ ] 2. Max length and count in detectedIngredientsSchema: would make things
      worse. The SDK checks the answer with the schema, so one name of 41
      characters would throw away the whole scan. addIngredients already skips
      names that are too long or do not fit, and tells the user.
- [ ] 3. Old pantry rows longer than 40 characters: checked with
      `select name from pantry where length(name) > 40`, 0 rows.
- [ ] 7. A failed Claude call still counts towards the daily limit. A refund
      function that the logged-in user can call would let anyone reset their own
      limit. A safe one needs the service_role key on the server (a new secret,
      more risk). Failures are rare and the limit is 30 per day. If a tester
      runs out, set `requests` back in Supabase (Table Editor, usage). An admin
      page is an idea for the future.
- [ ] 10. The "x ingredients were not added" notice uses the same ref as errors,
      but it is shown in the warning colours and says what happened. Only the
      variable name is a bit off. Not worth three changed files.

Known limitations to write in the report:

- Allergy warnings depend on what Claude lists in "allergens". The app is a
  help, not a guarantee for someone with a serious allergy.
- Prompt injection through ingredient names cannot be fully stopped, only made
  harder. The worst case is that someone fools their own recipe.
- If two saves of the allergies answer in a different order than they were sent,
  the saved value can be out of step with the screen (very rare).
- Anonymous sign-ins have no captcha (Supabase recommends one). Limited to 30 per
  hour per IP address.

## Security review (30 Oct)

Done one area at a time, most dangerous first: 1 secrets, 2 database (RLS),
3 server routes, 4 browser side (XSS), 5 guest accounts and limits.

### 1. Secrets (done)

Checked with read-only commands. No key value was ever printed.

- `.env` is ignored (`.gitignore` line 22), is not tracked, and was never added
  in any commit. Only `.env.example` (names only) is tracked.
- No real Claude key in the git history. `sk-ant-` only appears in README.md as
  text ("it starts with sk-ant-") and a placeholder.
- No `sb_secret_` key and no JWT-looking string in any commit. `service_role`
  only appears in warnings (README, CLAUDE.md, .env.example), never in code.
- The Claude key is `runtimeConfig.anthropicApiKey` (private, server only), read
  in one place: server/utils/askClaude.ts. It is not under `public`.
- The Supabase key in `.env` is a publishable key, which is made to be seen in
  the browser. What protects the data is RLS (area 2), not hiding that key.
- Not checked from here: that the same variables are set in Vercel. Check by
  hand in the Vercel settings.

### 2. Database and RLS (done, one finding fixed)

Tested for real, not just read: supabase/schema.sql was run in a local Postgres
(PGlite) with the roles anon and authenticated and three fake users, and 36
attacks and normal uses were tried (the script is not kept in the repo).

Held from the start:

- Every table has RLS. Every policy is `to authenticated` and checks
  `auth.uid() = user_id`, with `with check` on insert and update too.
- User B cannot read, insert, update or delete A's rows, and A cannot give a row
  to B by changing `user_id`. A logged-out visitor (anon) can do nothing.
- The `usage` table has RLS and no policies, so nobody can read or write it from
  the browser. `increment_usage` can only count up, only for `auth.uid()`, is
  closed for anon, and a user who calls it with a huge limit only raises their
  own count. A user cannot reset the daily limit.

Found: the limits (40 characters, 50 ingredients) were only checked in the app,
but the browser talks to Supabase directly with the public key. A 100 000
character name and 500 rows in one insert were accepted. Anyone who signs in as a
guest could fill the free database (500 MB), and the project would become read
only for everybody. A nuisance, not a data leak.

Fixed (30 Oct, tested with the same script):

- `check` rules on the columns (pantry name 1-40 characters, favorites: name,
  ingredients, instructions, cuisine and allergens have a size limit, preferences:
  at most 30 allergens and 500 characters).
- A trigger, `limit_rows_per_user`, that refuses the 51st pantry row and the 101st
  favorite per user. It also stops one insert of 500 rows, because a row trigger
  counts the rows added earlier in the same insert.
- New projects get it from supabase/schema.sql (and the copy in README.md, which
  a test keeps identical). The existing Supabase project is updated with
  supabase/migrations/2026-10-30-limits.sql.

Left on purpose: allergen names are not checked against the list in SQL (it
would copy shared/allergens.ts into SQL). The size limit is enough to protect the
database, and a wrong allergen name only hurts the user who saved it.

Check query to run in the Supabase SQL Editor BEFORE the migration (it only
reads, and it should show 0, 0, 0):

```sql
select
  (select count(*) from public.pantry
    where char_length(name) not between 1 and 40) as bad_pantry_names,
  (select count(*) from public.favorites
    where char_length(name) not between 1 and 200
       or octet_length(ingredients::text) > 20000
       or octet_length(instructions::text) > 20000
       or char_length(cuisine) > 50
       or octet_length(allergens::text) > 2000) as bad_favorites,
  (select count(*) from public.preferences
    where cardinality(allergens) > 30
       or octet_length(array_to_string(allergens, ',')) > 500) as bad_preferences;
```

### 3. Server routes (done, nothing to fix)

Read server/api/suggest.post.ts, server/api/analyze-image.post.ts and the four
helpers in server/utils.

- There are only two routes, and both are `.post.ts`, so other methods are not
  served.
- Both do the same steps in the same order: `requireUser` (401), the Zod check of
  the request (400), `requireQuota` (429), then Claude. The quota comes after the
  Zod check, so a broken request does not use up a call.
- Fixed values for cuisine, allergies, diet and language (enums). The photo is
  limited to 2 million characters and three image types.
- Error texts are fixed strings. The raw error from Claude or Supabase is only
  written to the server log with `console.log`, never sent to the browser. The
  prompt and the photo are not logged.
- `requireUser` treats a broken or expired token as "not logged in" (401).
- The login lives in a cookie. The Supabase module sets it `SameSite=Lax` and
  `Secure`, so another website cannot make the browser send it with a POST.
- `max_tokens` is 4000 and the timeout is 60 seconds, so one call cannot get
  very expensive or hang.
### 4. Browser side (done, one finding fixed)

Searched app/ and shared/ for ways to run or show text as code.

- No `v-html`, `innerHTML`, `eval` or `document.write`. Recipe names, steps,
  ingredient names and scan results are shown with `{{ }}`, which Vue escapes, so
  text from Claude or from a user cannot become code.
- Links and redirects: `navigateTo` is only called with fixed paths ("/" and
  "/login"). Nothing reads `route.query`, so there is no open redirect.
- The app only sets two cookies, `lang` and `theme`, with no secret in them. The
  language cookie is checked (`=== "sv" ? "sv" : "en"`). The theme cookie is
  put in `data-theme` as it is, which Vue escapes, so a changed value only gives
  the default colours.
- The Supabase login cookie cannot be HttpOnly, since the browser client has to
  read it. That is one more reason that no XSS is allowed.

Found: no security headers, so another website could show the app in a hidden
frame and trick a user into clicking (clickjacking).

Fixed (30 Oct): `routeRules` in nuxt.config.ts sets `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff` and `Referrer-Policy:
strict-origin-when-cross-origin` on every answer. Checked with `curl -I` on the
dev server.

Left on purpose: no Content-Security-Policy. Nuxt writes small inline scripts, so
a strict policy needs nonces and can break the app. The risk is low, since no
text is ever shown as HTML.
