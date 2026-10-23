import type { H3Event } from "h3";
import { serverSupabaseUser } from "#supabase/server";

// Stops the request with 401 unless the caller has a valid Supabase login.
// Guests (anonymous sign-ins) count as logged in, since they also get a session.
export async function requireUser(event: H3Event) {
  let user = null;
  try {
    user = await serverSupabaseUser(event);
  } catch {
    // An expired or broken token makes Supabase throw; treat it like "not logged in".
  }

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Please log in to use this.",
    });
  }

  return user;
}
