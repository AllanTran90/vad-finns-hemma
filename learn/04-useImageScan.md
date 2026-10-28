# useImageScan.ts

Fil: `app/composables/useImageScan.ts`

## Vad är det här?

Servitören. Den tar emot ett foto, packar om det så att det blir lagom stort,
springer med det till köket (`/api/analyze-image`) och kommer tillbaka med
listan. Under tiden håller den koll på tre saker: är jag på väg
(`loading`), gick något fel (`errorMessage`) och vad fick jag tillbaka
(`detected`).

Den ritar ingenting. Det är en rent logisk fil. UI:t (knappen) kommer i nästa
steg och kommer att använda den här filen.

Mönstret är detsamma som i `useRecipe.ts`. Läs den filen bredvid.

## Del 1: `resizeToBase64(file)`

Problem: en mobilbild är ca 2 MB. Som text (base64) blir den ännu större, och
Vercel har en gräns på cirka 4,5 MB per anrop. Dessutom är en stor bild
onödigt dyr och långsam.

Liknelse: kunden kommer med en jättekartong, men luckan är liten. Packa om
innehållet i en mindre låda först.

```ts
const bitmap = await createImageBitmap(file);
```
Läser in bildfilen så att webbläsaren kan rita den.

```ts
const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
```
Hur mycket ska bilden krympas? Den längsta sidan ska bli högst 1568 px
(`MAX_SIZE`). `Math.max` hittar den längsta sidan. `Math.min(1, ...)` ser till
att små bilder aldrig förstoras.

```ts
const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
bitmap.close();
```
Ett `canvas` är en osynlig målarduk. Vi gör den i den nya storleken och ritar
bilden på den. `bitmap.close()` frigör minne.

```ts
return canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
```
`toDataURL` gör om duken till en JPEG (kvalitet 80 %) skriven som text:
`data:image/jpeg;base64,/9j/4AAQ...`. Servern vill bara ha delen efter
kommatecknet. `.split(",")[1]` tar den delen.

Eftersom allt ritas om till JPEG skickar vi alltid `mediaType: "image/jpeg"`.

Jag testade samma storlek med verktyget `sips` på dina kylskåpsfoton. De
gick från cirka 2 MB till cirka 250 KB.

## Del 2: `useImageScan()`

```ts
const detected = ref<string[]>([]);
const loading = ref(false);
const errorMessage = ref("");
```
Tre `ref`. `detected` är listan med ingredienser. Den är en vanlig `ref`, inte
skrivskyddad, eftersom användaren ska kunna rätta den i nästa steg.

```ts
async function scanPhoto(file: File) {
  errorMessage.value = "";
  detected.value = [];
  loading.value = true;
```
Börja med rent bord. Ett gammalt resultat och ett gammalt fel ska inte ligga
kvar och förvirra medan ett nytt foto läses.

```ts
  try {
    const image = await resizeToBase64(file);
    const result = await $fetch<DetectedIngredients>("/api/analyze-image", {
      method: "POST",
      body: { image, mediaType: "image/jpeg" },
    });
    detected.value = result.ingredients;
  } catch (error) {
    console.log("Scan photo error:", error);
    errorMessage.value = "Could not read the photo. Please try again.";
  } finally {
    loading.value = false;
  }
}
```

- `$fetch` är Nuxts sätt att anropa en URL. `<DetectedIngredients>` talar om
  vad vi förväntar oss tillbaka (typen kommer från Zod-schemat).
- `try`: gör det som kan gå fel. `catch`: om något går fel (nätverket, servern
  svarar 502, bilden går inte att läsa), visa ett vänligt felmeddelande.
  `finally`: körs alltid, så `loading` slås av även vid fel. Annars skulle
  knappen kunna fastna i "Loading...".

```ts
return { detected, loading, errorMessage, scanPhoto };
```
Det här är det som sidan får använda. Allt annat (som `resizeToBase64`) är
internt.

## Varför en composable?

Logiken är skild från utseendet. Då kan en komponent (knappen) och en annan
(rättningsvyn) dela samma tillstånd, och logiken går att läsa utan att
läsa CSS.

## Testa dig själv

1. Varför förminskar vi bilden i webbläsaren och inte på servern?
2. Vad gör `finally`, och vad händer om den inte finns?
3. Varför nollställer vi `detected` i början av `scanPhoto`?
4. Varför skickar vi alltid `"image/jpeg"`?
5. Vad är skillnaden på `resizeToBase64` och `scanPhoto`, och varför är bara
   den ena i `return`?
