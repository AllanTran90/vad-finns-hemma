export const CUISINES = [
  "Swedish",
  "Chinese",
  "Vietnamese",
  "Japanese",
  "French",
  "Spanish",
  "Korean",
  "Italian",
] as const;
//as const lockes the list.

export type Cuisine = (typeof CUISINES)[number];

// Special choice: we pick a random cuisine from the list above.
export const SURPRISE = "Surprise me";

export function pickRandomCuisine() {
  // The index is always valid, but TypeScript cannot know that, so we add a fallback.
  return CUISINES[Math.floor(Math.random() * CUISINES.length)] ?? CUISINES[0];
}
