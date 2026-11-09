# End-to-end test (9 Nov)

Tested on https://vad-finns-hemma.vercel.app in mobile view (about 360 px).
Tick each box that works. Write a short note after any that does not.

## Automated (run by Claude)

- [x] Vitest: 25 of 25 tests pass
- [x] Typecheck: no errors
- [x] Production build: works
- [x] `/api/suggest` logged out gives 401
- [x] `/api/analyze-image` logged out gives 401

## Account

- [x] 1. Sign up with a new email
- [x] 2. Log in with a wrong password shows an error message
- [x] 3. Log in with the right password
- [x] 4. Log out and land on the login page
- [x] 5. Logged out, going to `/`, `/recipes` or `/saved` sends you to login

## Guest

- [x] 6. "Continue as guest" logs in
- [x] 7. The ✕ folds the banner, "Create account" opens it again
- [x] 8. The folded banner stays folded after reload
- [x] 9. Create an account from the banner: the ingredients and saved recipes stay
- [x] 10. Logging out as a guest shows a warning first

## Ingredients

- [x] 11. Add an ingredient by hand
- [x] 12. Remove one ingredient
- [x] 13. Select several and remove them together
- [x] 14. "Remove all"
- [x] 15. Empty pantry shows a message
i reciepes så ser man en meddelande om att man ska lägga till ingrediens
- [x] 16. The list is still there after reload

## Photo scan

- [x] 17. Camera button opens the camera (phone)
- [x] 18. Gallery button picks a photo
- [x] 19. The list from the photo can be changed before confirming
- [x] 20. Ingredients you already have show in their own list
- [x] 21. Too big image or non-food photo gives a clear message

## Recipes

- [x] 22. Choose a cuisine and get a recipe
- [x] 23. "Surprise me" picks a cuisine
- [x] 24. Allergy chosen: the recipe avoids it or shows a warning
- [x] 25. Diet chosen: the recipe follows it
- [x] 26. ~~Only the clicked button shows loading~~ Not relevant any more:
      `/recipes` has only one recipe button since the split into three pages.
- [x] 27. The recipe stays when you change page and come back

## Saved

- [x] 28. The heart saves a recipe
- [x] 29. The recipe shows on `/saved`
- [x] 30. Remove a saved recipe

## Whole app

- [x] 31. Switch to Swedish: all text, and the next recipe, is in Swedish
- [x] 32. Dark mode: everything is readable, also after reload
- [x] 33. The bottom menu shows the page you are on
- [x] 34. No internet (airplane mode): a clear error, not a crash
- [x] 35. No sideways scrolling on any page

## Result

Works: 35/35. Problems found:

-
