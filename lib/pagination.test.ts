import { describe, expect, test } from "vitest";
import { calculateOffset } from "./pagination";

describe("calculateOffset", () => {
  test("returns 0 for page 1", () => {
    expect(calculateOffset(1, 10)).toBe(0);
  });

  test("returns 10 for page 2 with limit 10", () => {
    expect(calculateOffset(2, 10)).toBe(10);
  });

  test("returns 6 for page 3 with limit 3", () => {
    expect(calculateOffset(3, 3)).toBe(6);
  });
});