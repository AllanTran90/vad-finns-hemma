# Genomgång: alla filer, en i taget

Startad 2 nov. Ordningen följer användarens väg: in genom dörren, logga in,
använda appen, och sist servern bakom. Bocka av med `[x]` när en fil sitter.

## Klart

- [x] 1. `app/app.vue` – bordsplaceringen, `<NuxtPage />` är tallriken som fylls
- [x] 2. `app/middleware/guest-only.ts` – vakten vid kassan
- [x] 3. `app/middleware/auth.ts` – vakten vid matsalen
- [x] 4. `app/pages/login.vue` – loggar in, gästknapp, skickar props/tar emot emit

- [x] 5. `app/components/ui/AuthForm.vue` – formuläret, delas av login och signup

- [x] 6. `app/pages/signup.vue` – tvilling till login, "kolla din mejl"-besked

## Alltid synligt

- [x] 7. `app/composables/useLang.ts` – ger `lang`, `t` och `setLang`
- [x] 8. `shared/i18n.ts` – ordboken (menypärmen på två språk) + `translate`
- [ ] 9. `app/components/ui/LangToggle.vue`
- [ ] 10. `app/components/ui/ThemeToggle.vue`

## Startsidan och ingredienser

- [ ] 11. `app/pages/index.vue`
- [ ] 12. `app/components/guest/GuestBanner.vue`
- [ ] 13. `app/composables/usePantry.ts`
- [ ] 14. `app/components/pantry/PantryList.vue`

## Foto av ingredienser

- [ ] 15. `app/composables/useImageScan.ts`
- [ ] 16. `app/components/scan/ScanPhoto.vue`
- [ ] 17. `server/api/analyze-image.post.ts`

## Val och recept

- [ ] 18. `shared/cuisines.ts`, `shared/diets.ts`, `shared/allergens.ts`
- [ ] 19. `app/composables/usePreferences.ts`
- [ ] 20. `app/components/ui/PillGroup.vue`, `app/components/ui/Foldout.vue`
- [ ] 21. `app/components/cuisine/CuisineCard.vue`, `diet/DietPicker.vue`, `allergy/AllergyPicker.vue`
- [ ] 22. `app/composables/useRecipe.ts`
- [ ] 23. `server/api/suggest.post.ts`
- [ ] 24. `app/components/recipe/RecipeCard.vue`

## Favoriter

- [ ] 25. `app/composables/useFavorites.ts`
- [ ] 26. `app/components/favorites/FavoritesList.vue`

## Servern bakom

- [ ] 27. `server/utils/requireUser.ts`
- [ ] 28. `server/utils/requireQuota.ts`
- [ ] 29. `server/utils/askClaude.ts`
- [ ] 30. `app/utils/apiErrorKey.ts`

## Zod och regler

- [ ] 31. `shared/schemas/` (4 filer)
- [ ] 32. `shared/limits.ts`

## Databas, tester och inställningar

- [ ] 33. `supabase/schema.sql` + `supabase/migrations/`
- [ ] 34. `tests/` (5 filer)
- [ ] 35. `nuxt.config.ts`, `package.json`, `.env.example`

## Saker jag lärt mig hittills

- **Komponentnamn:** `components/` tas bort, mappen blir prefix.
  `components/ui/ThemeToggle.vue` → `<UiThemeToggle />` ("köttkylen, hylla 2").
- **Middleware:** en vakt som körs innan sidan visas. Kopplas på med
  `definePageMeta({ middleware: "auth" })`, där namnet är filnamnet.
- **`ref` och `.value`:** `user` är lådan i webbläsaren, `user.value` är
  innehållet (den inloggade, eller `null`). Supabase är förrådet med alla.
- **`?.`:** om det till vänster är tomt, stanna och ge `undefined` i stället
  för att krascha.
- **`!` och `&&`:** `!` vänder sant/falskt, `&&` kräver att båda är sanna.
- **`const { error } = ...`:** destructuring, plocka ut en sak ur ett objekt.
- **`autocomplete`:** säger till webbläsaren om det är ett befintligt
  (`current-password`) eller nytt (`new-password`) lösenord.
- **`:` (props):** "räkna ut detta och skicka ner till komponenten" (bongen).
  Utan kolon skickas texten som den står.
- **`@` (emit):** "lyssna när komponenten säger att något hänt" (klockan).
  `@submit="signIn"` kör `signIn` när AuthForm ropar `submit`.
- **Slots:** tomrum i en komponent som den som använder den får fylla. Bara ett
  får sakna namn, andra heter t.ex. `extra`. Man måste inte fylla dem.
- **`v-model`:** sladden mellan en inmatningsruta och en låda (`ref`). Ändras
  den ena ändras den andra.
- **`villkor ? a : b`:** kort if-sats. Sant ger `a`, falskt ger `b`.
  `hungry ? "pasta" : "nothing"` ger bara svaret, aldrig `true`.
- **`@submit.prevent`:** stoppar att sidan laddas om när formuläret skickas.
  Formuläret gör också att Enter fungerar (om rutorna är ifyllda, `required`).
- **Composable:** en `use...`-funktion med bara logik, ingen HTML. En station i
  köket som alla komponenter hämtar från (DRY).
- **cookie vs `useState`:** cookien minns till nästa besök (stamgästkortet),
  `useState` delar språket mellan alla komponenter just nu (bordsskylten).
- **Dagsgräns:** 30 AI-anrop per användare och dag (`requireQuota.ts`).
