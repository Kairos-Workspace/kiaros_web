import type { Locale } from "@/lib/i18n/config";

export function relativeTime(iso: string, locale: Locale = "en"): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3.6e6);
  if (!Number.isFinite(h) || h < 1) return locale === "km" ? "មុននេះបន្តិច" : "just now";
  if (h < 24) return locale === "km" ? `${h} ម៉ោងមុន` : `${h}h ago`;
  const d = Math.floor(h / 24);
  return locale === "km" ? (d === 1 ? "ម្សិលមិញ" : `${d} ថ្ងៃមុន`) : (d === 1 ? "yesterday" : `${d}d ago`);
}
