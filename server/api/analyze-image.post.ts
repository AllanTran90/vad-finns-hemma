import { detectedIngredientsSchema } from "#shared/schemas/detectedIngredients";
import { analyzeRequestSchema } from "#shared/schemas/analyzeRequest";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  // Checks the image type and size (and the language) before Claude is called.
  const body = await readValidBody(
    event,
    analyzeRequestSchema,
    "Please send a JPEG, PNG or WebP image (max about 1.5 MB).",
  );

  await requireQuota(event, user.is_anonymous === true);

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
        // Claude used to list food that was not in the photo. A rule works better
        // when Claude knows why, so the prompt says that a missing item is cheap
        // (the user adds it) but a wrong one is not (it ends up in a recipe).
        text: `List the food ingredients you can see in this photo.
      Use simple, singular ${language} names, for example ${example}.

      The user checks your list and can easily add what you missed, but a wrong
      item can end up in a recipe. So when you are unsure, leave it out.
      - Only include food you can clearly see. Do not guess what is hidden or
        behind other things.
      - Do not add food just because it often goes with what you see (for
        example butter because there is bread).
      - For packages, only name the food if the label or the content shows what
        it is. Skip packages you cannot identify.
      - Skip things that are not food, like plates, bags and containers.
      If you see no food, answer with an empty list.`,
      },
    ],
    detectedIngredientsSchema,
    "Could not read the photo. Please try again.",
  );
});
