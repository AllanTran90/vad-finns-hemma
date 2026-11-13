# How the app works (flow charts)

Five diagrams, from the big picture to the details. GitHub shows them as
pictures (Mermaid).

1. [The big picture](#1-the-big-picture)
2. [Login and pages](#2-login-and-pages)
3. [Ingredients: by hand or by photo](#3-ingredients-by-hand-or-by-photo)
4. [Getting a recipe](#4-getting-a-recipe)
5. [Guest to real account](#5-guest-to-real-account)

## 1. The big picture

The browser talks to Supabase directly for the user's own data (protected by
RLS), and to our own server for everything that needs the Claude API key.

```mermaid
flowchart LR
  subgraph Browser["Browser (Nuxt + Vue)"]
    Pages["Pages: / · /recipes · /saved<br/>/login · /signup"]
    Comps["Composables:<br/>usePantry, useFavorites,<br/>usePreferences, useRecipe,<br/>useImageScan, usePantryTranslate"]
    Pages --> Comps
  end

  subgraph Server["Nuxt server routes (Vercel)"]
    Suggest["POST /api/suggest"]
    Analyze["POST /api/analyze-image"]
    Translate["POST /api/translate-ingredients"]
    Checks["requireUser → readValidBody (Zod)<br/>→ requireQuota → askClaude"]
    Suggest --> Checks
    Analyze --> Checks
    Translate --> Checks
  end

  subgraph Supabase["Supabase"]
    Auth["Auth<br/>(email + guest login)"]
    DB[("Database with RLS<br/>pantry · favorites<br/>preferences · usage")]
  end

  Claude["Claude API<br/>(claude-opus-5-5)"]

  Comps -- "pantry, favorites,<br/>preferences (publishable key)" --> DB
  Comps -- "log in / sign up" --> Auth
  Comps -- "$fetch + login cookie" --> Suggest
  Comps --> Analyze
  Comps --> Translate
  Checks -- "increment_usage()" --> DB
  Checks -- "secret API key" --> Claude
```

## 2. Login and pages

Two route middlewares decide who may see which page.

```mermaid
flowchart TD
  Start(["User opens the app"]) --> Which{"Which page?"}

  Which -- "/ · /recipes · /saved" --> Auth{"middleware auth:<br/>logged in?<br/>(guest counts)"}
  Auth -- "no" --> Login
  Auth -- "yes" --> App["Show the page<br/>+ bottom menu"]

  Which -- "/login · /signup" --> GuestOnly{"middleware guest-only:<br/>real account?"}
  GuestOnly -- "yes" --> Home["Go to /"]
  GuestOnly -- "no, or a guest" --> Login["Login / signup page"]

  Login -- "email + password<br/>(signInWithPassword / signUp)" --> Ok{"Supabase OK?"}
  Login -- "Continue as guest<br/>(signInAnonymously)" --> Ok
  Ok -- "no" --> Err["Error message<br/>on the form"]
  Ok -- "yes" --> Home
  Home --> App
```

## 3. Ingredients: by hand or by photo

Typed ingredients go straight to the database. A photo goes through the server
and Claude first, and the user checks the list before anything is saved.

```mermaid
flowchart TD
  Start(["Start page /"]) --> How{"How?"}

  How -- "type a name" --> Form["PantryAddForm"]
  Form --> Name{"Valid name?<br/>(1-40 chars, not a duplicate,<br/>max 50 in the pantry)"}
  Name -- "no" --> FormErr["Message under the input"]
  Name -- "yes" --> Insert

  How -- "camera or gallery" --> Photo["ScanSources → useImageScan"]
  Photo --> Resize["Resize in the browser<br/>(max 1568 px)"]
  Resize --> Analyze["POST /api/analyze-image"]
  Analyze --> Checks["Server checks<br/>(see diagram 4)"]
  Checks --> ClaudeRead["Claude reads the photo<br/>'if unsure, leave it out'"]
  ClaudeRead --> ZodOut{"Zod: a valid list?"}
  ZodOut -- "no" --> ScanErr["'Could not read the photo'"]
  ZodOut -- "yes" --> Review["ScanReview:<br/>new items / already in pantry"]
  Review -- "user removes or changes items,<br/>then confirms" --> Insert

  Insert["supabase.from('pantry').insert"] --> RLS{"RLS + check:<br/>user_id is me?<br/>name 1-40 chars?"}
  RLS -- "no" --> DbErr["Error, nothing saved"]
  RLS -- "yes" --> List["PantryList shows it<br/>(counter: 12 of 50)"]
```

## 4. Getting a recipe

The order on the server matters: bad requests stop before they use up the daily
limit, and nothing reaches Claude before all checks pass.

```mermaid
sequenceDiagram
  actor U as User
  participant R as /recipes (useRecipe)
  participant S as /api/suggest
  participant DB as Supabase
  participant C as Claude API

  U->>R: Pick cuisine, style, diet, allergies<br/>and press "Get recipe"
  R->>S: POST {cuisine, ingredients, avoid, diet, style, lang}<br/>+ login cookie

  S->>S: requireUser
  alt not logged in / fake token
    S-->>R: 401 "Please log in"
  end

  S->>S: readValidBody (Zod: suggestRequestSchema)
  alt unknown cuisine, too many or too long ingredients
    S-->>R: 400 "Invalid request"
  end

  S->>DB: rpc increment_usage(30 or 10 for guests)
  alt limit reached
    S-->>R: 429 "Daily limit reached"
  else database error
    S-->>R: 500 "Could not check the daily limit"
  end

  S->>C: prompt + recipeSchema (structured outputs)<br/>with the secret API key
  alt Claude busy or answer has wrong shape
    S-->>R: 503 / 502 "Could not get a valid recipe"
  end
  C-->>S: recipe (checked by Zod)

  S-->>R: 200 recipe
  R-->>U: RecipeCard (warning if an allergen is still in it)
  U->>DB: Heart → favorites.insert (RLS: only my rows)
```

The browser turns each status code into a message in the chosen language
(app/utils/apiErrorKey.ts).

## 5. Guest to real account

`updateUser` adds an email and a password to the guest's user. The user id
stays the same, so every row that points to it stays too.

```mermaid
flowchart LR
  Guest["Guest<br/>user id: abc"] --> Banner["GuestBanner →<br/>GuestUpgradeForm"]
  Banner -- "email + password" --> Update["supabase.auth.updateUser"]
  Update --> Real["Real account<br/>user id: abc (same)"]
  Real --> Rows[("pantry, favorites,<br/>preferences with user_id = abc<br/>are still there")]

  Guest -- "log out" --> Confirm{"ConfirmDialog:<br/>'your data will be lost'"}
  Confirm -- "cancel" --> Guest
  Confirm -- "log out" --> Gone["Session gone,<br/>the data cannot be reached again"]
```
