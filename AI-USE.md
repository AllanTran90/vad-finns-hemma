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
