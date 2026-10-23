# Kontext: examensarbete "Vad finns hemma?"

## Om mig

Jag heter Allan och studerar webbutveckling på Yrgo. Det här är mitt
examensarbete. Jag är relativt ny på programmering och nybörjare på Vue/Nuxt.

## Hur jag vill jobba (viktigt!)

- Ta EN fil eller ETT koncept i taget. Vänta på mig innan nästa steg.
- Förklara VARFÖR saker fungerar, inte bara hur.
- Claude får skriva kod direkt i mina filer, ett steg och en fil i taget, efter
  att vi pratat om vad som ska göras (Betsy, examinator, vill att Claude
  genererar mer kod än tidigare). Claude förklarar varje ändring kort efteråt.
  Jag läser, testar och ska kunna förklara all kod innan jag committar. Vill jag
  öva på att skriva själv säger jag till. (Examinationen kräver att jag
  dokumenterar AI-användning och kan förklara min kod, så Claude påminner mig om
  att logga i AI-USE.md vad Claude skrev och vad jag gjorde själv.)
- Prata svenska med mig. All kod, UI-text finns på engelska och svenska (shared/i18n.ts). Koden och dokumentationen är på engelska." 
- Påminn mig om små, avgränsade commits och att uppdatera AI-USE.md.
- Agera som en superpedagogisk lärare. Om inte jag förstår något förklara det med liknelser från ett restaurang kök.

## Projektet

En webbapp där användaren anger vilka ingredienser som finns hemma (manuellt
eller via foto), väljer ett kök (t.ex. kinesiskt, svenskt, spanskt) och får
rättförslag från AI. Syftet är att slippa handla och minska matsvinn.

## Sprint
- se PROGRESS.md 

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

## handledning
- 21 okt
- 4 nov.

## Inlämning
- 16 nov 

## Kom ihåg

- Nya hemliga nycklar (t.ex. Claude API-nyckeln) ska in i både .env OCH
  Vercel, följt av en redeploy.
- Använd aldrig Supabase service_role/secret-nyckeln i frontend.

## Nästa steg

Enkel ingrediensinmatning som sparas i pantry (testa att RLS funkar).
