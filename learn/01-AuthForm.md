# AuthForm.vue (plus login.vue och signup.vue)

Fil: `app/components/ui/AuthForm.vue`

## Vad är det här?

Formuläret som används på både login-sidan och signup-sidan. Det ritar
loggan, kortet med e-post och lösenord, ögat som visar lösenordet och länken
under kortet.

Liknelse: AuthForm är en **lunchbricka**. Brickan ser likadan ut för alla
gäster. Det enda som skiljer är texten (titel) och vad som ligger i det tomma
facket längst ner (slot).

## Del 1: script (logiken)

```ts
defineProps<{
  title: string;
  passwordAutocomplete: string;
  errorMessage?: string;
}>();
```
**Props** är det sidan skickar IN till komponenten. `title` blir "Log in" eller
"Create account". `errorMessage?` har ett frågetecken, så den är valfri.

```ts
const email = ref("");
const password = ref("");
const showPassword = ref(false);
```
Tre `ref`. Två håller det användaren skriver. `showPassword` är en av/på-knapp:
`false` betyder att lösenordet är dolt.

```ts
const emit = defineEmits<{
  submit: [email: string, password: string];
}>();

function onSubmit() {
  emit("submit", email.value, password.value);
}
```
Komponenten loggar inte in själv. Den vet inte hur (login och signup gör olika
saker). I stället ropar den "submit!" och skickar med e-post och lösenord. Det
är en **emit**. Sidan som använder komponenten lyssnar och gör jobbet.
Servitören tar beställningen. Han lagar inte maten.

## Del 2: template (det man ser)

```
<main class="auth">
  <div class="brand"> ... ikon, "Vad finns hemma?", tagline ... </div>
  <div class="card">
    <h1>{{ title }}</h1>
    <form> ... </form>
    <p v-if="errorMessage" role="alert">...</p>
  </div>
  <p class="switch"><slot /></p>
</main>
```

Detaljer:

- `{{ title }}` visar prop-värdet.
- `<form @submit.prevent="onSubmit">`: `@submit` lyssnar på att formuläret
  skickas. `.prevent` stoppar webbläsarens standardbeteende (att ladda om
  sidan).
- `v-model="email"` kopplar input-rutan och `ref`:en åt båda hållen. Skriver
  man i rutan ändras `email.value`, och tvärtom.
- `required` gör att webbläsaren själv klagar om fältet är tomt.
- `autocomplete` hjälper lösenordshanterare. Därför skickas
  `passwordAutocomplete` in: login vill ha `current-password`, signup
  `new-password`.

### Ögat

```
:type="showPassword ? 'text' : 'password'"
```
`:` framför `type` betyder "räkna ut värdet". Är `showPassword` sant blir
fältet `text` (synligt), annars `password` (prickar).

```
@click="showPassword = !showPassword"
```
Ett klick vänder värdet. `!` betyder "tvärtom".

```
<Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" />
```
Ikonen byter mellan öga och överstruket öga.

`:aria-label` ger skärmläsare en text ("Show password"), eftersom knappen bara
har en bild.

`type="button"` på ögat är viktigt. Utan det skulle ett klick räknas som
"skicka formuläret".

### Länken under kortet: `<slot />`

Facket på brickan. I login.vue står:

```
<UiAuthForm title="Log in" ... @submit="signIn">
  No account yet? <NuxtLink to="/signup">Create account</NuxtLink>
</UiAuthForm>
```
Allt mellan start- och sluttaggen hamnar i `<slot />`. Stilen (centrerad, grön
länk) skrivs en gång i AuthForm. Det är DRY.

## Del 3: style scoped

`scoped` betyder att stilen bara gäller den här komponenten. Klassen `.card`
här påverkar inte en annan `.card` på en annan sida.

Ögat:

- `.password-field { position: relative; }` gör fältet till "bordet".
- `.toggle { position: absolute; right: 0.5rem; top: 50%; transform:
  translateY(-50%); }` lägger knappen på bordet, 0,5 rem från högerkanten,
  och centrerar den lodrätt. Det gör att ögat hamnar INNE i rutan.
- `padding-right: 3rem` på inputen ger plats så att långa lösenord inte skrivs
  under ögat.

Färgerna kommer från `var(--color-...)`. Det är dina designtokens i
`main.css`, och därför fungerar mörkt läge utan extra kod.

## Hur login.vue använder den

```ts
async function signIn(email: string, password: string) { ... }
```
AuthForm skickar `submit`. `@submit="signIn"` kopplar det till funktionen, som
frågar Supabase om uppgifterna stämmer. Vid fel sätts `errorMessage`, som
skickas tillbaka som prop och visas i varningsrutan. Vid lyckat svar skickas
användaren till `/`.

signup.vue gör samma sak med `supabase.auth.signUp`.

## Testa dig själv

1. Varför loggar inte AuthForm in användaren själv?
2. Vad händer om du tar bort `position: relative` från `.password-field`?
3. Varför står `type="button"` på ögat?
4. Vad är skillnaden på en prop och en emit?
5. Vad hamnar i `<slot />` på signup-sidan?
