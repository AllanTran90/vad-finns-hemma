// The values match the check constraint in supabase/schema.sql.
export const DIETS = [
  "none",
  "pescatarian",
  "lacto_ovo_vegetarian",
  "lacto_vegetarian",
  "ovo_vegetarian",
  "vegan",
] as const;

export type Diet = (typeof DIETS)[number];
