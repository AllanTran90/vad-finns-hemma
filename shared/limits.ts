// Limits for the pantry. Used by the request schema on the server AND by the
// forms in the browser, so the two always agree. If the forms let more through
// than the server accepts, the user only sees "could not get a recipe".
export const MAX_INGREDIENTS = 50;
// Even "kokosmjölk, osötad" is only 18 characters, so 40 leaves plenty of room.
export const MAX_INGREDIENT_LENGTH = 40;
