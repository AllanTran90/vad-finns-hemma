import Anthropic from "@anthropic-ai/sdk";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);

  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  const message = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `I want to cook ${body.cuisine} food. Answer in English.
      Use metric units: grams, deciliters, tablespoons, teaspoons. ingredients: ${body.ingredients.join(", ")}.
      Respond with JSON only, no other text.
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

  return { received: body, answer: message.content };
});
