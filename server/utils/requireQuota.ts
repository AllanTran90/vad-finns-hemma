import type { H3Event } from "h3";
import { serverSupabaseClient } from "#supabase/server";

// How many Claude calls one user may make per day (recipes and photo scans together).
const DAILY_LIMIT = 30;

// Counts this call in the database and stops the request with 429 when the user
// has used up the day. Call it after requireUser and after validating the body,
// so broken requests do not use up the limit. See increment_usage in supabase/schema.sql.
export async function requireQuota(event: H3Event) {
  const supabase = await serverSupabaseClient(event);
  const { data, error } = await supabase.rpc("increment_usage", {
    max_per_day: DAILY_LIMIT,
  });

  if (error) {
    console.log("Usage limit error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Could not check the daily limit.",
    });
  }

  if (!data) {
    throw createError({
      statusCode: 429,
      statusMessage: "Daily limit reached. Please try again tomorrow.",
    });
  }
}
