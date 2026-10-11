import { timingSafeEqual } from "crypto";

function safeTimingCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Shared-secret auth for webhook/cron routes (web/src/app/api/**\/route.ts).
 * Checks `Authorization: Bearer <secret>`; `allowQuerySecret` additionally
 * accepts `?secret=` in the URL, for callers (cron-job.org) that can't set
 * custom headers. */
export function authorizedBySecret(
  request: Request,
  envVarName: string,
  opts: { allowQuerySecret?: boolean } = {},
): boolean {
  const secret = process.env[envVarName]?.trim();
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (header && safeTimingCompare(header, `Bearer ${secret}`)) return true;

  if (opts.allowQuerySecret) {
    const querySecret = new URL(request.url).searchParams.get("secret");
    if (querySecret && safeTimingCompare(querySecret, secret)) return true;
  }
  return false;
}
