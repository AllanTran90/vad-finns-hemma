# detectedIngredients.ts

Fil: `shared/schemas/detectedIngredients.ts`

## Vad är det här?

Kvalitetskontrollen för AI:ns lista med ingredienser. Den har tre rader kod.
Den beskriver hur svaret MÅSTE se ut för att få användas.

Liknelse: en **beställningsblankett** i köket. Saknas en ruta, eller står det
fel sorts info i den, godkänns inte blanketten.

## Koden, rad för rad

```ts
import { z } from "zod";
```
Hämtar Zod, biblioteket som kan kontrollera data.

```ts
export const detectedIngredientsSchema = z.object({
  ingredients: z.array(z.string().trim().min(1)),
});
```
Läs inifrån och ut:

- `z.string()`: ett värde som är text.
- `.trim()`: ta bort mellanslag i början och slutet. `" milk "` blir `"milk"`.
- `.min(1)`: minst ett tecken. Tomma rader (`""`) underkänns. `.trim()` står
  FÖRE `.min(1)`, annars skulle `"   "` (bara mellanslag) slippa igenom.
- `z.array(...)`: en lista där VARJE rad ska följa regeln ovan.
- `z.object({ ingredients: ... })`: ett objekt med nyckeln `ingredients`.

Godkänt: `{ "ingredients": ["milk", "tomato"] }`
Underkänt: `{ "ingredients": ["milk", ""] }` (tom rad)
Underkänt: `{ "ingredients": "milk" }` (text i stället för lista)
Underkänt: `{ "items": [...] }` (fel nyckel)

```ts
export type DetectedIngredients = z.infer<typeof detectedIngredientsSchema>;
```
TypeScript vill veta vilken typ datan har. I stället för att skriva typen för
hand (och riskera att den skiljer sig från schemat) låter vi Zod räkna ut den.
Ändrar du schemat ändras typen av sig själv. Det är DRY.

## Varför ligger den i `shared/`?

`shared/` är receptboken som både gästen (webbläsaren) och köket (servern) får
läsa. Servern använder schemat för att kontrollera AI:ns svar. Webbläsaren
använder typen `DetectedIngredients` för att veta vad den får tillbaka.

## Varför ett objekt och inte bara en lista?

`{ ingredients: [...] }` är lättare att bygga ut senare, till exempel med
`confidence` per ingrediens, utan att något annat går sönder.

## Testa dig själv

1. Vad händer med `{ "ingredients": ["milk", ""] }`?
2. Varför står `.trim()` före `.min(1)`?
3. Vad gör `z.infer`, och varför är det bättre än att skriva typen själv?
4. Varför ligger filen i `shared/` och inte i `server/`?
