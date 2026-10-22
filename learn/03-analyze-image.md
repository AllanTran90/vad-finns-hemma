# analyze-image.post.ts

Fil: `server/api/analyze-image.post.ts`

## Vad är det här?

Luckan in till köket. Webbläsaren skickar ett foto hit. Servern frågar Claude
vilka ingredienser som syns, kontrollerar svaret och lämnar tillbaka en
godkänd lista.

Namnet förklarar adressen: filen `analyze-image.post.ts` blir
`POST /api/analyze-image`. `.post` betyder att den tar emot POST-anrop.

Liknelse: en **kock** får en bild genom luckan. Hen kontrollerar att det
verkligen är en bild, visar den för en expert (Claude), kollar att expertens
lista ser rätt ut och lämnar ut den.

Varför på servern? API-nyckeln till Claude får aldrig finnas i webbläsaren.
Där kan vem som helst läsa den.

## Steg 1: ta emot och kontrollera

```ts
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const body = await readBody(event);

if (!body?.image || !ALLOWED_TYPES.includes(body.mediaType)) {
  throw createError({ statusCode: 400, ... });
}
```

- `readBody(event)` läser det som webbläsaren skickade (`{ image, mediaType }`).
- `body?.image` frågar "finns body, och finns image i den?". Frågetecknet
  hindrar krasch om body saknas.
- `!` betyder "inte". Hela raden: "om bilden saknas ELLER typen inte är tillåten".
- `throw createError(...)` avbryter och skickar ett felsvar.
- **400** betyder "du (klienten) skickade fel". **502** längre ner betyder
  "något gick fel hos AI:n". Det är bra att skilja på dem.

Jag testade båda 400-fallen med `curl`. De fungerade.

## Steg 2: förbereda Claude-anropet

```ts
const config = useRuntimeConfig(event);
const client = new Anthropic({ apiKey: config.anthropicApiKey });
```
Hämtar den hemliga nyckeln från din `.env` (på Vercel: miljövariabler) och
skapar en klient, alltså en telefon till Claude.

## Steg 3: skicka bild och fråga

```ts
const message = await client.messages.create({
  model: "claude-haiku-5-5",
  max_tokens: 4000,
  messages: [{
    role: "user",
    content: [
      { type: "image", source: { type: "base64", media_type: body.mediaType, data: body.image } },
      { type: "text", text: `List the food ingredients ...` },
    ],
  }],
});
```

- `model`: vilken Claude. Haiku är snabb och billig.
- `content` är en LISTA med två delar: först bilden, sedan texten med
  instruktionen. Så "visar" man en bild för Claude.
- **Prompten**: "enkla, singulara engelska namn", "bara det du tydligt ser, gissa
  inte", "JSON only", "inga code fences". Varje mening finns för att något gick
  fel utan den (t.ex. kom svaret i ```json-block så `JSON.parse` kraschade).

### Varför `max_tokens: 4000`?

Först stod det 1000. Då avbröts svaret ibland mitt i ("`... "chili crisp`") och
`JSON.parse` kraschade. Orsaken: Claude Haiku "tänker" innan den svarar, och
tänkandet räknas mot samma budget. Ett foto med många burkar ger längre
tänkande, och då tog utrymmet slut. Efter höjningen lyckades 6 av 6 försök. Du
betalar bara för det som används. Gränsen är ett tak.

## Steg 4: plocka ut texten och gör om till data

```ts
const textBlock = message.content.find((block) => block.type === "text");
```
Svaret är en lista med "block". Ett block kan vara tänkande, ett annat text.
`.find` hittar det första som är text. Det är det vi vill läsa.

```ts
let detected;
try {
  detected = JSON.parse(textBlock.text);
} catch (error) {
  ... throw createError({ statusCode: 502, ... });
}
```
`JSON.parse` gör om texten `'{"ingredients":["milk"]}'` till ett riktigt
objekt. Är texten inte giltig JSON kastas ett fel. `try/catch` fångar felet så
att vi svarar snyggt i stället för att krascha.

Raden `console.log("Raw text from Claude:", ...)` lades till för felsökning.
Den kan tas bort.

## Steg 5: Zod-kontrollen

```ts
const result = detectedIngredientsSchema.safeParse(detected);
if (!result.success) { ... throw createError(502) }
return result.data;
```

- `safeParse` kontrollerar mot schemat och kraschar inte. Den svarar
  `{ success: true, data }` eller `{ success: false, error }`.
- `detected` är AI:ns **ofiltrerade** svar. `result.data` är **kontrollerad,
  rensad och typad** data. Bara den lämnar servern.

`JSON.parse` kontrollerar att texten är giltig JSON. `safeParse` kontrollerar
att innehållet är rätt. Båda behövs.

## Känd upprepning

Steg 4 och 5 liknar `suggest.post.ts` nästan helt. Vi städar det efter
Sprint 3 (en gemensam hjälpfunktion).

## Testa dig själv

1. Varför pratar webbläsaren inte direkt med Claude?
2. Vad är skillnaden mellan felkod 400 och 502?
3. Varför är `content` en lista med två delar?
4. Varför höjde vi `max_tokens`, och vad hände innan?
5. Vad är skillnaden på `detected` och `result.data`?
6. Varför behövs både `JSON.parse` och `safeParse`?
