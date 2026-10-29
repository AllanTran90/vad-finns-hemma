## Current status (24 Oct)

Done:

- [x] Nuxt project (minimal template), Git + GitHub
- [x] Supabase connected, SUPABASE_URL and SUPABASE_KEY in .env (ignored by Git)
  and added to Vercel
- [x] app/pages/login.vue and signup.vue with error messages on failure
- [x] app/middleware/auth.ts (named, not global) protects app/pages/index.vue
- [x] Deploy on Vercel works
- [x] AI-USE.md with a log per day
- [x] Auth (login and user) in Supabase
- [x] Pantry & Favorites and policies in database
- [x] Logout button in app/pages/index.vue
- [x] supabase/schema.sql (so future sessions know where the schema is)

Folder structure (all created):
app/components/ (pantry/, cuisine/, recipe/, scan/, ui/), app/composables/,
app/pages/, server/api/, shared/ (schemas/, cuisines.ts, allergens.ts,
i18n.ts)

Decided: the start page requires login. A guest gets a temporary account
(Supabase anonymous sign-in) and can later turn it into a real account.

## Sprint plan (hand-in 16 Nov, supervision 21 Oct and 4 Nov)

### Plan for the next days (decided 26 Oct)
1. Finish all Must (deploy check, mobile, README, license, documentation,
   DRY, unused pantry columns).
2. Then the Could have list.
3. Fri 30 Oct: go through everything (/code-review, /security-review, test
   every flow, be able to explain all code). The weekend is a buffer for fixes.
4. Wed 4 Nov: supervision with Hans and Betsy.

### Sprint 1, week 42
- [x] Foundation
- [x] Supabase
- [x] Login
- [x] Deploy

Workflow so far:
The Nuxt frontend talks to Supabase (auth + database with RLS) via
@nuxtjs/supabase, and is deployed on Vercel.

### Sprint 2, week 43
- [x] Ingredient input
- [x] Cuisine selection
- [x] Server route to the Claude API
- [x] Zod schema and allergens list
- [x] Zod validation
- [x] validation in server route
- [x] Simple result view

### Sprint 3, week 44
- [x] Image recognition with correction
- [x] Saved pantry
- [x] Instructions on how to take the photo

Extras done in sprint 3:
- [x] Already-owned ingredients are shown in their own list after a scan
- [x] Dark mode toggle (cookie)
- [x] Swedish/English toggle for the whole app and the AI answers
  (shared/i18n.ts, useLang.ts)
- [x] Korean and Italian cuisines, "Surprise me" picks a random cuisine

### Sprint 4, week 45
Planned order: allergies, favorites, guest account, error handling.

- [x] Allergies/dietary preferences
  - [x] SQL: preferences table with RLS (supabase/schema.sql, run in Supabase)
  - [x] usePreferences.ts (load + upsert)
  - [x] AllergyPicker.vue and DietPicker.vue (shared PillGroup and Foldout)
  - [x] Connect on the start page and send allergies and diet to /api/suggest
  - [x] Ask Claude to avoid them, and warn if the recipe still contains one
- [x] Favorites
  - [x] SQL: allergens column on favorites
  - [x] useFavorites.ts (save, list, delete)
  - [x] Heart button on RecipeCard and a list of saved recipes
    (FavoritesList.vue, shown on the start page)
- [x] Guest account (code done; Anonymous sign-ins must be turned on in Supabase)
  - [x] Turn on Anonymous sign-ins in Supabase
  - [x] "Continue as guest" button on the login page
  - [x] Banner "Create an account to keep your data" (updateUser with email
    and password keeps the same user id, so the data stays)
  - Note: a guest session stays after refresh, but is lost if the browser
    data is cleared or the device changes. If time runs out, this becomes a
    "Could have".
- [x] Error handling
  - [x] Check every flow: no internet, empty AI answer, too big image,
    expired login (apiErrorKey.ts, stricter recipeSchema, size limit)
  - [x] Protect /api/suggest and /api/analyze-image with requireUser
    (server/utils/requireUser.ts, tested: logged out gives 401)
  - [x] Daily limit per user (see code review below)

### Code review (24 Oct), fix before hand-in
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

### Code review (29 Oct, new model)
- [x] Pantry limits shared with the server (shared/limits.ts): max 50
  ingredients of max 60 characters. Before, a bigger pantry gave a 400 and
  only "could not get a recipe".
- [x] server/utils/askClaude.ts: one shared Claude call for both routes (DRY),
  with structured outputs (the API answers in the Zod schema's shape, no
  JSON.parse), stop_reason check, and 503 "AI is busy" when Claude is down
- [x] Stricter types: Allergen[] and Diet instead of string
- [x] A guest who logs in to a real account is warned first
- [ ] Check Auth > Rate Limits in Supabase: how many anonymous sign-ins per
  IP and hour? Each guest gets 30 Claude calls per day, so new guest accounts
  can get around the daily limit. Write it as a known limitation in the report.
- [ ] Known limitation: a call that fails at Claude still counts towards the
  daily limit (the quota is checked before the call)

### Sprint 5, week 46
- [x] Tests (Vitest, tests/ folder: request schemas and recipe schema)
- [x] Mobile polish (tested at 360 px: login, signup, recipe, save, allergies,
  diet, photo scan and the guest flow)
- [x] Documentation (README with a step by step setup guide)
- [x] README
- [x] License (MIT)

### Could have (only if there is time)
- [x] Camera button for the photo scan (capture="environment", tested on
  Samsung A55, plus a gallery button)
- [ ] Choose which courses to get: starter, main course, dessert (multi-select).
  The recipe schema in shared/schemas/recipe.ts must then handle a list of
  dishes, not just one.
- [ ] Choose menu style: restaurant (fine dining) or regular home cooking.
  Only a change in the prompt sent to /api/suggest, so do it after the
  course choice.
- [ ] Shopping list: let the AI use a few ingredients the user does not have,
  and show them in their own "You need to buy" list. Needs a new field in
  shared/schemas/recipe.ts and a new part in RecipeCard.vue. (Now the prompt
  only allows the listed ingredients plus basic staples.)
- [ ] Own confirm dialog for guest logout, in the app's style. The browser's
  confirm() shows "Cancel" and "OK" in the browser's language, not the app's.
- [ ] Photo scan sometimes lists food that is not in the photo. Try a stricter
  prompt ("if unsure, leave it out") in server/api/analyze-image.post.ts first,
  then Sonnet for the image analysis only (about 2 cents per scan).
- [ ] Own camera view with getUserMedia (switch front/back camera). Not needed
  for the MVP, the phone's own camera app already works.
- [ ] Translate ingredient names when the language is switched
  (now they stay as the user wrote them)
- [ ] Run /code-review and /security-review before hand-in
