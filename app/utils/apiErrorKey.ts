import type { MessageKey } from "#shared/i18n";

// Picks the right error text for a failed call to our own server, so every
// composable gives the same message for the same problem.
// `fallback` is the text for "something else went wrong" in that feature.
export function apiErrorKey(error: unknown, fallback: MessageKey): MessageKey {
  const status = (error as { statusCode?: number }).statusCode;

  if (status === 401) {
    return "error.sessionExpired";
  }
  if (status === 429) {
    return "error.limit";
  }
  // Our server says Claude is overloaded or down (see server/utils/askClaude.ts).
  if (status === 503) {
    return "error.aiBusy";
  }
  // No answer from the server at all, and the browser says it is offline.
  if (
    !status &&
    typeof navigator !== "undefined" &&
    navigator.onLine === false
  ) {
    return "error.offline";
  }
  return fallback;
}
