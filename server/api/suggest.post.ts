import Anthropic from "@anthropic-ai/sdk";
import { recipeSchema } from "#shared/schemas/recipe";
import { ALLERGENS } from "#shared/allergens";
import { SURPRISE } from "#shared/cuisines";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);
  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  const wish =
    body.cuisine === SURPRISE
      ? 'a surprising dish from any cuisine in the world (you choose, and put the cuisine you chose in "cuisine")'
      : `${body.cuisine} food`;

  const message = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `I want to cook ${wish}. Answer in English.
      Use metric units: grams, deciliters, tablespoons, teaspoons. ingredients: ${body.ingredients.join(", ")}.
      Respond with JSON only, no other text.
      Do not wrap the JSON in markdown code fences.
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
