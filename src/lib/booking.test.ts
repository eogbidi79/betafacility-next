import { describe, it, expect } from "vitest";
import { computeNights, datesOverlap } from "./booking";

describe("computeNights", () => {
  it("counts whole nights between dates", () => {
    expect(computeNights(new Date("2026-10-01"), new Date("2026-10-04"))).toBe(3);
    expect(computeNights(new Date("2026-10-01"), new Date("2026-10-02"))).toBe(1);
  });

  it("never returns less than 1", () => {
    expect(computeNights(new Date("2026-10-01"), new Date("2026-10-01"))).toBe(1);
  });
});

describe("datesOverlap", () => {
  const a = new Date("2026-10-01");
  const b = new Date("2026-10-04");

  it("detects overlapping ranges", () => {
    expect(datesOverlap(a, b, new Date("2026-10-03"), new Date("2026-10-06"))).toBe(true);
    expect(datesOverlap(a, b, new Date("2026-09-30"), new Date("2026-10-02"))).toBe(true);
  });

  it("treats touching ranges (check-out == check-in) as non-overlapping", () => {
    // A guest checking out on the 4th and another checking in on the 4th is fine.
    expect(datesOverlap(a, b, new Date("2026-10-04"), new Date("2026-10-07"))).toBe(false);
    expect(datesOverlap(a, b, new Date("2026-09-28"), new Date("2026-10-01"))).toBe(false);
  });

  it("returns false for fully separate ranges", () => {
    expect(datesOverlap(a, b, new Date("2026-11-01"), new Date("2026-11-05"))).toBe(false);
  });
});
