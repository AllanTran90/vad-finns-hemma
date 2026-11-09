import { z } from "zod";
import { LANGS } from "../i18n";
import { MAX_INGREDIENTS, MAX_INGREDIENT_LENGTH } from "../limits";

// What the browser is allowed to send to /api/translate-ingredients.
// Same limits as the pantry, since every word in the prompt costs money.
export const translateRequestSchema = z.object({
  names: z
    .array(z.string().trim().min(1).max(MAX_INGREDIENT_LENGTH))
    .min(1)
    .max(MAX_INGREDIENTS),
  lang: z.enum(LANGS),
});

export type TranslateRequest = z.infer<typeof translateRequestSchema>;
