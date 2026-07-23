import { r2Configured, uploadToR2 } from "@/lib/r2";
import { ok, fail, serverError } from "@/lib/api";
import { getActor } from "@/lib/authz";
import { canManage } from "@/lib/rbac";
import { captureError } from "@/lib/observability";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB per image

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
  if (!file.type.startsWith("image/")) return fail("Not an image", 400);
  if (file.size > MAX_BYTES) return fail("Image too large (max 8MB)", 413);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(buffer, file.type);
    return ok({ url });
  } catch (err) {
    captureError(err, { route: "upload" });
    return serverError("Upload failed");
  }
}
