import { describe, expect, test } from "vitest";
import { postSchema } from "./postSchema";

describe("postSchema", () => {
    test("aceepts valid post data", () => {
        const result = postSchema.safeParse({
            content: "Hello CampusPulse",
            imageUrl: "https://example.com/image.jpg",
            isAnonymous: true,
        })
        expect(result.success).toBe(true);
    });
  test("rejects invalid isAnonymous type", () => {
    const result = postSchema.safeParse({
      content: "Hello CampusPulse",
      imageUrl: "",
      isAnonymous: "yes",
    });

    expect(result.success).toBe(false);
  });
});