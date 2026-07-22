// Client-side image handling for the admin photo uploader.
// Order of preference:
//   1) Cloudflare R2 via /api/upload (server-side, if configured)
//   2) Cloudinary unsigned (client, if configured)
//   3) Inline compressed data URL (always works, zero setup)

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
export const cloudinaryConfigured = Boolean(CLOUD && PRESET);

/** Downscale + JPEG-compress a file to a Blob. */
async function compress(file: File, max = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("compress failed"))), "image/jpeg", quality),
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function uploadToR2(blob: Blob): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) return null; // 501 = not configured → fall through
  const json = await res.json();
  return (json.url as string) ?? null;
}

async function uploadToCloudinary(blob: Blob): Promise<string> {
  const fd = new FormData();
  fd.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
  fd.append("upload_preset", PRESET as string);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const json = await res.json();
  return json.secure_url as string;
}

export async function processImage(file: File): Promise<string> {
  let blob: Blob;
  try {
    blob = await compress(file);
  } catch {
    blob = file;
  }

  // 1) Cloudflare R2 (server)
  try {
    const url = await uploadToR2(blob);
    if (url) return url;
  } catch {
    /* fall through */
  }

  // 2) Cloudinary (client)
  if (cloudinaryConfigured) {
    try {
      return await uploadToCloudinary(blob);
    } catch {
      /* fall through */
    }
  }

  // 3) Inline
  return blobToDataUrl(blob);
}
