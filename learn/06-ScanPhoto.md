# ScanPhoto.vue

Fil: `app/components/scan/ScanPhoto.vue`

## Vad är det här?

Bordet där gästen och servitören möts, och där gästen kontrollerar beställningen
innan den går vidare.

Gästen visar upp en bild. Servitören (`useImageScan`) springer till köket och
kommer tillbaka med en lista. Men kocken (AI:n) kan ha missat något eller
gissat fel. Därför lägger vi inte varorna direkt i skafferiet. Först får gästen
läsa nota, ändra och stryka. Sedan trycker hen "Add to my ingredients".

Komponenten gör tre saker: visar tips, tar emot ett foto och låter användaren
rätta listan.

## Del 1: script

```ts
const emit = defineEmits<{ confirm: [names: string[]] }>();
```
Komponenten kan skicka ett meddelande uppåt som heter `confirm` och bär med sig
en lista med namn. Det är servitören som ropar till köksmästaren: "Beställningen
är godkänd, här är listan!"

Komponenten sparar INTE själv i databasen. Det gör sidan (`index.vue`) via
`usePantry`. Då vet komponenten inget om Supabase och går att använda på andra
ställen.

```ts
const { detected, loading, errorMessage, scanPhoto } = useImageScan();
```
Hämtar servitören från förra steget.

```ts
const items = ref<string[]>([]);
```
Gästens egen kopia av listan, som hen får skriva i. `detected` är kockens
original och rörs aldrig. Man skriver inte på kockens lapp, man gör en kopia.

```ts
await scanPhoto(file);
input.value = "";
if (errorMessage.value) return;
items.value = [...detected.value];
scanned.value = true;
```
Efter scanningen:

1. Vi väntar på att servitören kommer tillbaka (`await`).
2. Vi nollställer filväljaren. Annars skulle webbläsaren inte reagera om du
   väljer exakt samma bild en gång till.
