import type { Locale } from "./config";
import { commonMessages } from "./messages/common";
import { landingMessages } from "./messages/landing";
import { tradingMessages } from "./messages/trading";
import { adminMessages } from "./messages/admin";

export type TranslationValues = Record<string, string | number>;

export const khmerMessages: Readonly<Record<string, string>> = {
  ...adminMessages,
  ...tradingMessages,
  ...landingMessages,
  ...commonMessages,
};

/** English source phrases remain the fallback for user-authored/live content. */
export function translate(locale: Locale, message: string, values?: TranslationValues): string {
  const key = message.replace(/\s+/g, " ").trim();
  const translated = locale === "km" && Object.prototype.hasOwnProperty.call(khmerMessages, key)
    ? khmerMessages[key]
    : undefined;
  const text = translated === undefined
    ? message
    : `${message.match(/^\s*/)?.[0] ?? ""}${translated}${message.match(/\s*$/)?.[0] ?? ""}`;

  return values
    ? text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
        Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : placeholder,
      )
    : text;
}

export function createTranslator(locale: Locale) {
  return (message: string, values?: TranslationValues) => translate(locale, message, values);
}
