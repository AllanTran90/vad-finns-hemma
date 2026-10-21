import { z } from "zod";
import { ALLERGENS } from "../allergens";

export const recipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  cuisine: z.string(),
  kid_friendly: z.boolean(),
  allergens: z.array(z.enum(ALLERGENS)),
  cook_time_minutes: z.number(),
});
