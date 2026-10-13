import { Storage, StorageOptions } from "@google-cloud/storage";
import fs from "fs";
import path from "path";

const projectId = process.env.GCP_PROJECT_ID || "project-d0cd5eb1-dc1d-4138-ba9";
const bucketName = process.env.GCS_BUCKET_NAME || "finhubkh-media";

let storageClient: Storage | null = null;

/**
 * Initializes and returns the Google Cloud Storage client.
 * Supports:
 * 1. GCP_CREDENTIALS json string (Service Account or Authorized User)
 * 2. GCP_CLIENT_EMAIL + GCP_PRIVATE_KEY
 * 3. GCP_CLIENT_ID + GCP_CLIENT_SECRET + GCP_REFRESH_TOKEN (OAuth / ADC)
 * 4. Local application_default_credentials.json source_credentials
 */
export function getGcsClient(): Storage {
  if (storageClient) return storageClient;

  const options: StorageOptions = { projectId };

  if (process.env.GCP_CREDENTIALS) {
    try {
      options.credentials = JSON.parse(process.env.GCP_CREDENTIALS);
    } catch (e) {
      console.error("[GCS] Failed to parse GCP_CREDENTIALS JSON:", e);
    }
  } else if (process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY) {
    options.credentials = {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  } else if (process.env.GCP_CLIENT_ID && process.env.GCP_CLIENT_SECRET && process.env.GCP_REFRESH_TOKEN) {
    options.credentials = {
      client_id: process.env.GCP_CLIENT_ID,
      client_secret: process.env.GCP_CLIENT_SECRET,
      refresh_token: process.env.GCP_REFRESH_TOKEN,
      type: "authorized_user",
    };
  } else {
    // Check local ADC for direct source_credentials to avoid cross-project impersonation
    try {
      const adcPath = path.join(
        process.env.HOME || "",
        ".config",
        "gcloud",
        "application_default_credentials.json",
      );
      if (fs.existsSync(adcPath)) {
        const adc = JSON.parse(fs.readFileSync(adcPath, "utf8"));
        if (adc.source_credentials) {
          options.credentials = {
            client_id: adc.source_credentials.client_id,
            client_secret: adc.source_credentials.client_secret,
            refresh_token: adc.source_credentials.refresh_token,
            type: "authorized_user",
          };
        }
      }
    } catch {
      // Fall through to ambient
    }
  }

  storageClient = new Storage(options);
  return storageClient;
}

export function isGcsConfigured(): boolean {
  return Boolean(bucketName);
}

export type GcsUploadResult = {
  url: string;
  key: string;
  storage: "gcs";
};

/**
 * Uploads a file buffer directly to Google Cloud Storage.
 * Generates a public HTTPS URL: https://storage.googleapis.com/<bucket>/<key>
 */
export async function uploadToGcs({
  buffer,
  originalName,
  contentType,
  folder = "analysis",
}: {
  buffer: Buffer;
  originalName: string;
  contentType?: string;
  folder?: string;
}): Promise<GcsUploadResult> {
  const storage = getGcsClient();
  const bucket = storage.bucket(bucketName);

  const extension = path.extname(originalName) || ".png";
  const cleanBase = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 30);
  const key = `${folder}/${Date.now()}-${cleanBase}${extension}`;

  const file = bucket.file(key);

  await file.save(buffer, {
    metadata: {
      contentType: contentType || "image/png",
      cacheControl: "public, max-age=31536000",
    },
    resumable: false,
  });

  const url = `https://storage.googleapis.com/${bucketName}/${key}`;

  return {
    url,
    key: `gcs:${key}`,
    storage: "gcs",
  };
}

/**
 * Deletes a file from Google Cloud Storage by key.
 */
export async function deleteFromGcs(key: string): Promise<void> {
  if (!key) return;
  const cleanKey = key.replace(/^gcs:/, "");
  try {
    const storage = getGcsClient();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(cleanKey);
    await file.delete({ ignoreNotFound: true });
  } catch (err) {
    console.error("[GCS Delete Error]:", err);
  }
}
