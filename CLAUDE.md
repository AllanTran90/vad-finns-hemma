# Kontext: examensarbete "Vad finns hemma?"

## Om mig
Jag heter Allan och studerar webbutveckling på Yrgo. Det här är mitt
examensarbete. Jag är relativt ny på programmering och nybörjare på Vue/Nuxt.

## Hur jag vill jobba (viktigt!)
- Ta EN fil eller ETT koncept i taget. Vänta på mig innan nästa steg.
- Förklara VARFÖR saker fungerar, inte bara hur.
- Jag skriver koden själv. Ge förslag och förklaringar, men redigera inte mina
  filer om jag inte uttryckligen ber om det. (Examinationen kräver att jag
  dokumenterar AI-användning och kan förklara min egen kod.)
- Prata svenska med mig. All kod, UI-text och dokumentation ska vara på engelska.
- Påminn mig om små, avgränsade commits och att uppdatera AI-USE.md.

## Projektet
En webbapp där användaren anger vilka ingredienser som finns hemma (manuellt
eller via foto), väljer ett kök (t.ex. kinesiskt, svenskt, spanskt) och får
rättförslag från AI. Syftet är att slippa handla och minska matsvinn.

## Stack
- Nuxt 4 (Vue) – frontend, i app/
- Nuxt server routes – backend, i server/ (håller Claude API-nyckeln hemlig)
- Supabase – databas + auth, via modulen @nuxtjs/supabase
  (redirect: false, types: false)
- Claude API – rättförslag och bildigenkänning av ingredienser
- Zod – validering av AI-svar, scheman delas i shared/
- Vitest – automatiska tester för Zod-valideringen
- Vercel – deploy (vad-finns-hemma.vercel.app)
- Mobile-first

## MVP
Login, ingredienser via foto eller manuellt, AI-bildanalys där användaren kan
rätta listan (lägga till/ändra/ta bort), Zod-validering, val av kök,
rättförslag från AI, spara.

## Definition of Done
Alla MVP-funktioner fungerar, deployat, DRY-kod, automatiska Zod-tester,
AI-användning dokumenterad, fungerar i mobil, felhantering.

## Status just nu (14 okt)
Klart:
- Nuxt-projekt (minimal-mall), Git + GitHub
- Supabase kopplat, SUPABASE_URL och SUPABASE_KEY i .env (ignoreras av Git)
  och inlagda i Vercel
- app/pages/login.vue och signup.vue med felmeddelanden vid misslyckande
- app/middleware/auth.ts (namngiven, inte global) skyddar app/pages/index.vue
- Deploy på Vercel fungerar
- AI-USE.md med logg per dag
- Auth(login and user) in Supabase
- Pantry & Favorites and policies in database
- logga ut-knappen i app/pages/index.vue
- supabase/schema.sql (så att framtida sessioner vet var schemat ligger)

Planerad mappstruktur som inte är skapad än:
app/components/ (pantry/, dish/, ui/), app/composables/, server/api/,
shared/schemas/

Inte bestämt: ska startsidan vara öppen eller kräva inloggning?

## Sprintplan (inlämning 16 nov, handledning 21 okt och 4 nov)
- Sprint 1, v.42: grund, Supabase, login, deploy ← [x]klar
- Sprint 2, v.43: ingrediensinmatning, val av kök, server route mot[]
  Claude API, Zod-validering, enkel resultatvy
- Sprint 3, v.44: bildigenkänning med rättning, sparat skafferi,
  instruktioner för hur man fotar[]
- Sprint 4, v.45: favoriter, allergier/kostpreferenser, felhantering[]
- Sprint 5, v.46: tester, mobilputs, dokumentation, README, licens[]

## Kom ihåg
- Nya hemliga nycklar (t.ex. Claude API-nyckeln) ska in i både .env OCH
  Vercel, följt av en redeploy.
- Använd aldrig Supabase service_role/secret-nyckeln i frontend.

## Nästa steg
Enkel ingrediensinmatning som sparas i pantry (testa att RLS funkar).