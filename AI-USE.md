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