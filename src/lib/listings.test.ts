import { describe, it, expect } from "vitest";
import { photosFromImages, imageRows, galleryPhotos, type Photos } from "./listings";
import type { PropertyImage } from "@prisma/client";

function img(partial: Partial<PropertyImage>): PropertyImage {
  return {
    id: Math.random().toString(36).slice(2),
    listingId: "L1",
    url: "",
    category: "building",
    sortOrder: 0,
    caption: null,
    createdAt: new Date(),
    ...partial,
  } as PropertyImage;
}

describe("property image normalisation", () => {
  const photos: Photos = {
    building: ["b1", "b2"],
    livingRoom: ["lr1"],
    bedroom: ["bd1"],
    kitchen: [],
    toiletBathroom: ["t1"],
  };

  it("imageRows flattens in gallery order with sequential sortOrder", () => {
    const rows = imageRows(photos, "L1");
    expect(rows.map((r) => r.url)).toEqual(["b1", "b2", "lr1", "bd1", "t1"]);
    expect(rows.map((r) => r.sortOrder)).toEqual([0, 1, 2, 3, 4]);
    expect(rows[0].category).toBe("building");
  });

  it("photosFromImages regroups by category, honouring sortOrder", () => {
    // Deliberately shuffled input.
    const rows = [
      img({ url: "b2", category: "building", sortOrder: 1 }),
      img({ url: "lr1", category: "livingRoom", sortOrder: 2 }),
      img({ url: "b1", category: "building", sortOrder: 0 }),
    ];
    const p = photosFromImages(rows);
    expect(p.building).toEqual(["b1", "b2"]);
    expect(p.livingRoom).toEqual(["lr1"]);
  });

  it("round-trips photos -> rows -> photos preserving the gallery", () => {
    const rows = imageRows(photos, "L1").map((r, i) => img({ ...r, sortOrder: i }));
    expect(galleryPhotos(photosFromImages(rows))).toEqual(galleryPhotos(photos));
  });

  it("ignores unknown categories", () => {
    const p = photosFromImages([img({ url: "x", category: "floorplan" })]);
    expect(Object.values(p).flat()).not.toContain("x");
  });
});
