import type { NextConfig } from "next";

// Chart images can come from Supabase Storage or the configured GCS bucket.
// Both sources need to be allowed by next/image.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const gcsBucketName = process.env.GCS_BUCKET_NAME || "finhubkh-media";

const r2PublicHost = process.env.R2_PUBLIC_URL
  ? (() => {
      try {
        return new URL(process.env.R2_PUBLIC_URL).hostname;
      } catch {
        return undefined;
      }
    })()
  : undefined;

const nextConfig: NextConfig = {
  // Keep soft-navigated pages warm in the client router so back/forward and
  // revisiting admin tabs feel instant instead of refetching immediately.
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/**",
            },
          ]
        : []),
      ...(r2PublicHost
        ? [
            {
              hostname: r2PublicHost,
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "storage.googleapis.com",
        pathname: `/${gcsBucketName}/**`,
      },
      {
        protocol: "https" as const,
        hostname: "*.r2.dev",
      },
      {
        protocol: "https" as const,
        hostname: "*.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;
