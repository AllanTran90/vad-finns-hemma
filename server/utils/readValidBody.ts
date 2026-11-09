import type { H3Event } from "h3";
import type { z } from "zod";

// Reads the request body and checks it with a Zod schema. A broken body stops
// the request with 400. Shared by every route, so they all answer the same way.
//
// Not h3's own readValidatedBody: that one sends Zod's detailed error list to
// the browser. We only send a fixed, short text, and log nothing from the body.
export async function readValidBody<T extends z.ZodType>(
  event: H3Event,
  schema: T,
  message = "Invalid request.",
): Promise<z.infer<T>> {
  const parsed = schema.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: message });
  }

  return parsed.data;
}
