# AI use
## 2026-10-13
- Tool: Claude (claude.ai chat)
- What: Supabase connection
- How: Asked how to connect Supabase.
- What I did: I read docs, setup database connection, set up the project.

## 2026-10-14
- Tool: Claude (claude.ai chat and Claude Code)
- What: Asked for code suggestions for middleware, error message in login, logout button and how Vue works, database table
- How: Claude explained that Vue has script block outside the template, not inside. Showed me it's @click instead of event listener. Gave me code suggestions.
- What I did: I wrote the code for middleware, error message and logout button. Understood that without await the code will keep on going before the sesson is cleaned Tested on localhost if it works. I read the suggestions of the policies(rules). Typed it in in sql editor. 

## 2026-10-15
- Tool: Claude code
- What: The login and signup forms started to look the same. I wanted to keep the code DRY.
- How: Claude explained props and emit in Vue and reviewed my files. It pointed out mistakes, but I wrote the code.
- What I did: Created a new file called AuthForm for login form.

## 2026-10-16
- Tool: Claude code
- What: Wrote the delete function and button myself. Wrote the first version of usePantry. Tested add, list and delete on localhost.
- How: Claude explained what a composable is and pointed out what was missing in my code. Claude also found that the insert failed because useSupabaseUser() returns `sub`, not `id`. When I got stuck on the composable I asked Claude to edit the files, and it changed usePantry.ts and the top of index.vue.
- What I did: Tested add, list and delete on localhost. Asked Clu(my name for claude code) if he coulde help me with the editing and solve the problem. 

## 2026-10-19
- Tool: Claude code
- What: Will user A and user B have the same ingredients after the input?
How will the user choose cuisine?
- How: Asked my friend Clu how it works with different accounts, do they share ingredients?
Asked Clu how the user choose a cuisine and how to create it.
- What I did: Tested using both chrome and firefox to create two different accounts. Made an input, milk and butter, reload the other accout to check if the ingredients list was still empty or did it put in new ingredients.
Made a file(cuisines.ts) in shared, that will be read by both frontend and backend. Also made CuisineCard.vue.

## 2026-10-20
- Tool: Claude code
- What: Prepared for the supervision meeting (flow chart and explanation of the app). Built the server route that calls the Claude API.  
- How: Claude drew the flow chart and explained server routes, runtimeConfig, template strings and tokens. It pointed out my mistakes (empty apiKey, quotes instead of backticks, max_tokens too low) but I wrote the code.
- What I did: Wrote suggest.post.ts, installed the SDK, added the key to .env and Vercel, tested with curl. Changed the prompt to use ${body.cuisine} and tested units and language.

