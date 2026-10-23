import Anthropic from "@anthropic-ai/sdk";
import { detectedIngredientsSchema } from "#shared/schemas/detectedIngredients";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body?.image || !ALLOWED_TYPES.includes(body.mediaType)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Please send a JPEG, PNG or WebP image.",
    });
  }

  const config = useRuntimeConfig(event);
  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  const message = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: body.mediaType,
              data: body.image,
            },
          },
          {
            type: "text",
            text: `List the food ingredients you can see in this photo.
      Use simple, singular English names, for example "tomato" and "milk".
      Only include food you can clearly see. Do not guess what is hidden.
      Respond with JSON only, no other text.
      Do not wrap the JSON in markdown code fences.
      Use exactly this format:
      { "ingredients": ["...", "..."] }
      If you see no food, respond with { "ingredients": [] }`,
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");

  let detected;
  try {
    detected = JSON.parse(textBlock?.text ?? "");
  } catch (error) {
    console.log("JSON parse error:", error);
    console.log("Raw text from Claude:", textBlock?.text);
    throw createError({
      statusCode: 502,
      statusMessage: "Could not read the photo. Please try again.",
    });
  }

  const result = detectedIngredientsSchema.safeParse(detected);

  if (!result.success) {
    console.log("Zod error", result.error);
    throw createError({
      statusCode: 502,
      statusMessage: "Could not read the photo. Please try again.",
    });
  }

  return result.data;
});
