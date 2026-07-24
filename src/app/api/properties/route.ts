import { ok, serverError, parsePageParams } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/observability";
import { searchProperties, type PropertyFilters } from "@/lib/property-search";

export const runtime = "nodejs";

// Phase 1 search: Postgres-filtered, indexed, paginated property browse.
export async function GET(req: Request) {
  const limited = rateLimit(req, "properties", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const sp = new URL(req.url).searchParams;
  const num = (k: string) => {
    const v = sp.get(k);
    return v != null && v !== "" ? Number(v) : undefined;
  };
  const bool = (k: string) => sp.get(k) === "true" || sp.get(k) === "1";

  const filters: PropertyFilters = {
    country: sp.get("country") ?? undefined,
    region: sp.get("region") ?? undefined,
    city: sp.get("city") ?? undefined,
    category: sp.get("category") ?? undefined,
    propertyType: sp.get("propertyType") ?? undefined,
    bedroom: sp.get("bedroom") ?? undefined,
    status: sp.get("status") ?? undefined,
    listedBy: sp.get("listedBy") ?? undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    furnished: bool("furnished"),
    parking: bool("parking"),
    pet: bool("pet"),
  };

  const { page, limit } = parsePageParams(req, { defaultLimit: 9, maxLimit: 50 });

  try {
    const result = await searchProperties(filters, { page, limit });
    return ok(result);
  } catch (err) {
    captureError(err, { route: "properties" });
    return serverError();
  }
}
