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

