import { intlLocale, type Locale } from "@/lib/i18n/config";

// Prices: thousands separators; fewer decimals for large numbers.
export function formatPrice(value: number): string {
  const decimals = Math.abs(value) >= 1000 ? 0 : 2;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Display label for stored timeframe / lane ids. */
export function formatTimeframe(timeframe: string): string {
  if (timeframe === "bbma") return "BBMA";
  if (timeframe === "smc") return "SMC";
  if (timeframe === "floor") return "Floor";
  return timeframe;
}

// Absolute timestamp; "never" for null.
export function formatDateTime(iso: string | null, locale: Locale = "en"): string {
  if (!iso) return locale === "km" ? "មិនធ្លាប់មាន" : "never";
  return new Date(iso).toLocaleString(intlLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Relative time from an ISO timestamp.
export function formatRelativeTime(iso: string, now: Date = new Date(), locale: Locale = "en"): string {
  const then = new Date(iso);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (Number.isNaN(seconds) || seconds < 60) return locale === "km" ? "មុននេះបន្តិច" : "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return locale === "km" ? `${minutes} នាទីមុន` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return locale === "km" ? `${hours} ម៉ោងមុន` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return locale === "km" ? `${days} ថ្ងៃមុន` : `${days}d ago`;
  return then.toLocaleDateString(intlLocale(locale), { month: "short", day: "numeric", year: "numeric" });
}

/** Escape HTML special characters for safe inclusion in Telegram HTML messages. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

