import { describe, it, expect } from "vitest";
import { buildPropertyWhere } from "./property-search";

// Small helper: the builder always wraps conditions in an AND array.
function conds(where: ReturnType<typeof buildPropertyWhere>) {
  return (where.AND as Record<string, unknown>[]) ?? [];
}

describe("buildPropertyWhere", () => {
  it("always constrains to active listings", () => {
    expect(conds(buildPropertyWhere({}))).toContainEqual({ active: true });
  });

  it("ignores 'all' and empty filter values", () => {
    const c = conds(buildPropertyWhere({ country: "all", city: "", region: undefined }));
    expect(c).toHaveLength(1); // only { active: true }
  });

  it("maps location + type filters to columns", () => {
    const c = conds(buildPropertyWhere({ country: "Canada", region: "Ontario", city: "Toronto", category: "Sale" }));
    expect(c).toContainEqual({ country: "Canada" });
    expect(c).toContainEqual({ state: "Ontario" });
    expect(c).toContainEqual({ city: "Toronto" });
    expect(c).toContainEqual({ rentalCategory: "Sale" });
  });

  it("only adds boolean amenity filters when true", () => {
    expect(conds(buildPropertyWhere({ furnished: false }))).toHaveLength(1);
    expect(conds(buildPropertyWhere({ furnished: true }))).toContainEqual({ furnished: true });
  });

  it("builds an effective-price range across rentPerYear and price", () => {
    const c = conds(buildPropertyWhere({ minPrice: 100, maxPrice: 500 }));
    const priceCond = c.find((x) => "OR" in x) as { OR: unknown[] };
    expect(priceCond).toBeTruthy();
    expect(priceCond.OR).toEqual([
      { rentPerYear: { gte: 100, lte: 500 } },
      { AND: [{ rentPerYear: null }, { price: { gte: 100, lte: 500 } }] },
    ]);
  });

  it("supports an open-ended (min only) price range", () => {
    const c = conds(buildPropertyWhere({ minPrice: 200 }));
    const priceCond = c.find((x) => "OR" in x) as { OR: [{ rentPerYear: object }] };
    expect(priceCond.OR[0]).toEqual({ rentPerYear: { gte: 200 } });
  });
});
