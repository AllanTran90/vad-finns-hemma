import { describe, expect, it } from "vitest";
import { analyzeRequestSchema } from "../shared/schemas/analyzeRequest";

const valid = { image: "abc123", mediaType: "image/jpeg" };

describe("analyzeRequestSchema", () => {
  it("accepts a valid request and defaults the language to English", () => {
    const result = analyzeRequestSchema.safeParse(valid);

    expect(result.success).toBe(true);
    expect(result.data?.lang).toBe("en");
  });

  it("rejects a missing or empty image", () => {
    expect(analyzeRequestSchema.safeParse({ mediaType: "image/png" }).success).toBe(false);
    expect(analyzeRequestSchema.safeParse({ ...valid, image: "" }).success).toBe(false);
  });

  it("rejects an image that is too big", () => {
    const result = analyzeRequestSchema.safeParse({
      ...valid,
      image: "a".repeat(2_000_001),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a file type that is not an image", () => {
    const result = analyzeRequestSchema.safeParse({
      ...valid,
      mediaType: "application/pdf",
    });

    expect(result.success).toBe(false);
  });
});
