// How the dish should feel: everyday home cooking, or a bistro dish.
// Not saved in the database, the user picks it each time.
export const STYLES = ["home", "bistro"] as const;

export type Style = (typeof STYLES)[number];
