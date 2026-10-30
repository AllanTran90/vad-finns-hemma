import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
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
    message = await client.messages.parse({
      model: "claude-haiku-5-5",
      // The model may "think" before it answers, and the thinking also uses tokens.
      // With diet and allergy rules the answer can get cut off if this is too low.
      max_tokens: 4000,
      messages: [{ role: "user", content }],
      output_config: { format: zodOutputFormat(schema) },
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
