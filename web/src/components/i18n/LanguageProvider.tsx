"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/translate";

const LanguageContext = createContext({
  locale: DEFAULT_LOCALE,
  t: createTranslator(DEFAULT_LOCALE),
  setLocale: (_locale: Locale) => {},
  isPending: false,
});

export function LanguageProvider({ initialLocale, children }: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, updateLocale] = useState(initialLocale);
  const [isPending, startTransition] = useTransition();

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next) || next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    document.documentElement.lang = next;
    updateLocale(next);
    // Refresh Server Components in place, retaining the current route and filters.
    startTransition(() => router.refresh());
  }, [locale, router]);

  const value = useMemo(() => ({ locale, setLocale, isPending, t: createTranslator(locale) }), [locale, setLocale, isPending]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}

export const useLanguage = useTranslation;
