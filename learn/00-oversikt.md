# Översikt: hur hänger allt ihop?

Läs den här filen först. Sedan finns en fil per kodfil som Claude skrev i den
här sessionen (22 okt).

## Restaurangen

Appen är en restaurang.

| I restaurangen | I appen | Var i koden |
|---|---|---|
| Gästen vid bordet | Webbläsaren, det användaren ser | `app/pages`, `app/components` |
| Servitören | En composable, springer mellan gäst och kök | `app/composables/useImageScan.ts` |
| Luckan in till köket | En server route (URL som börjar med `/api/`) | `server/api/analyze-image.post.ts` |
| Expertkocken | Claude (AI:n) | anropas från server routen |
| Kvalitetskontrollen | Zod-schemat | `shared/schemas/detectedIngredients.ts` |
| Receptboken som både gäst och kök får läsa | Mappen `shared/` | `shared/` |
| Skafferiet | Supabase-tabellen `pantry` | `app/composables/usePantry.ts` |

Varför ligger API-nyckeln i köket och inte hos gästen? Om gästen fick nyckeln
till kassaskåpet kunde vem som helst plocka ut pengarna. Därför pratar
webbläsaren aldrig direkt med Claude. Den pratar med vårt kök (server routen),
och köket pratar med Claude.

## Vad händer när man fotograferar kylen?

Så här ska flödet bli när allt är klart. Markerat med [KLART] eller [KOMMER].

1. Användaren väljer ett foto. [KOMMER, komponenten `ScanPhoto.vue`]
2. `scanPhoto(file)` i `useImageScan.ts` förminskar bilden. [KLART]
3. Den skickar bilden som text (base64) till `/api/analyze-image`. [KLART]
4. Server routen kontrollerar att det är en bild och skickar den till Claude.
   [KLART]
5. Claude svarar med text som ska vara JSON. `JSON.parse` gör om texten till
   data. [KLART]
6. Zod kontrollerar att datan har rätt form. [KLART]
7. Den godkända listan skickas tillbaka till webbläsaren. [KLART]
8. `detected` i `useImageScan` får listan. [KLART]
9. Användaren rättar listan (ändra, ta bort, lägga till). [KOMMER]
10. Godkända ingredienser sparas i skafferiet (`pantry`). [KOMMER]

## Ordlista

- **ref**: en "behållare" för ett värde som Vue håller koll på. Ändras värdet
  ritas sidan om. Man läser och skriver med `.value`.
- **composable**: en funktion som börjar med `use...` och samlar logik och
  tillstånd som flera sidor kan dela.
- **prop**: info som en förälder skickar NER till en komponent.
- **emit**: ett meddelande som en komponent skickar UPP till sin förälder
  ("jag blev klickad").
- **slot**: ett tomt fack i en komponent som föräldern fyller med eget innehåll.
- **base64**: ett sätt att skriva en fil (t.ex. en bild) som vanlig text, så
  att den kan skickas inuti JSON.
- **token**: en liten bit text som AI-modeller räknar i. `max_tokens` är
  budgeten för hur mycket modellen får "säga och tänka".
- **schema (Zod)**: en mall som beskriver hur data MÅSTE se ut.
- **server route**: kod som körs på servern (inte i webbläsaren), t.ex. för att
  hålla hemliga nycklar hemliga.

## Filerna i den här sessionen

1. `01-AuthForm.md` (+ login.vue och signup.vue)
2. `02-detectedIngredients.md`
3. `03-analyze-image.md`
4. `04-useImageScan.md`
