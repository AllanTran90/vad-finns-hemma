import { describe, expect, it } from "vitest";
import { checkIngredientName } from "../shared/ingredientName";
import { MAX_INGREDIENTS, MAX_INGREDIENT_LENGTH } from "../shared/limits";

describe("checkIngredientName", () => {
  it("accepts a new name", () => {
    expect(checkIngredientName("tomato", ["pasta"])).toBeNull();
  });

  it("rejects an empty name, also when it is only spaces", () => {
    expect(checkIngredientName("   ", [])).toEqual({
      key: "pantry.errorEmpty",
    });
  });

  it("rejects a name that is already there, whatever the case", () => {
    expect(checkIngredientName("Tomato", ["tomato"])).toEqual({
      key: "pantry.errorDuplicate",
    });
  });

  it("accepts a name of exactly the max length", () => {
    const name = "a".repeat(MAX_INGREDIENT_LENGTH);

    expect(checkIngredientName(name, [])).toBeNull();
  });

  it("rejects a name that is one character too long", () => {
    const name = "a".repeat(MAX_INGREDIENT_LENGTH + 1);

    expect(checkIngredientName(name, [])).toEqual({
      key: "pantry.errorTooLong",
      params: { max: MAX_INGREDIENT_LENGTH },
    });
  });

  it("rejects a new name when the pantry is full", () => {
    const full = Array.from({ length: MAX_INGREDIENTS }, (_, i) => `item ${i}`);

    expect(checkIngredientName("tomato", full)).toEqual({
      key: "pantry.errorFull",
      params: { max: MAX_INGREDIENTS },
    });
  });
});
