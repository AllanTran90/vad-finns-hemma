import { describe, expect, it } from "vitest";
import { recipeSchema } from "../shared/schemas/recipe";

const valid = {
  name: "Pasta al pomodoro",
  ingredients: ["200 g pasta", "4 tomatoes"],
  instructions: ["Boil the pasta.", "Add the sauce."],
  cuisine: "Italian",
  kid_friendly: true,
  allergens: ["gluten"],
  cook_time_minutes: 25,
};

describe("recipeSchema", () => {
  it("accepts a valid recipe", () => {
    expect(recipeSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a recipe with a missing field", () => {
    const { name, ...withoutName } = valid;

    expect(recipeSchema.safeParse(withoutName).success).toBe(false);
  });

  it("rejects an allergen that is not in our list", () => {
    const result = recipeSchema.safeParse({ ...valid, allergens: ["unicorn"] });

    expect(result.success).toBe(false);
  });

  it("rejects the wrong type, for example cook time as text", () => {
    const result = recipeSchema.safeParse({ ...valid, cook_time_minutes: "soon" });

    expect(result.success).toBe(false);
  });

  it("rejects empty texts and empty lists", () => {
    expect(recipeSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
    expect(recipeSchema.safeParse({ ...valid, ingredients: [] }).success).toBe(false);
    expect(recipeSchema.safeParse({ ...valid, instructions: [""] }).success).toBe(false);
  });

  it("rejects zero, negative and fractional cooking time", () => {
    expect(recipeSchema.safeParse({ ...valid, cook_time_minutes: 0 }).success).toBe(false);
    expect(recipeSchema.safeParse({ ...valid, cook_time_minutes: -5 }).success).toBe(false);
    expect(recipeSchema.safeParse({ ...valid, cook_time_minutes: 12.5 }).success).toBe(false);
  });

  it("accepts a recipe without allergens", () => {
    expect(recipeSchema.safeParse({ ...valid, allergens: [] }).success).toBe(true);
  });
});
