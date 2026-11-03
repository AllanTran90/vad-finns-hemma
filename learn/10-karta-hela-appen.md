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

## Användarens väg genom appen

```
 🚪 ÖPPNAR APPEN (vad-finns-hemma.vercel.app)
        │
        ▼
 middleware/auth.ts: inloggad?
   │ NEJ                               │ JA
   ▼                                   │
 /login (login.vue + AuthForm)         │
   ├─ Logga in  ── Supabase Auth ──────┤
   ├─ Skapa konto → /signup ───────────┤
   └─ Fortsätt som gäst (anonym) ──────┤
                                       ▼
 🏠 STARTSIDAN (index.vue)
   onMounted: hämta skafferi, val, favoriter ◄── Supabase (RLS 🔒)
   [gäst?] → GuestBanner: "skapa konto" (updateUser, samma id)
        │
        ▼
 ① INGREDIENSER 🥚
   ├─ ✍️ skriv själv ─► usePantry.addIngredient ─► Supabase
   └─ 📸 foto ─► ScanPhoto ─► useImageScan (krymper)
                   ─► /api/analyze-image ─► 🖥️ ─► 🤖 Claude
                   ◄─ ["tomat","ägg"] ◄─ Zod ✅
                   ✏️ DU RÄTTAR listan ─► addIngredients ─► Supabase
        │
        ▼
 ② VAL 🍜
   ├─ Kök (CuisineCard), eller "Överraska mig" 🎲
   ├─ Kost (DietPicker)      ─┐
   └─ Allergier (AllergyPicker)┴─► usePreferences.upsert ─► Supabase
        │
        ▼
 ③ HÄMTA RECEPT 🍲  (knappen är aktiv först när kök + ingredienser finns)
   useRecipe ─► /api/suggest ─► 🖥️ server:
                 401 inloggad? → 400 Zod → 429 kvot? → askClaude 🤖
              ◄─ recept ◄─ Zod ✅  (503/502 om AI:n strular)
        │
        ▼
 ④ RECEPTKORTET (RecipeCard)
   ├─ ⚠️ conflicts: innehåller något du undviker? → varning
   └─ 👨‍🍳 kockmössan ─► useFavorites.saveFavorite ─► Supabase
        │
        ▼
 ⑤ FAVORITER 📒 (FavoritesList → Foldout → RecipeCard)
   └─ tryck kockmössan igen ─► deleteFavorite

 Alltid synligt: 🌐 språk (LangToggle)  🌙 tema (ThemeToggle)  🚪 Logga ut
                 (gäst → "är du säker? datan försvinner")
```

Kort: in genom dörren (login) → visa vad du har i kylen (①) → säg vad du vill
äta (②) → köket lagar (③) → servitören kollar allergierna (④) → spara i
pärmen (⑤).

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