## 2026-10-21
- Tool: Claude code (and the Figma connector in Claude Code)
- What: Finished validation of Claude's answer in suggest.post.ts. Read the text from the response, turn it into data, check it with the Zod schema and handle errors. 
After my meeting with Hans and Betsy I change my working agreement with Clu, he'll generate more code now and I'll do the code review.
Finished Sprint 2 (get recipe button, result view), made a UI design in Figma and started the styling. Added a "Surprise me" cuisine.
- How: Claude explained .find(), JSON.parse, safeParse, createError and try/catch step by step. It pointed out my mistakes (the .find line was placed before `message` existed, readBlock does not exist, the allergen sentence in the prompt had no list, the import path in shared/) but I wrote the code. When I got to try/catch asked Claude for help.
Told Clu that he'll be able to edit the files more freely from now on. 
Under our new working agreement Claude wrote the code directly in my files and explained each change afterwards. Claude wrote useRecipe.ts (calls /api/suggest), RecipeCard.vue (result view) and the Get recipe button in index.vue. Claude generated three mobile screens in Figma (login, home, recipe). I chose the style myself: first "warm and cozy", then I asked for "fresh and green". Claude turned the Figma colors into CSS variables (main.css) with a dark mode, and restyled the start page, the pantry list and the cuisine cards with them. The "Surprise me" idea was mine, Claude wrote the code (a SURPRISE constant, a card, and a different sentence in the prompt).
- What I did: Used .find() to get the text block (skipping the "thinking" block). Used JSON.parse to turn the text into an object. Checked it with recipeSchema.safeParse and threw a 502 with createError if the recipe is invalid. Tested with curl and saw both success and failure (changed the schema on purpose to see the Zod error). Added the allergen list (ALLERGENS.join) and a "no code fences" sentence to the prompt after Claude once answered with ```json and JSON.parse crashed. Added try/catch around JSON.parse.
Told Clu to help me finish sprint 2, but make sure that he'll explain the code for me so I understand.
Read and tested every change in the browser (the button is disabled until I pick a cuisine, the recipe shows up, the error handling works). Chose the design direction and gave feedback on it. Tested dark mode. Decided what the features should do (Surprise me should let Claude pick any cuisine in the world). Updated PROGRESS.md (Sprint 2 is done).

## 2026-10-22
- Tool: Claude Code
- What: Photo recognition of ingredients        (Sprint 3 start). Styled the login/signup pages. Wrote learning notes.
- How: Claude wrote the Zod schema (detectedIngredients.ts), the server route
  analyze-image.post.ts (sends the photo to the Claude API and validates the answer),
  and the useImageScan composable (resizes the image in the browser before upload).
  Claude also restyled AuthForm.vue (password toggle, switch-link slot) and wrote the
  notes in learn/ explaining each new file. Claude explained each change afterwards.
- What I did: Asked Claude to style the app and the login/signup pages, and told it
  how I wanted them to look. Claude made the changes in AuthForm.vue, login.vue and
  signup.vue, and I gave feedback until I was happy.

## 2026-10-23
- Tool: Claude Code
- What: Finished Sprint 3 (photo scan with a correction list, saved pantry, tips for the photo). Added a dark mode toggle, a Swedish/English toggle for the whole app and the AI answers, two new cuisines (Korean, Italian) and made "Surprise me" pick a random cuisine. Started Sprint 4: allergies and diet are now saved in the database and sent to the recipe prompt. Planned the rest of Sprint 4 (favorites, guest account, error handling) and updated PROGRESS.md. Later the same day: protected /api/suggest and /api/analyze-image so only logged-in users (guests included) can use the Claude key.
- How: Claude fixed TypeScript errors in usePantry and the server routes and wrote addIngredients in usePantry.ts (saves many ingredients at once and skips duplicates), ScanPhoto.vue (tips, file input, correction list), ThemeToggle.vue, LangToggle.vue, useLang.ts and shared/i18n.ts (the dictionary), and changed the prompts so the AI answers in the chosen language. For allergies and diet Claude wrote the SQL for the preferences table, usePreferences.ts, PillGroup.vue, Foldout.vue, DietPicker.vue, AllergyPicker.vue and the diet rules in suggest.post.ts. The recipe card now warns if the recipe contains an allergen I picked. Claude also wrote learning notes 05-08 in learn/, explained each change and suggested the commit messages. When I got a 502 error Claude explained what it meant, asked me for the log, and raised max_tokens in suggest.post.ts from 2000 to 4000 (the AI's thinking uses tokens too, so long answers were cut off). For the API protection Claude wrote server/utils/requireUser.ts (asks Supabase who is calling and throws 401 if nobody is logged in), added `await requireUser(event)` as the first line in both server routes, checked the allergy code and ticked off Sprint 4 in PROGRESS.md. Claude explained what H3Event is, why the check needs `await` and why it goes first, and what curl is.
- What I did: Decided what to build and in which order: finish Sprint 3, the language toggle (the whole app and the AI answers, a simple own solution without a package) and that allergies and diet must be saved in the database so they follow the user. Tested the photo scan on my own fridge photos. When I scanned the same photo twice it looked like nothing happened, so I asked Claude to show which ingredients are already in the pantry, and then to split them into a "new" list and an "already in your pantry" list. Noticed that the dark mode button was missing. Came up with "Surprise me should pick a random cuisine" and added Korean and Italian. Asked for more diet options (pescatarian, lacto-ovo, ovo) and corrected Claude about what a lacto-ovo vegetarian eats. Decided that diet and allergies should be two separate boxes with the same look. Ran the SQL in Supabase myself and tested with two accounts that RLS works (each user only sees their own preferences). Found the 502 error, took screenshots and showed them to Claude. Tested everything in the browser, made the commits and pushed. Decided that a guest account is wanted so people can try the app, with an offer to create an account to keep their data (to be built later in Sprint 4). Asked Claude what was left of the thesis and chose to start with the API protection, since anyone could use my Claude key. Asked what H3Event is. Ran the curl test myself without logging in and got 401 "Please log in to use this."

## 2026-10-24
- Tool: Claude Code
- What: Finished the favorites feature (heart button and a list of saved recipes). Had a second opinion on my code (a code review) and planned the fixes. Started on the fixes: a Zod schema for the request to /api/suggest.
- How: Claude found why the favorites list was not visible (FavoritesList.vue was never used in index.vue) and wired it in. Claude updated PROGRESS.md with the review points in priority order and wrote shared/schemas/suggestRequest.ts (checks cuisine, ingredients, allergies, diet and language before the prompt is built). Claude explained each change afterwards.
- What I did: Tested favorites in the browser and noticed that I could save a recipe but not see the list. Brought the code review and decided the order of the fixes. Made the commits myself.
- What (later 24 Oct): Fixed all six points from the code review. The server now checks what the browser sends (Zod schemas for /api/suggest and /api/analyze-image, including a size limit for the photo), pantry errors show under the form, signup handles "Confirm email", there is a daily limit per user, and the first automatic tests are in place (Vitest).
- How (later 24 Oct): I asked Claude to do all the points and report afterwards. Claude wrote analyzeRequest.ts, connected suggestRequest.ts in suggest.post.ts, wrote requireQuota.ts and the SQL (usage table and increment_usage), installed Vitest and wrote 17 tests, changed index.vue, signup.vue, AuthForm.vue, useRecipe.ts, useImageScan.ts and i18n.ts, and updated PROGRESS.md. Claude ran the tests and the build.
- What I did (later 24 Oct): Decided to do every point at once. Still to do myself: read and be able to explain every change, run the SQL in Supabase, check the "Confirm email" setting, test in the browser and make the commits.
- What (evening 24 Oct): Finished the small fixes from the review and the rest of Sprint 4: duplicate check in the pantry form, stricter recipe schema, .env.example, a redirect from /login for logged-in users, a specific message when Supabase's email limit is hit, error messages for no internet / expired login / daily limit (one shared helper), and the guest account ("Continue as guest" on the login page and a banner to create a real account).
- How (evening 24 Oct): I told Claude to do everything that was left. Claude wrote app/utils/apiErrorKey.ts, GuestBanner.vue, the guest-only middleware, .env.example and the changes in usePantry.ts, login.vue, signup.vue, AuthForm.vue, recipe.ts, i18n.ts and the tests (23 passing). A test found that navigator.onLine is undefined in Node, so Claude made the offline check strict.
- What I did (evening 24 Oct): Tested the daily limit myself (set it to 1, saw the 429 message, checked the usage table in Supabase). Still to do: turn on Anonymous sign-ins in Supabase, test the guest flow and the other changes in the browser, read and explain the new code, and commit.

## 2026-10-26
- Tool: Claude Code
- What: Went through the open points in PROGRESS.md from the top. Turned on anonymous sign-ins in Supabase for the guest account. Added a warning for guests that their ingredients and saved recipes are lost if they log out.
- How: Claude checked the git state and told me which commits were left. It explained what anonymous sign-ins mean for RLS, the daily limit and the captcha recommendation in Supabase, and wrote a pros and cons list for a guest compared to a real account. Claude wrote the warning: a clearer text in the guest banner (shared/i18n.ts) and a confirm box in signOut in index.vue that only appears for guests (`user.is_anonymous`).
- What I did: Turned on "Allow anonymous sign-ins" in Supabase myself. Asked what the difference is between a guest and a real account, and noticed that nothing told a guest that everything disappears when they log out. Chose to have both the clearer text and the confirm box. Made the commits and pushed.
- What (later 26 Oct): Removed every `any` from the project, planned the days until the supervision, and wrote the README with a setup guide anyone can follow, even without programming knowledge. Made supabase/schema.sql one script that can be pasted into the SQL Editor.
- How (later 26 Oct): Claude wrote shared/database.types.ts (the database types, by hand from schema.sql), changed requireQuota.ts, usePantry.ts, usePreferences.ts and useFavorites.ts to use them, and added a Zod check of the saved recipes in useFavorites.ts. It installed typescript 5 and vue-tsc so `npx nuxi typecheck` works. Claude wrote the README (setup guide, the SQL in a code block, a table of common errors), rewrote schema.sql as one script and tested it in a local Postgres (PGlite) with fake auth tables. It also wrote tests/readme.test.ts, which fails if the SQL in the README differs from schema.sql. Claude explained each change afterwards.
- What I did (later 26 Oct): Remembered that my teacher said we should avoid `any` and decided that the project should not have any. Decided the plan: finish the Must list first, then the Could list, and go through everything on Friday 30 Oct, before the supervision on 4 Nov. Tested the app in the browser after the type changes. Said that the Supabase setup must be copy and paste, safe even for someone who does not know what programming is, and that the SQL should work with paste and Cmd+Enter. Asked for the `**` to be removed from the README and asked if VS Code is needed (it is not). Made the commits.

## 2026-10-27
- Tool: Claude Code
- What: Went through PROGRESS.md and chose the order: finish all Must-> mobile polish-> Could. Started with the Must point about unused pantry columns and removed category, quantity, unit and expires_at from the database.
- How: Claude searched the code and found that the four columns were never used, only listed in schema.sql, the README and database.types.ts. Claude explained the options (remove or keep and explain), wrote the SQL `alter table ... drop column` and a read-only check query for me to run first. After that Claude edited schema.sql, README.md and shared/database.types.ts (one file at a time), and ran the tests (24 passing) and the typecheck.
- What I did: Chose to remove the columns instead of keeping them. Asked if the SQL was safe, which led to running the check query first (all four counts were 0, so no data was lost). Ran the `drop column` SQL in Supabase myself and tested the pantry in the app. Decided the order of the work.
- What (later 27 Oct): Formatted the whole project with Prettier, so the indentation and line breaks are the same everywhere.
- How (later 27 Oct): Claude first ran `prettier --check` to show which files would change (21), without changing anything. Then Claude installed Prettier as a devDependency, wrote .prettierrc (semi: true, singleQuote: false, which is how my code already looked), ran `prettier --write` on app, server, shared and tests, and checked that the tests (24 passing) and the typecheck still work. Claude ticked off the point in PROGRESS.md and explained that Prettier only changes how the code looks, not what it does.
- What I did (later 27 Oct): Asked what the difference was between my style and Prettier's, and noticed that my code already used double quotes and semicolons. Decided that the formatting gets its own commit. Still to do: look through the diff in a few files, run `git status`, `git add .` and commit.

## 2026-10-28
- Tool: Claude Code
- What: Finished renaming the heart button on the recipe card to a save button (the icon is now a chef hat). Checked the computer's memory use.
- How: Claude looked at my uncommitted changes and PROGRESS.md, and searched the project for leftover "heart" words. It found two texts in shared/i18n.ts (English and Swedish, the empty favorites list) that still said "heart", and changed them to "chef hat" / "kockmössan". Claude read my Activity Monitor screenshot and explained that the memory was fine (no swap, green pressure), which processes could be closed (Discord, Chrome tabs) and that the `nuxt dev` server is the node process. It explained why node's memory goes up and down (garbage collection) and why Activity Monitor and `ps` show different numbers.
- What I did: Renamed the CSS class and comments from heart to save-button in RecipeCard.vue and index.vue. Looked at the memory use and asked why node went down. Read the diff, tested that the empty list shows the new text in both languages, and made the commit myself.
- What (28 Oct): Fixed the recipe prompt so the AI only uses the ingredients I have (plus salt, pepper, water, oil and sugar). Finished the mobile polish by testing every flow at 360 px. Made the photo scan more exact by sending a bigger image (1568 px instead of 1280 px). 
- How ( 28 Oct): Claude read suggest.post.ts and explained why the AI added 12 ingredients I did not have (the prompt never said to stay with my list), and rewrote that part of the prompt. For the scan Claude read analyze-image.post.ts and useImageScan.ts, explained three possible causes (small image, small model, loose prompt) and changed MAX_SIZE from 1280 to 1568 in useImageScan.ts, plus the matching comment in analyzeRequest.ts and the note learn/04-useImageScan.md. It ran the tests (24 passing), the typecheck and Prettier, checked that the API key is connected (names and length only, never the value), and gave a senior-developer review of the whole project (gaps: guest accounts can get around the daily limit, the two server routes repeat the same code, the daily limit counts failed calls). Claude explained each change afterwards, and what MAX_SIZE does line by line.
- What I did ( 28 Oct): Tested signup, login, getting a recipe, saving, allergies, diet, the photo scan and the guest flow in the browser at 360 px (Samsung Galaxy A55). Noticed that the recipe needed ingredients I did not have, and chose a strict prompt (only my ingredients and basic staples) because you do not always live close to a shop, and put the shopping list idea in the Could have list. Noticed that the scan sometimes lists food that is not in the photo, and decided to try the cheapest fix first (a bigger image) before changing to Sonnet. Tested the bigger image on my fridge photo (it went well) and all 24 tests pass. Made the commits and pushed.

## 2026-10-29
- Tool: Claude Code (new model: Opus 5.5)
- What: Asked the new model to go through the whole project and look for improvments and fix them.
- How: Claude read every file, ran tests and typecheck and listed the improvements
- What I did: Asked for a review with the new model and decide to fix every point.