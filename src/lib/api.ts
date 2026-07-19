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

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function serverError(message = "Something went wrong") {
  return NextResponse.json({ error: message }, { status: 500 });
}
