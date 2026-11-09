import type { H3Event } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "#shared/database.types";

// How many Claude calls one user may make per day (recipes and photo scans together).
const DAILY_LIMIT = 30;
// Anyone can create a new guest account, so guests get less. Together with the
// Supabase limit on new guest sign-ins per IP, this caps what a stranger can cost.
const GUEST_DAILY_LIMIT = 10;

// Counts this call in the database and stops the request with 429 when the user
// has used up the day. Call it after requireUser and after validating the body,
// so broken requests do not use up the limit. See increment_usage in supabase/schema.sql.
// `isGuest` comes from the login token (is_anonymous), which the browser cannot change.
export async function requireQuota(event: H3Event, isGuest: boolean) {
  const supabase = await serverSupabaseClient<Database>(event);
  const { data, error } = await supabase.rpc("increment_usage", {
    max_per_day: isGuest ? GUEST_DAILY_LIMIT : DAILY_LIMIT,
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
