import { describe, it, expect } from "vitest";
import { formatMoney } from "./currency";

describe("formatMoney", () => {
  it("formats NGN with the naira symbol and no decimals", () => {
    const out = formatMoney(2500000, "NGN");
    expect(out).toContain("2,500,000");
    expect(out).toMatch(/₦|NGN/);
    expect(out).not.toContain(".00");
  });

  it("formats CAD distinctly from NGN", () => {
    const cad = formatMoney(1500, "CAD");
    const ngn = formatMoney(1500, "NGN");
    expect(cad).toContain("1,500");
    expect(cad).not.toBe(ngn); // different currency symbol
  });

  it("defaults to NGN when no currency is given", () => {
    expect(formatMoney(1000)).toBe(formatMoney(1000, "NGN"));
  });

  it("does not throw on an unknown currency", () => {
    expect(() => formatMoney(1000, "ZZZ")).not.toThrow();
  });
});
