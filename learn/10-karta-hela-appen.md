# Karta: hela appen på en bild

Var allt bor och hur det hänger ihop. Matsalen = webbläsaren, köket = servern,
grossisten = Claude, kylrummet = Supabase, menyn = shared/.

```
 ╔═══════════════════════════════════════════════════════════════╗
 ║ 📱 WEBBLÄSAREN  (app/)                      = MATSALEN        ║
 ║                                                               ║
 ║  middleware/auth.ts ── vakt vid dörren: inloggad?             ║
 ║        │                                                      ║
 ║  pages/index.vue ── hovmästaren                               ║
 ║        │                                                      ║
 ║   ┌────┴──────────── components/ (servitörer, visar) ───────┐ ║
 ║   │ PantryList  ScanPhoto  CuisineCard  DietPicker          │ ║
 ║   │ AllergyPicker  RecipeCard  FavoritesList  GuestBanner   │ ║
 ║   │ ui/: Foldout  PillGroup  AuthForm  LangToggle ...       │ ║
 ║   └────┬────────────────────────────────────────────────────┘ ║
 ║        │ props ↓  emit ↑                                      ║
 ║   ┌────┴──────────── composables/ (stationer, logik) ───────┐ ║
 ║   │ usePantry  usePreferences  useFavorites  ←─┐            │ ║
 ║   │ useImageScan  useRecipe  ←─┐               │            │ ║
 ║   │ useLang         utils/apiErrorKey          │            │ ║
 ║   └────────────────────────────┼───────────────┼────────────┘ ║
 ╚════════════════════════════════╪═══════════════╪══════════════╝
                       $fetch     │               │ supabase.from(...)
                    /api/...      │               │ DIREKT till databasen
 ╔════════════════════════════════╪══════╗        │ (publik nyckel)
 ║ 🖥️ SERVER (server/)  = KÖKET    ▼      ║        │
 ║                                       ║        │
 ║  api/analyze-image.post.ts            ║        │
 ║  api/suggest.post.ts                  ║        │
 ║     │                                 ║        │
 ║     ├─ utils/requireUser   401        ║        │
 ║     ├─ Zod (in)            400        ║        │
 ║     ├─ utils/requireQuota  429 ───────╫──┐     │
 ║     └─ utils/askClaude  503/502       ║  │rpc  │
 ║          │  🔒 API-nyckel (.env)       ║  │     │
 ╚══════════╪════════════════════════════╝  │     │
            ▼                               ▼     ▼
 ╔══════════════════════╗   ╔════════════════════════════════════╗
 ║ 🤖 CLAUDE API         ║   ║ 🗄️ SUPABASE (supabase/schema.sql)   ║
 ║ = GROSSISTEN          ║   ║ = KYLRUMMET                         ║
 ║ bild → ingredienser   ║   ║  auth       inloggning, gäster      ║
 ║ ingredienser → recept ║   ║  pantry     🔒RLS ✅check ⛔trigger50 ║
 ╚══════════════════════╝   ║  favorites  🔒RLS ✅check ⛔trigger100║
                            ║  preferences🔒RLS ✅check            ║
                            ║  usage      🔒RLS, inga policies     ║
                            ║             bara increment_usage()  ║
                            ╚════════════════════════════════════╝

 ┌───────────────────────────────────────────────────────────────┐
 │ 📜 shared/  = MENYN, läses av BÅDE matsal och kök              │
 │  cuisines  diets  allergens  limits  i18n  database.types     │
 │  schemas/ (Zod): analyzeRequest  suggestRequest               │
 │                  detectedIngredients  recipe                  │
 └───────────────────────────────────────────────────────────────┘
```

## De två vägarna till data

1. **Via servern** (`$fetch /api/...`): allt som behöver Claude, eftersom
   API-nyckeln måste vara hemlig.
2. **Direkt till Supabase** (`supabase.from(...)`): skafferi, favoriter och val.
   Säkert tack vare RLS, check-regler och triggers i databasen.

Väg 2 är skälet till att databasen har egna lås: där finns ingen server emellan.
**Frontend-kontroller är för användarvänlighet, backend-kontroller är för säkerhet.**

## Fotot från början till slut

```
 ScanPhoto.vue → useImageScan (krymper, base64) → POST /api/analyze-image
   → requireUser → Zod (in) → requireQuota → askClaude → Zod (ut)
   → tillbaka: ["tomat","mjölk"] → ScanPhoto: du rättar listan
   → emit("confirm") → index.vue → usePantry.addIngredients → Supabase (RLS)
```

## Zod på tre ställen (all data vi inte själva skapat)

1. **In till servern:** `analyzeRequest`, `suggestRequest` (användaren)
2. **Ut från Claude:** `detectedIngredients`, `recipe` (AI:n)
3. **Ut från databasen:** `favoriteSchema` i `useFavorites` (sparade rader)

## Statuskoder

| Kod | Betyder | Var |
|---|---|---|
| 400 | trasig beställning | Zod säger nej |
| 401 | inte inloggad | `requireUser` |
| 429 | dagsgränsen (30) nådd | `requireQuota` |
| 500 | något gick sönder hos oss | t.ex. databasen svarar inte |
| 502 | Claude svarade, men svaret dög inte | `askClaude` |
| 503 | Claude svarar inte (upptagen/nere) | `askClaude` |
