import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { H3Event } from "h3";
import type { z } from "zod";

// Sends one message to Claude and returns the answer as data that matches `schema`.
// Shared by /api/suggest and /api/analyze-image, so both handle errors the same way.
//
// Structured outputs: we send the Zod schema along, and the API makes Claude answer
// with JSON in exactly that shape. The SDK then checks the answer with the same Zod
// schema, so we never need JSON.parse or "no markdown" rules in the prompt.
//
// `failMessage` is shown when Claude answers but the answer is unusable.
export async function askClaude<T extends z.ZodType>(
  event: H3Event,
  content: Anthropic.MessageParam["content"],
  schema: T,
  failMessage: string,
): Promise<z.infer<T>> {
  const config = useRuntimeConfig(event);
  const client = new Anthropic({
    apiKey: config.anthropicApiKey,
    // Without a timeout the SDK waits up to 10 minutes (and retries), longer than a
    // Vercel function lives. A timeout is handled below as "the AI is busy" (503).
    timeout: 60_000,
    maxRetries: 1,
  });

  let message;
  try {
    // The beta path is needed for `fallbacks`: if Opus's safety check wrongly
    // declines a request, the API tries again on another model in the same call.
    message = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      // The model may "think" before it answers, and the thinking also uses tokens.
      // With diet and allergy rules the answer can get cut off if this is too low.
      // Raised from 4000 to 8000 for Opus, since its bistro recipes are longer.
      // It is only a ceiling: we pay for the tokens used, not for the limit.
      max_tokens: 8000,
      messages: [{ role: "user", content }],
      // This model does not accept `temperature` (the API answers 400). Effort is the
      // setting we have: how much the model thinks, so also how long and how much it
      // costs. Tested on Sonnet: medium took 7 s, high 11 s and twice the tokens.
      // Opus (chosen 11 Nov) gives clearer bistro dishes, but took 14-24 s and
      // costs twice as much per token.
      output_config: { effort: "medium", format: betaZodOutputFormat(schema) },
    });
  } catch (error) {
    // Claude is overloaded (529), rate limited (429), down (5xx) or unreachable.
    // That is not the user's fault, and trying again later usually works.
    const isBusy =
      error instanceof Anthropic.APIConnectionError ||
      (error instanceof Anthropic.APIError &&
        (error.status === 429 || (error.status ?? 0) >= 500));

    console.log("Claude error:", error);
    throw createError({
      statusCode: isBusy ? 503 : 502,
      statusMessage: isBusy ? "The AI is busy. Please try again." : failMessage,
    });
  }

  // "max_tokens" means the answer was cut off, "refusal" that Claude said no.
  // Either way there is no complete answer to show.
  if (message.stop_reason !== "end_turn" || !message.parsed_output) {
    console.log(
      "Unusable answer from Claude, stop reason:",
      message.stop_reason,
    );
    throw createError({ statusCode: 502, statusMessage: failMessage });
  }

  return message.parsed_output;
}
