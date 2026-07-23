import { NextResponse } from "next/server";
import { z } from "zod";

export async function parseJson<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<
  | { ok: true; data: z.infer<T> }
  | { ok: false; response: NextResponse }
> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Validation failed",
          issues: result.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 422 },
      ),
    };
  }

  return { ok: true, data: result.data };
}

// Consistent success envelope: { data }. Errors use { error, issues? }.
export function ok(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(error: string, status = 400, issues?: { path: string; message: string }[]) {
  return NextResponse.json(issues ? { error, issues } : { error }, { status });
}

export function serverError(message = "Something went wrong") {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Parse pagination query params. Supports `?page` (1-based) and `?cursor`
 * (opaque id) plus `?limit`, returning a normalised, clamped shape.
 */
export function parsePageParams(
  req: Request,
  { defaultLimit = 12, maxLimit = 50 }: { defaultLimit?: number; maxLimit?: number } = {},
) {
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, Math.floor(Number(sp.get("page") ?? "1")) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Math.floor(Number(sp.get("limit") ?? defaultLimit)) || defaultLimit));
  const cursor = sp.get("cursor") || undefined;
  return { page, limit, cursor, skip: (page - 1) * limit };
}
