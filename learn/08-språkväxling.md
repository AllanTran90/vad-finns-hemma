# Språkväxling (svenska/engelska)

Filer:
- `shared/i18n.ts` (ordlistorna och `translate`)
- `app/composables/useLang.ts` (valt språk och `t()`)
- `app/components/ui/LangToggle.vue` (knappen)
- små ändringar i nästan alla komponenter, composables och i de två server routes som anropar Claude

## Vad är det här?

Menyn finns på två språk. Restaurangen har två tryckta menyer, en svensk och en
engelsk, med exakt samma rätter i samma ordning. Varje rätt har ett nummer
(nyckel), till exempel `pantry.delete`. Gästen säger bara numret ("nummer 14!")
och servitören hämtar rätt text från den meny som gästen valt.

Så fungerar översättningen: ingen text står "hårdkodad" i komponenterna längre.
Där det förut stod `Delete` står nu `t("pantry.delete")`, och `t` slår upp
rätt språk.

## Del 1: `shared/i18n.ts` (menyerna)

```ts
const en = { "pantry.delete": "Delete", ... };
const sv: Record<MessageKey, string> = { "pantry.delete": "Ta bort", ... };
```
Två objekt med samma nycklar. `MessageKey` är en typ som TypeScript bygger av
nycklarna i `en`. `Record<MessageKey, string>` på `sv` betyder: "här MÅSTE alla
nycklar finnas". Glömmer du en översättning blir koden röd i editorn. Det är
som en kontrollant som räknar att båda menyerna har lika många rätter.

Filen ligger i `shared/` eftersom både webbläsaren och servern får läsa den.

```ts
export function translate(lang, key, params = {}) {
  let text = messages[lang][key];
  for (const [name, value] of Object.entries(params)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}
```
Slå upp texten för språket och nyckeln. Vissa texter har luckor, till exempel
`"Add {count} to my ingredients"`. `params` fyller i luckorna: `{ count: 3 }`
blir "Add 3 to my ingredients". Det är som en beställningsnota där antalet
skrivs in i efterhand.

## Del 2: `useLang.ts` (servitören som vet vilken meny gästen valt)

```ts
const lang = useState<Lang>("lang", () => (cookie.value === "sv" ? "sv" : "en"));
```
`useState` är en gemensam anslagstavla. Alla komponenter som anropar
`useLang()` läser samma tavla. Byter du språk på ett ställe byter alla på en
gång.

Cookien `lang` är en lapp som webbläsaren sparar, så att valet finns kvar nästa
gång (samma idé som dark mode-knappen). Första gången, utan cookie, blir det
engelska.

```ts
function t(key, params) {
  return translate(lang.value, key, params);
}
```
`t` är kortform för "translate". Den läser `lang.value`. Eftersom Vue håller
koll på allt som läses i en mall (`template`) ritas texterna om automatiskt
när språket ändras. Det är därför hela appen byter språk direkt, utan omladdning.

```ts
function setLang(next) {
  lang.value = next;
  cookie.value = next;
}
```
Byt tavlan och spara lappen.

## Del 3: `LangToggle.vue` (knappen)

En rund knapp bredvid dark mode-knappen. Den visar språket du kan byta TILL
("SV" när appen är engelsk). `useHead` sätter `<html lang="sv">` så att
skärmläsare använder rätt röst.

Den ligger i `app.vue` tillsammans med dark mode-knappen, så den syns på alla
sidor.

## Del 4: AI:n ska också svara på rätt språk

Servern kan inte läsa tavlan i webbläsaren. Därför skickar vi med språket:

```ts
body: { cuisine, ingredients, lang: lang.value }
```
I `suggest.post.ts`:
```ts
const language = body.lang === "sv" ? "Swedish" : "English";
... `I want to cook ${wish}. Answer in ${language}.` ...
```
Bara exakt `"sv"` ger svenska. Allt annat blir engelska. Det är en säkerhetsbälte:
ingen kan skicka in konstiga värden och styra prompten.

Vi la också till en rad: "Keep the JSON keys and the allergen values exactly
as written (in English)". Varför? Zod-schemat kräver att allergennamnen är
exakt `milk`, `gluten` osv. Skulle Claude svara "mjölk" skulle valideringen
säga nej. Nycklarna och allergenerna ska vara kvar på engelska. Det är bara
texten som visas för användaren som ändras.

Allergenerna översätts i stället i webbläsaren: `t("allergen.milk")` blir
"mjölk" på skärmen. Koden i maten är densamma, bara skylten på bordet byts.

`analyze-image.post.ts` fick samma sak, så att ingredienserna från ett foto
kommer på valt språk ("tomat" i stället för "tomato").

## Köken

`CUISINES` i `shared/cuisines.ts` är kvar på engelska (`"Swedish"`). Det är
idén bakom koden, och det är det som skickas till Claude. I `CuisineCard.vue`
översätts bara det som visas på knappen: `t("cuisine.Swedish")` blir "Svenskt".
Två lager, som en kod på kökslappen och ett namn på menyn.

## Det här översätts inte (med flit)

- Det du själv skrivit in som ingredienser ligger kvar som du skrev dem.
- Ett recept som redan visas byter inte språk. Tryck "Få recept" igen.
- Ett felmeddelande som redan visas byter inte språk. Det är en färdig text.
  Nästa fel kommer på rätt språk.

## Fråga att kunna svara på

"Varför inte ett färdigt paket som @nuxtjs/i18n?"
Svar: för en app med två språk och ett fåtal texter räcker en enkel egen
lösning, och jag förstår varje rad. Paketet är bra när man har många språk,
språk i URL:en eller behöver pluralformer.

## Tillägg: Surprise me och fler kök

**Surprise me** betyder nu "slumpa ett av köken som finns". Funktionen
`pickRandomCuisine()` i `shared/cuisines.ts` drar ett slumptal:

```ts
CUISINES[Math.floor(Math.random() * CUISINES.length)]
```
`Math.random()` ger ett tal mellan 0 och 1. Gånger antalet kök och avrundat
neråt (`Math.floor`) får vi ett index, till exempel 3 av 8. Det är som att
slumpa en lott ur en skål med lika många lappar som det finns kök.

`index.vue` gör bytet precis innan receptet beställs. Kocken (servern) får
alltså alltid ett riktigt kök och behöver inte veta att "Surprise me" finns.
Därför kunde vi ta bort den extra grenen i `suggest.post.ts`. Mindre kod, färre
ställen som kan gå fel.

**Korean och Italian** lades till i `CUISINES` och i båda ordlistorna
(`cuisine.Korean` = Koreanskt, `cuisine.Italian` = Italienskt).
