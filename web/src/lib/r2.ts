import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "kairos-analysis";
const publicUrl = process.env.R2_PUBLIC_URL || "";

/**
 * Checks whether Cloudflare R2 credentials are fully configured in environment.
 */
export function isR2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey);
}

/**
 * Returns an S3 client connected to Cloudflare R2 if credentials exist.
 */
export function getR2Client(): S3Client | null {
  if (!isR2Configured()) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });
}

export type UploadResult = {
  url: string;
  key: string;
  storage: "r2" | "local";
};

/**
 * Uploads a chart/graph image file.
 * Uses Cloudflare R2 if credentials are provided in env;
 * otherwise gracefully falls back to local storage in public/uploads/analysis.
 */
export async function uploadAnalysisImage({
  buffer,
  originalName,
  contentType,
}: {
  buffer: Buffer;
  originalName: string;
  contentType: string;
}): Promise<UploadResult> {
  const extension = path.extname(originalName) || ".png";
  const cleanBase = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 30);
  const key = `analysis/${Date.now()}-${cleanBase}${extension}`;

  const client = getR2Client();

  // 1. Production Cloudflare R2 Upload
  if (client) {
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType || "image/png",
        }),
      );

      const normalizedBase = publicUrl
        ? publicUrl.replace(/\/+$/, "")
        : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;
      const url = `${normalizedBase}/${key}`;

      return { url, key, storage: "r2" };
    } catch (err) {
      console.error("[R2 Upload Error]:", err);
      // Fall through to local fallback if R2 fails
    }
  }

  // 2. Local Fallback (while API key is pending)
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "analysis");
  await mkdir(uploadsDir, { recursive: true });

  const localFileName = `${Date.now()}-${cleanBase}${extension}`;
  const filePath = path.join(uploadsDir, localFileName);
  await writeFile(filePath, buffer);

  return {
    url: `/uploads/analysis/${localFileName}`,
    key: `local:${localFileName}`,
    storage: "local",
  };
}

/**
 * Removes an image from Cloudflare R2 or local storage.
 */
export async function deleteAnalysisImage(key: string): Promise<void> {
  if (!key) return;

  if (key.startsWith("local:")) {
    const fileName = key.replace("local:", "");
    const filePath = path.join(process.cwd(), "public", "uploads", "analysis", fileName);
    try {
      await unlink(filePath);
    } catch {
      // Ignore if file doesn't exist
    }
    return;
  }

  const client = getR2Client();
  if (client) {
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );
    } catch (err) {
      console.error("[R2 Delete Error]:", err);
    }
  }
}
