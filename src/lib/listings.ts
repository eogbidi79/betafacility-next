import type { RentalListing, PropertyImage } from "@prisma/client";

export type Photos = {
  livingRoom: string[];
  bedroom: string[];
  toiletBathroom: string[];
  kitchen: string[];
  building: string[];
};

/** Category order used for the gallery (cover = first building photo). */
export const PHOTO_CATEGORIES: (keyof Photos)[] = [
  "building",
  "livingRoom",
  "bedroom",
  "kitchen",
  "toiletBathroom",
];

type RentalWithImages = RentalListing & { images?: PropertyImage[] };

export type ListingDTO = {
  id: string;
  title: string;
  rentalCategory: string;
  propertyType: string;
  bedroomType: string;
  bathrooms: number | null;
  totalUnits: number;
  availableUnits: number;
  country: string;
  state: string;
  city: string;
  area: string | null;
  address: string | null;
  postalCode: string | null;
  price: number | null;
  rentPerYear: number | null;
  currencyCode: string;
  status: string;
  furnished: boolean;
  petFriendly: boolean;
  parking: boolean;
  amenities: string[];
  photos: Photos;
  description: string | null;
  listedBy: string;
  featured: boolean;
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

/** Group normalised PropertyImage rows (sorted) into the Photos shape. */
export function photosFromImages(images: PropertyImage[]): Photos {
  const p: Photos = { livingRoom: [], bedroom: [], toiletBathroom: [], kitchen: [], building: [] };
  for (const img of [...images].sort((a, b) => a.sortOrder - b.sortOrder)) {
    if (img.category in p) p[img.category as keyof Photos].push(img.url);
  }
  return p;
}

/** Flatten a Photos object into PropertyImage create rows (gallery order). */
export function imageRows(photos: Photos, listingId: string) {
  const rows: { listingId: string; url: string; category: string; sortOrder: number }[] = [];
  let i = 0;
  for (const cat of PHOTO_CATEGORIES) {
    for (const url of photos[cat]) rows.push({ listingId, url, category: cat, sortOrder: i++ });
  }
  return rows;
}

export function toDTO(l: RentalWithImages): ListingDTO {
  // Prefer normalised images; fall back to the legacy JSON blob during transition.
  const photos = l.images && l.images.length > 0 ? photosFromImages(l.images) : parsePhotos(l.photos);
  return {
    id: l.id,
    title: l.title,
    rentalCategory: l.rentalCategory,
    propertyType: l.propertyType,
    bedroomType: l.bedroomType,
    bathrooms: l.bathrooms,
    totalUnits: l.totalUnits,
    availableUnits: l.availableUnits,
    country: l.country,
    state: l.state,
    city: l.city,
    area: l.area,
    address: l.address,
    postalCode: l.postalCode,
    price: l.price,
    rentPerYear: l.rentPerYear,
    currencyCode: l.currencyCode,
    status: l.status,
    furnished: l.furnished,
    petFriendly: l.petFriendly,
    parking: l.parking,
    amenities: parseAmenities(l.amenities),
    photos,
    description: l.description,
    listedBy: l.listedBy,
    featured: l.featured,
    latitude: l.latitude,
    longitude: l.longitude,
  };
}
