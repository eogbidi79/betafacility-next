import type { RentalListing } from "@prisma/client";

export type Photos = {
  livingRoom: string[];
  bedroom: string[];
  toiletBathroom: string[];
  kitchen: string[];
  building: string[];
};

export type ListingDTO = {
  id: string;
  title: string;
  rentalCategory: string;
  bedroomType: string;
  totalUnits: number;
  availableUnits: number;
  state: string;
  city: string;
  area: string | null;
  address: string | null;
  price: number | null;
  rentPerYear: number | null;
  status: string;
  amenities: string[];
  photos: Photos;
  description: string | null;
  listedBy: string;
  latitude: number | null;
  longitude: number | null;
};

const EMPTY_PHOTOS: Photos = { livingRoom: [], bedroom: [], toiletBathroom: [], kitchen: [], building: [] };

export function parsePhotos(json: string): Photos {
  try {
    const p = JSON.parse(json) ?? {};
    return {
      livingRoom: Array.isArray(p.livingRoom) ? p.livingRoom : [],
      bedroom: Array.isArray(p.bedroom) ? p.bedroom : [],
      toiletBathroom: Array.isArray(p.toiletBathroom) ? p.toiletBathroom : [],
      kitchen: Array.isArray(p.kitchen) ? p.kitchen : [],
      building: Array.isArray(p.building) ? p.building : [],
    };
  } catch {
    return { ...EMPTY_PHOTOS };
  }
}

export function parseAmenities(json: string): string[] {
  try {
    const a = JSON.parse(json);
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

/** Ordered gallery: building first, then living, bedroom, kitchen, toilet. */
export function galleryPhotos(p: Photos): string[] {
  return [...p.building, ...p.livingRoom, ...p.bedroom, ...p.kitchen, ...p.toiletBathroom];
}

export function coverPhoto(p: Photos): string | null {
  return galleryPhotos(p)[0] ?? null;
}

export function toDTO(l: RentalListing): ListingDTO {
  return {
    id: l.id,
    title: l.title,
    rentalCategory: l.rentalCategory,
    bedroomType: l.bedroomType,
    totalUnits: l.totalUnits,
    availableUnits: l.availableUnits,
    state: l.state,
    city: l.city,
    area: l.area,
    address: l.address,
    price: l.price,
    rentPerYear: l.rentPerYear,
    status: l.status,
    amenities: parseAmenities(l.amenities),
    photos: parsePhotos(l.photos),
    description: l.description,
    listedBy: l.listedBy,
    latitude: l.latitude,
    longitude: l.longitude,
  };
}
