import { describe, it, expect } from "vitest";
import { cn, formatNaira, formatNumber } from "./utils";

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cn("a", false, "b", undefined, null, "c")).toBe("a b c");
  });
});

describe("formatNaira", () => {
  it("formats with the naira symbol and no decimals", () => {
    const out = formatNaira(70000);
    expect(out).toContain("70,000");
    expect(out).toMatch(/[₦N]/); // ₦ or NGN depending on ICU
  });
});

describe("formatNumber", () => {
  it("adds thousands separators", () => {
    expect(formatNumber(2847)).toBe("2,847");
  });
});
