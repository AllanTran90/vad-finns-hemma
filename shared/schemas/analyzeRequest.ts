import { z } from "zod";
import { LANGS } from "../i18n";

// What the browser is allowed to send to /api/analyze-image.
// The app resizes photos to max 1568 px (about 300-700 kB), so 2 million
// base64 characters (about 1.5 MB) is generous but still stops huge uploads.
export const analyzeRequestSchema = z.object({
  image: z.string().min(1).max(2_000_000),
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  lang: z.enum(LANGS).default("en"),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
