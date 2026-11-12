import type { MessageKey } from "./i18n";
import { MAX_INGREDIENTS, MAX_INGREDIENT_LENGTH } from "./limits";

// What is wrong with a name: a text key from i18n.ts, plus the numbers the text
// needs (for example the max length).
export type NameProblem = {
  key: MessageKey;
  params?: Record<string, number>;
};

// The rules for adding one ingredient by hand. A pure function: it only looks at
// what it gets and returns an answer, no database and no Vue. That makes it easy
// to test. Returns null when the name is OK.
export function checkIngredientName(
  name: string,
  existing: string[],
): NameProblem | null {
  const cleanName = name.trim();

  if (!cleanName) {
    return { key: "pantry.errorEmpty" };
  }

  const alreadyThere = existing.some(
    (existingName) => existingName.toLowerCase() === cleanName.toLowerCase(),
  );

  if (alreadyThere) {
    return { key: "pantry.errorDuplicate" };
  }

  // Same limits as /api/suggest, so the recipe button never gets a 400.
  if (cleanName.length > MAX_INGREDIENT_LENGTH) {
    return {
      key: "pantry.errorTooLong",
      params: { max: MAX_INGREDIENT_LENGTH },
    };
  }

  if (existing.length >= MAX_INGREDIENTS) {
    return { key: "pantry.errorFull", params: { max: MAX_INGREDIENTS } };
  }

  return null;
}
