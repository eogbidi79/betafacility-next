import { auth } from "@/auth";
import { r2Configured, uploadToR2 } from "@/lib/r2";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB per image

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!r2Configured) {
    // Signals the client to fall back to inline/Cloudinary storage.
    return NextResponse.json({ error: "Storage not configured" }, { status: 501 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Not an image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(buffer, file.type);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("R2 upload failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
