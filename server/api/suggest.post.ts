import Anthropic from "@anthropic-ai/sdk";
import { recipeSchema } from "#shared/schemas/recipe";
import { ALLERGENS } from "#shared/allergens";
import type { Diet } from "#shared/diets";

const KNOWN_ALLERGENS: readonly string[] = ALLERGENS;

// What each diet means, written as a rule for the AI. "none" has no rule.
const DIET_RULES: Record<Diet, string> = {
  none: "",
  pescatarian: "The recipe must be pescatarian: no meat and no poultry. Fish, seafood, dairy and eggs are allowed.",
  lacto_ovo_vegetarian: "The recipe must be vegetarian: no meat, poultry, fish or seafood. Dairy and eggs are allowed.",
  lacto_vegetarian: "The recipe must be lacto-vegetarian: no meat, poultry, fish, seafood or eggs. Dairy is allowed.",
  ovo_vegetarian: "The recipe must be ovo-vegetarian: no meat, poultry, fish, seafood or dairy. Eggs are allowed.",
  vegan: "The recipe must be vegan: no meat, poultry, fish, seafood, dairy, eggs or honey.",
};

export default defineEventHandler(async (event) => {
  await requireUser(event);

  const body = await readBody(event);
  const config = useRuntimeConfig(event);
  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  // Only "sv" switches language; anything else falls back to English.
  const language = body.lang === "sv" ? "Swedish" : "English";

  const wish = `${body.cuisine} food`;

  // Only allow values from our own list, so nobody can sneak text into the prompt.
  const avoid: string[] = Array.isArray(body.avoid)
    ? body.avoid.filter((name: unknown) => KNOWN_ALLERGENS.includes(name as string))
    : [];
  // Same idea for the diet: only a known key is used, never the text itself.
  const dietRule = DIET_RULES[body.diet as Diet] ?? "";
  const avoidSentence = avoid.length
    ? `The recipe must NOT contain these allergens: ${avoid.join(", ")}. Choose other ingredients instead.`
    : "";

  const message = await client.messages.create({
    model: "claude-haiku-5-5",
    // The model may "think" before it answers, and the thinking also uses tokens.
    // With diet and allergy rules the answer can get cut off if this is too low.
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `I want to cook ${wish}. Answer in ${language}.
      ${avoidSentence}
      ${dietRule}
      Use metric units: grams, deciliters, tablespoons, teaspoons. ingredients: ${body.ingredients.join(", ")}.
      Respond with JSON only, no other text.
      Do not wrap the JSON in markdown code fences.
      Keep the JSON keys and the allergen values exactly as written (in English).
      For "allergens", only use values from this list: ${ALLERGENS.join(", ")}
      Use exactly this format:
      {
        "name": "...",
        "ingredients": ["150 g flour", "..."],
        "instructions": ["...", "..."],
        "cuisine": "...",
        "kid_friendly": true,
        "allergens": [],
        "cook_time_minutes": 30
}
`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");

  let recipe;
  try {
    recipe = JSON.parse(textBlock?.text ?? "");
  } catch (error) {
    console.log("JSON parse error:", error);
    console.log("Raw text from Claude:", textBlock?.text);
    console.log("Stop reason:", message.stop_reason);
    throw createError({
      statusCode: 502,
      statusMessage: "Could not get a valid recipe. Please try again.",
    });
  }

  const result = recipeSchema.safeParse(recipe);

  if (!result.success) {
    console.log("Zod error", result.error);
    throw createError({
      statusCode: 502,
      statusMessage: "Could not get a valid recipe. Please try again.",
    });
  }

  return result.data;
});
