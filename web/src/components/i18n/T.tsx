"use client";

import { useTranslation } from "./LanguageProvider";
import type { TranslationValues } from "@/lib/i18n/translate";

/** A text-only boundary allows Server Components to react to language changes. */
export function T({ children, values }: { children: string; values?: TranslationValues }) {
  const { t } = useTranslation();
  return t(children, values);
}
