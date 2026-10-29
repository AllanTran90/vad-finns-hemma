import { recipeSchema } from "#shared/schemas/recipe";
import { suggestRequestSchema } from "#shared/schemas/suggestRequest";
import type { Diet } from "#shared/diets";

// What each diet means, written as a rule for the AI. "none" has no rule.
const DIET_RULES: Record<Diet, string> = {
  none: "",
  pescatarian:
    "The recipe must be pescatarian: no meat and no poultry. Fish, seafood, dairy and eggs are allowed.",
  lacto_ovo_vegetarian:
    "The recipe must be vegetarian: no meat, poultry, fish or seafood. Dairy and eggs are allowed.",
  lacto_vegetarian:
    "The recipe must be lacto-vegetarian: no meat, poultry, fish, seafood or eggs. Dairy is allowed.",
  ovo_vegetarian:
    "The recipe must be ovo-vegetarian: no meat, poultry, fish, seafood or dairy. Eggs are allowed.",
  vegan:
    "The recipe must be vegan: no meat, poultry, fish, seafood, dairy, eggs or honey.",
};

export default defineEventHandler(async (event) => {
  await requireUser(event);

  // The schema only lets values from our own lists through, so nobody can sneak
  // text into the prompt. Anything else gives a 400 before Claude is called.
  const parsed = suggestRequestSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid request." });
  }
  const body = parsed.data;

  await requireQuota(event);

  const language = body.lang === "sv" ? "Swedish" : "English";

  const wish = `${body.cuisine} food`;

  const dietRule = DIET_RULES[body.diet];
  const avoidSentence = body.avoid.length
    ? `The recipe must NOT contain these allergens: ${body.avoid.join(", ")}. Choose other ingredients instead.`
    : "";

  // The answer's shape comes from recipeSchema (structured outputs, see askClaude),
  // so the prompt only has to explain what to cook and how to fill in the fields.
  return askClaude(
    event,
    `I want to cook ${wish}. Answer in ${language}.
      ${avoidSentence}
      ${dietRule}
      Use metric units: grams, deciliters, tablespoons, teaspoons.
      The ingredients I have at home: ${body.ingredients.join(", ")}.
      Only use these ingredients. You do not have to use all of them.
      You may also use basic staples that I did not list: salt, pepper, water, cooking oil and sugar.
      Do not add any other ingredient. If the cuisine normally needs more, choose a simpler dish that works with what I have.
      Write each ingredient with its amount, for example "150 g flour".
      In "allergens", list every allergen the recipe contains.`,
    recipeSchema,
    "Could not get a valid recipe. Please try again.",
  );
});
