import "server-only";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 (S3-compatible) image storage.
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET;
// Public base URL for the bucket (r2.dev domain or a custom Cloudflare domain).
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

export const r2Configured = Boolean(ACCOUNT_ID && ACCESS_KEY && SECRET_KEY && BUCKET && PUBLIC_URL);

let client: S3Client | null = null;
function r2(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: ACCESS_KEY as string, secretAccessKey: SECRET_KEY as string },
    });
  }
  return client;
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function uploadToR2(buffer: Buffer, contentType: string): Promise<string> {
  const ext = EXT[contentType] ?? "jpg";
  const key = `rentals/${crypto.randomUUID()}.${ext}`;
  await r2().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${PUBLIC_URL}/${key}`;
}

/** Best-effort delete of an object we previously stored (by its public URL). */
export async function deleteFromR2(url: string): Promise<void> {
  if (!r2Configured || !url.startsWith(PUBLIC_URL)) return;
  const key = url.slice(PUBLIC_URL.length + 1);
  try {
    await r2().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch {
    /* ignore */
  }
}
