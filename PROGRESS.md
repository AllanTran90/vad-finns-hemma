## Current status (14 Oct)

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

Planned folder structure that is not created yet:
app/components/ (pantry/, dish/, ui/), app/composables/, server/api/,
shared/schemas/

Not decided: should the start page be open or require login?

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
- [ ] Image recognition with correction
- [ ] Saved pantry
- [ ] Instructions on how to take the photo

### Sprint 4, week 45
- [ ] Favorites
- [ ] Allergies/dietary preferences
- [ ] Error handling

### Sprint 5, week 46
- [ ] Tests
- [ ] Mobile polish
- [ ] Documentation
- [ ] README
- [ ] License
