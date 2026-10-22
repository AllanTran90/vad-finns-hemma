import { z } from "zod";

export const detectedIngredientsSchema = z.object({
  ingredients: z.array(z.string().trim().min(1)),
});

export type DetectedIngredients = z.infer<typeof detectedIngredientsSchema>;
