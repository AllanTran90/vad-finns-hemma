## Current status (23 Oct)

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
- [ ] Favorites
  - [x] SQL: allergens column on favorites
  - [ ] useFavorites.ts (save, list, delete)
  - [ ] Heart button on RecipeCard and a list of saved recipes
- [ ] Guest account
  - [ ] Turn on Anonymous sign-ins in Supabase
  - [ ] "Continue as guest" button on the login page
  - [ ] Banner "Create an account to keep your data" (updateUser with email
    and password keeps the same user id, so the data stays)
  - Note: a guest session stays after refresh, but is lost if the browser
    data is cleared or the device changes. If time runs out, this becomes a
    "Could have".
- [ ] Error handling
  - [ ] Check every flow: no internet, empty AI answer, too big image,
    expired login
  - [x] Protect /api/suggest and /api/analyze-image with requireUser
    (server/utils/requireUser.ts, tested: logged out gives 401)
  - [ ] Consider a daily limit per user (optional)

### Sprint 5, week 46
- [ ] Tests
- [ ] Mobile polish
- [ ] Documentation
- [ ] README
- [ ] License

### Could have (only if there is time)
- [x] Camera button for the photo scan (capture="environment", tested on
  Samsung A55, plus a gallery button)
- [ ] Choose which courses to get: starter, main course, dessert (multi-select).
  The recipe schema in shared/schemas/recipe.ts must then handle a list of
  dishes, not just one.
- [ ] Choose menu style: restaurant (fine dining) or regular home cooking.
  Only a change in the prompt sent to /api/suggest, so do it after the
  course choice.
- [ ] Own camera view with getUserMedia (switch front/back camera). Not needed
  for the MVP, the phone's own camera app already works.
- [ ] Translate ingredient names when the language is switched
  (now they stay as the user wrote them)
- [ ] Run /code-review and /security-review before hand-in
