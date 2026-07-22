// Client-side image handling for the admin photo uploader.
// If Cloudinary is configured (public, unsigned), upload there and store the
// hosted URL. Otherwise, compress the image and store it inline (data URL) so
// uploads work with zero setup.

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryConfigured = Boolean(CLOUD && PRESET);

/** Downscale + JPEG-compress a file to a data URL (fallback storage). */
export async function compressToDataUrl(file: File, max = 1280, quality = 0.72): Promise<string> {
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
  return canvas.toDataURL("image/jpeg", quality);
}

async function uploadToCloudinary(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", PRESET as string);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const json = await res.json();
  return json.secure_url as string;
}

/** Returns a URL (Cloudinary) or a compressed data URL (fallback). */
export async function processImage(file: File): Promise<string> {
  if (cloudinaryConfigured) {
    try {
      return await uploadToCloudinary(file);
    } catch {
      // fall through to inline
    }
  }
  return compressToDataUrl(file);
}
