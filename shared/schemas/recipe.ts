import { z } from "zod";
import { ALLERGENS } from "../allergens";

// No empty texts, no empty lists and no negative or zero cooking time,
// so an empty or broken AI answer is rejected instead of shown to the user.
export const recipeSchema = z.object({
  name: z.string().min(1),
  ingredients: z.array(z.string().min(1)).min(1),
  instructions: z.array(z.string().min(1)).min(1),
  cuisine: z.string().min(1),
  kid_friendly: z.boolean(),
  allergens: z.array(z.enum(ALLERGENS)),
  cook_time_minutes: z.number().int().positive(),
});

export type Recipe = z.infer<typeof recipeSchema>;
