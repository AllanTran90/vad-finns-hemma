import { describe, expect, it } from "vitest";
import { MAX_INGREDIENTS, MAX_INGREDIENT_LENGTH } from "../shared/limits";
import { translateRequestSchema } from "../shared/schemas/translateRequest";
import { translatedIngredientsSchema } from "../shared/schemas/translatedIngredients";

describe("translateRequestSchema", () => {
  const valid = { names: ["tomato", "mjölk"], lang: "sv" };

  it("accepts a valid request", () => {
    expect(translateRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a language that is not in our list", () => {
    const result = translateRequestSchema.safeParse({ ...valid, lang: "de" });

    expect(result.success).toBe(false);
  });

  it("rejects a missing language", () => {
    const result = translateRequestSchema.safeParse({ names: valid.names });

    expect(result.success).toBe(false);
  });

  it("rejects an empty list and a list that is too long", () => {
    expect(translateRequestSchema.safeParse({ ...valid, names: [] }).success).toBe(
      false,
    );
    const tooMany = Array.from({ length: MAX_INGREDIENTS + 1 }, (_, i) => `item${i}`);
    expect(
      translateRequestSchema.safeParse({ ...valid, names: tooMany }).success,
    ).toBe(false);
  });

  it("rejects a name that is too long or only spaces", () => {
    const tooLong = "a".repeat(MAX_INGREDIENT_LENGTH + 1);
    expect(
      translateRequestSchema.safeParse({ ...valid, names: [tooLong] }).success,
    ).toBe(false);
    expect(
      translateRequestSchema.safeParse({ ...valid, names: ["   "] }).success,
    ).toBe(false);
  });
});

describe("translatedIngredientsSchema", () => {
  it("accepts a list of names and trims them", () => {
    const result = translatedIngredientsSchema.safeParse({
      names: [" tomat ", "mjölk"],
    });

    expect(result.success).toBe(true);
    expect(result.data?.names).toEqual(["tomat", "mjölk"]);
  });

  it("rejects an empty name, so nothing blank is saved", () => {
    const result = translatedIngredientsSchema.safeParse({ names: ["tomat", ""] });

    expect(result.success).toBe(false);
  });

  it("rejects a name longer than the database allows", () => {
    const tooLong = "a".repeat(MAX_INGREDIENT_LENGTH + 1);
    const result = translatedIngredientsSchema.safeParse({ names: [tooLong] });

    expect(result.success).toBe(false);
  });

  it("rejects an answer without the names list", () => {
    expect(translatedIngredientsSchema.safeParse({}).success).toBe(false);
  });
});
