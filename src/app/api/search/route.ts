import { ok, fail, serverError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/observability";
import { searchAll, totalHits } from "@/lib/search";

export const runtime = "nodejs";

// Unified search endpoint. Uses Meilisearch when configured (see lib/search),
// otherwise falls back to Postgres. Returns the standard { data } envelope.
export async function GET(req: Request) {
  const limited = rateLimit(req, "search", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return fail("Query must be at least 2 characters", 400);

  try {
    const groups = await searchAll(q);
    return ok({ query: q, total: totalHits(groups), groups });
  } catch (err) {
    captureError(err, { route: "search", q });
    return serverError();
  }
}
