import { describe, expect, it } from "vitest";
import { apiErrorKey } from "../app/utils/apiErrorKey";

describe("apiErrorKey", () => {
  it("maps 401 to the expired login text", () => {
    expect(apiErrorKey({ statusCode: 401 }, "recipe.error")).toBe(
      "error.sessionExpired",
    );
  });

  it("maps 429 to the daily limit text", () => {
    expect(apiErrorKey({ statusCode: 429 }, "recipe.error")).toBe(
      "error.limit",
    );
  });

  it("uses the fallback for other errors", () => {
    expect(apiErrorKey({ statusCode: 502 }, "scan.error")).toBe("scan.error");
    expect(apiErrorKey(new Error("boom"), "scan.error")).toBe("scan.error");
  });
});