3. Gick något fel? Då slutar vi här. Felmeddelandet visas redan.
4. Annars kopierar vi listan med `[...detected.value]` (tre punkter = "häll ut
   alla element i en ny lista") och sätter `scanned` till `true` så att
   rättningsdelen dyker upp.

`addItem`, `removeItem` och `reset` är små hjälpare:

- `push` lägger till en vara sist i listan.
- `splice(index, 1)` tar bort en vara på en viss plats.
- `reset` tömmer allt så att komponenten ser ut som i början.

`confirm` trimmar alla namn, filtrerar bort tomma rader (`.filter(Boolean)`)
och skickar listan uppåt med `emit`. Sedan nollställer den.

## Del 2: template

**Tipsen** är en vanlig lista med tre rader om hur man tar ett bra foto:
ljus, utspritt, nära. Det är en del av sprint 3 ("instructions on how to take
the photo"). Bättre bild ger bättre svar från AI:n.

**Filväljaren**
```html
<label class="btn upload">
  Take or choose a photo
  <input type="file" accept="image/*" @change="onFileChange" />
</label>
```
En vanlig filväljare är fulländad på funktion men ful. Därför gömmer vi den
(`opacity: 0`) och lägger den ovanpå en snygg knapp (`label`). Klickar du på
knappen klickar du egentligen på den osynliga väljaren som ligger precis över.
Det är som en genomskinlig glasskiva över en målad skylt.

`accept="image/*"` gör att mobilen frågar "kamera eller galleri?". Vi
använder inte `capture`, för då tvingas du ta ny bild.

**Rättningslistan**
```html
<li v-for="(_, index) in items" :key="index">
  <input v-model="items[index]" type="text" />
```
`v-model="items[index]"` kopplar varje textruta till sin plats i listan. Skriver
du i rutan ändras listan direkt, och ändras listan ändras rutan.

Varför `(_, index)` och inte `name`? Om vi hade skrivit `v-model="name"`
hade vi bara ändrat en lokal kopia, och listan hade inte uppdaterats. Därför
pekar vi direkt på platsen i listan. `_` betyder "värdet behöver jag inte, jag
vill bara ha numret".

Vi använder `index` som `key`. Det går bra här eftersom raderna inte har något
eget id, och eftersom textrutorna alltid läser sitt värde från `items`.

`v-if="scanned"` döljer hela rättningsdelen tills ett foto har lästs. Hittar
AI:n ingenting visar vi "Nothing was found", så användaren kan lägga till själv.

## Del 3: hur sidan använder komponenten

I `index.vue`:

```html
<ScanPhoto @confirm="addIngredients" />
```
När komponenten ropar `confirm` anropas `addIngredients` med listan.
`addIngredients` sparar i Supabase och laddar om skafferiet (se
`05-addIngredients.md`). Listan med ingredienser högre upp på sidan fylls då
på av sig själv.

## Del 4: dela upp i "nya" och "finns redan"

Problem: skannar du samma foto två gånger visar listan allt igen, och när du
bekräftar händer ingenting. Det är rätt (inga dubbletter), men det ser ut som
ett fel.

Första lösningen var en etikett på varje rad. Det blev rörigt när alla rader
hade samma etikett. Bättre: två listor. Det är som att servitören delar notan i
två högar: "det här är nytt" och "det här har ni redan på hyllan".

```ts
const props = defineProps<{ existing: string[] }>();
```
Komponenten får en **prop**: namnen på det som redan finns. En prop är info
som sidan skickar NER till komponenten, som en lapp från köksmästaren. I
`index.vue`:

```html
<ScanPhoto :existing="ingredients.map((ingredient) => ingredient.name)" ... />
```
`.map` gör om listan med objekt (`{ id, name }`) till en enkel lista med bara
namn.

```ts
const existingNames = computed(
  () => new Set(props.existing.map((name) => name.trim().toLowerCase())),
);
function isKnown(name: string) {
  return existingNames.value.has(name.trim().toLowerCase());
}
```
En `computed` är en uppslagstavla som uppdaterar sig själv. Namnen skrivs med
små bokstäver i en `Set`, så att "Milk" och "milk" räknas som samma.
`isKnown` svarar ja eller nej på "står den här redan på hyllan?".

```ts
items.value = detected.value.filter((name) => !isKnown(name));
knownItems.value = detected.value.filter(isKnown);
```
Direkt efter skanningen delar vi fotots lista i två högar med `filter`:

- `items`: det som är NYTT. Det är den enda listan du kan rätta (ändra, ta bort).
- `knownItems`: det som redan finns. Den visas bara som små piller och går inte
  att ändra. Det finns ju inget att rätta, det är redan sparat.

I mallen blir det två rubriker med antal: "New (3)" och "Already in your
pantry (9)". Är allt redan sparat står det "Everything in the photo is already
in your pantry.".

```ts
const newCount = computed(
  () => items.value.filter((name) => name.trim() && !isKnown(name)).length,
);
```
Knappen säger "Add 3 to my ingredients" och är avstängd när `newCount` är 0.
Siffran uppdateras direkt när du skriver, tar bort eller lägger till rader.

Skriver du själv in en vara som redan finns (`addItem`) läggs den inte till i
listan, för det finns inget att spara.

`addIngredients` kollar fortfarande dubbletter själv. Dubbel säkerhet:
komponenten visar bara, funktionen skyddar skafferiet på riktigt.

## Hela flödet nu

1. Gästen väljer ett foto (`ScanPhoto`).
2. Servitören förminskar och skickar bilden (`useImageScan`).
3. Kocken analyserar, Zod kontrollerar (`analyze-image.post.ts`).
4. Gästen rättar listan (`ScanPhoto`).
5. Godkänd lista sparas i skafferiet (`addIngredients`).
6. Gästen väljer kök och trycker "Get recipe".

## Fråga att kunna svara på

"Varför kopierar ni listan i stället för att redigera `detected` direkt?"
Svar: `detected` kommer från `useImageScan` och ska vara AI:ns originalsvar.
Redigerar vi en kopia kan vi nollställa utan att påverka originalet, och
koden blir lättare att följa.
