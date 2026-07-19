import { describe, it, expect } from "vitest";
import { makeReference } from "./reference";

describe("makeReference", () => {
  it("prefixes and produces an 8-char code", () => {
    const ref = makeReference("BKG");
    expect(ref).toMatch(/^BKG-[A-Z2-9]{8}$/);
  });

  it("avoids ambiguous characters (0, 1, I, O)", () => {
    for (let i = 0; i < 200; i++) {
      const code = makeReference("X").split("-")[1];
      expect(code).not.toMatch(/[01IO]/);
    }
  });

  it("is reasonably unique across calls", () => {
    const set = new Set(Array.from({ length: 500 }, () => makeReference("BKG")));
    expect(set.size).toBe(500);
  });
});
