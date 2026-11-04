export const locales = ["en", "km"] as const;
export type Locale = (typeof locales)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "kiaros-language";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "km";
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function intlLocale(locale: Locale): string {
  return locale === "km" ? "km-KH" : "en-US";
}
