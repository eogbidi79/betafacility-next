import { r2Configured, uploadToR2 } from "@/lib/r2";
import { ok, fail, serverError } from "@/lib/api";
import { getActor } from "@/lib/authz";
import { canManage } from "@/lib/rbac";
import { captureError } from "@/lib/observability";

export const runtime = "nodejs";

// Per-type size caps. Images, plus documents/floor-plans (PDF).
const MB = 1024 * 1024;
function limitFor(type: string): number | null {
  if (type.startsWith("image/")) return 8 * MB;
  if (type === "application/pdf") return 15 * MB;
  return null; // unsupported type
}

export async function POST(req: Request) {
  const actor = await getActor();
  if (!canManage(actor?.role)) return fail("Forbidden", 403);
  if (!r2Configured) {
    // Signals the client to fall back to inline/Cloudinary storage.
    return fail("Storage not configured", 501);
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return fail("No file", 400);

  const limit = limitFor(file.type);
  if (limit === null) return fail("Unsupported file type (images or PDF only)", 400);
  if (file.size > limit) return fail(`File too large (max ${Math.round(limit / MB)}MB)`, 413);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(buffer, file.type);
    return ok({ url });
  } catch (err) {
    captureError(err, { route: "upload" });
    return serverError("Upload failed");
  }
}
