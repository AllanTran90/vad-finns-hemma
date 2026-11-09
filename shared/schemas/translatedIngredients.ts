import { z } from "zod";
import { MAX_INGREDIENT_LENGTH } from "../limits";

// What Claude must answer from /api/translate-ingredients: one name per name we
// sent, in the same order. The max length matches the pantry column in the
// database, so a translated name can always be saved. That the list has the same
// length as the request is checked in the route, since only it knows the request.
export const translatedIngredientsSchema = z.object({
  names: z.array(z.string().trim().min(1).max(MAX_INGREDIENT_LENGTH)),
});

export type TranslatedIngredients = z.infer<typeof translatedIngredientsSchema>;
