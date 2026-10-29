import { z } from "zod";
import { ALLERGENS } from "../allergens";
import { CUISINES } from "../cuisines";
import { DIETS } from "../diets";
import { LANGS } from "../i18n";
import { MAX_INGREDIENTS, MAX_INGREDIENT_LENGTH } from "../limits";

// What the browser is allowed to send to /api/suggest.
// The limits on ingredients stop someone from sending thousands of words,
// because every word in the prompt costs money.
export const suggestRequestSchema = z.object({
  cuisine: z.enum(CUISINES),
  ingredients: z
    .array(z.string().trim().min(1).max(MAX_INGREDIENT_LENGTH))
    .min(1)
    .max(MAX_INGREDIENTS),
  avoid: z.array(z.enum(ALLERGENS)).default([]),
  diet: z.enum(DIETS).default("none"),
  lang: z.enum(LANGS).default("en"),
});

export type SuggestRequest = z.infer<typeof suggestRequestSchema>;
