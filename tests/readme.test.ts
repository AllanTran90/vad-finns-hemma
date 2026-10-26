import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The README contains a copy of supabase/schema.sql, so that someone can copy and
// paste it straight from the setup guide. This test fails if the two drift apart.
describe("README setup guide", () => {
  it("contains exactly the SQL from supabase/schema.sql", () => {
    const readme = readFileSync("README.md", "utf8");
    const schema = readFileSync("supabase/schema.sql", "utf8").trim();

    const block = readme.match(/```sql\n([\s\S]*?)\n```/);

    expect(block, "README has no ```sql block").not.toBeNull();
    expect(block![1]!.trim()).toBe(schema);
  });
});
