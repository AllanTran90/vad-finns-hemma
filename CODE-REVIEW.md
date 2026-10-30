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

To do. Order: secrets, database (RLS), server routes, browser side (XSS),
guest accounts and limits.
