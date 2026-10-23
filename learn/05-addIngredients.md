# addIngredients (i usePantry.ts)

Fil: `app/composables/usePantry.ts`

## Vad är det här?

Förrådsansvarig som tar emot en hel kasse varor på en gång.

Vi hade redan `addIngredient` (en vara i taget, när du skriver in något för
hand). Efter ett fotoscan får vi en hel lista, kanske 12 saker. Då vore det
dumt att gå till skafferiet 12 gånger. `addIngredients` (med s på slutet)
tar hela kassen i en enda tur.

## Steg för steg

```ts
const known = new Set(
  ingredients.value.map((ingredient) => ingredient.name.toLowerCase()),
);
```
Först tittar förrådsansvarig på hyllan: vad finns redan? Vi skriver upp
namnen med små bokstäver i en `Set`.

En `Set` är som en lista där samma sak aldrig kan stå två gånger, och där man
snabbt kan fråga "finns den här redan?". Små bokstäver gör att "Milk" och
"milk" räknas som samma vara.

```ts
for (const name of names) {
  const cleanName = name.trim();
  const key = cleanName.toLowerCase();

  if (!cleanName || known.has(key)) {
    continue;
  }

  known.add(key);
  rows.push({ name: cleanName, user_id: user.value?.sub });
}
```
Nu går vi igenom kassen vara för vara:

- `trim()` tar bort mellanslag runt namnet.
- Är namnet tomt, eller finns det redan i skafferiet? Då hoppar vi över det
  (`continue` betyder "ta nästa vara").
- Annars skriver vi upp det på en inköpslapp (`rows`) och lägger också in det
  i `known`. Då fångar vi dubbletter i själva kassen också, till exempel om
  fotot hittade "tomato" två gånger.

Varje rad får `user_id`. Det är namnskylten som talar om vems varor det är.
Supabase-reglerna (RLS) kollar den skylten och släpper bara in rader som
tillhör dig. Samma sak som i `addIngredient`: `useSupabaseUser()` ger `sub`,
inte `id`.

```ts
if (rows.length === 0) {
  return;
}
```
Inget nytt att lägga på hyllan? Då behöver vi inte gå dit alls.

```ts
const { error } = await supabase.from("pantry").insert(rows);
```
Ett enda anrop med hela listan. `insert` accepterar en array med rader, så det
blir en tur till skafferiet i stället för tolv.

Om något går fel sätter vi `errorMessage`, precis som i de andra funktionerna.
Annars anropar vi `loadIngredients()` så att listan på skärmen uppdateras.

## Varför `return { ... }` blev längre

Vi lade till `addIngredients` i objektet som returneras. Det som inte står där
är "bakom kulisserna" och kan inte användas av sidorna. Det är menyn: bara
rätter som står på menyn kan beställas.

## Fråga att kunna svara på

"Varför kollar ni dubbletter i koden och inte i databasen?"
Svar: för att vi vill skicka bara de nya varorna. En databasregel hade fått
hela insert-anropet att misslyckas så fort en enda vara fanns redan.
