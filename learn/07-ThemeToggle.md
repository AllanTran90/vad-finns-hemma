# ThemeToggle.vue (dark mode-knappen)

Fil: `app/components/ui/ThemeToggle.vue`, används i `app/app.vue`

## Vad är det här?

Dimmern i matsalen. Restaurangen har två ljussättningar: dag (light) och
kväll (dark). Utan knapp styr bara lokalens automatik (systeminställningen på
din telefon eller dator). Med knappen kan gästen själv välja, och
restaurangen kommer ihåg valet nästa gång.

## Hur färgerna byter (redan klart sedan 21 okt)

I `main.css` ligger alla färger som variabler, till exempel
`--color-bg`. Där finns tre regler:

1. Ljust är standard.
2. Mörkt när systemet säger det, men bara om du inte har valt själv.
3. `:root[data-theme="dark"]` tvingar mörkt, oavsett system.

Det enda knappen behöver göra är att sätta `data-theme="dark"` eller
`"light"` på `<html>`. Då byter alla färger på en gång. Det är som att vrida
på en enda dimmer i stället för att byta varje lampa för sig.

## Steg för steg

```ts
const saved = useCookie<Theme | null>("theme", { maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
```
En cookie är en liten lapp som webbläsaren sparar åt oss. Här står
`dark` eller `light`. `maxAge` är hur länge lappen sparas (ett år i sekunder).

Varför cookie och inte `localStorage`? Servern får cookies med varje begäran,
så den kan rita sidan med rätt tema direkt. Med `localStorage` ritas sidan
först ljus och blinkar sedan till mörk. Det är som att tända ljuset i matsalen
när gästen redan har satt sig.

```ts
const systemDark = ref(false);
onMounted(() => {
  systemDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
});
```
Servern vet inte vad din telefon har för inställning. Först när sidan är
laddad i webbläsaren (`onMounted`) kan vi fråga: "föredrar systemet mörkt?".

```ts
const isDark = computed(() =>
  saved.value ? saved.value === "dark" : systemDark.value,
);
```
Är mörkt eller ljust just nu? Har du valt själv gäller ditt val. Annars gäller
systemet. Knappen behöver svaret för att veta vilken ikon den ska visa och
vad den ska göra vid klick.

```ts
function toggle() {
  saved.value = isDark.value ? "light" : "dark";
}
```
Klick: byt till motsatsen. När `saved` ändras sparas cookien automatiskt.

```ts
useHead({ htmlAttrs: { "data-theme": () => saved.value ?? undefined } });
```
`useHead` ändrar `<head>` och `<html>` från en komponent. Här sätter vi
`data-theme` på `<html>`. Funktionen `() => ...` gör att värdet följer med
när `saved` ändras. `?? undefined` betyder "har du inte valt? Sätt inget
attribut alls", och då bestämmer systemet.

## Template

```html
<Icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" />
```
Är det mörkt visar vi en sol (klicka för att tända), annars en måne. Samma
ikonbibliotek (lucide) som i inloggningen.

`aria-label` ger knappen ett namn för skärmläsare, eftersom den bara har en
ikon och ingen text.

CSS: `position: fixed` lägger knappen uppe till höger och den följer med när du
scrollar. Färgerna kommer från variablerna, så knappen byter färg med temat.

## Varför ligger den i app.vue?

`app.vue` omger alla sidor. Då får inloggningen, registreringen och
startsidan samma knapp utan att vi kopierar den (DRY). Det är som att ha en
dimmer vid dörren i stället för en i varje rum.

## Komponentens namn

Filen ligger i mappen `ui/`, så Nuxt döper den till `UiThemeToggle`
(mappnamn + filnamn). Samma sak som `UiAuthForm`.

## Fråga att kunna svara på

"Varför cookie och inte localStorage?"
Svar: servern kan läsa cookien och rita rätt tema från början, så sidan
blinkar inte. `localStorage` finns bara i webbläsaren.
