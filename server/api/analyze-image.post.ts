import { detectedIngredientsSchema } from "#shared/schemas/detectedIngredients";
import { analyzeRequestSchema } from "#shared/schemas/analyzeRequest";

export default defineEventHandler(async (event) => {
  await requireUser(event);

  // Checks the image type and size (and the language) before Claude is called.
  const parsed = analyzeRequestSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Please send a JPEG, PNG or WebP image (max about 1.5 MB).",
    });
  }
  const body = parsed.data;

  await requireQuota(event);

  const isSwedish = body.lang === "sv";
  const language = isSwedish ? "Swedish" : "English";
  const example = isSwedish ? '"tomat" and "mjölk"' : '"tomato" and "milk"';

  return askClaude(
    event,
    [
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
      Use simple, singular ${language} names, for example ${example}.
      Only include food you can clearly see. Do not guess what is hidden.
      If you see no food, answer with an empty list.`,
      },
    ],
    detectedIngredientsSchema,
    "Could not read the photo. Please try again.",
  );
});
