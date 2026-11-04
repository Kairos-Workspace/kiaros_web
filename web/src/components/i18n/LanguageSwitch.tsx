"use client";

import { useId } from "react";
import { useTranslation } from "./LanguageProvider";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { Dropdown, type DropdownOption } from "@/components/shared/Dropdown";

const LANGUAGE_OPTIONS: DropdownOption<Locale>[] = [
  { value: "en", label: "English", hint: "EN" },
  { value: "km", label: "ខ្មែរ", hint: "KM" },
];

export function LanguageSwitch({ className = "" }: { className?: string }) {
  const id = useId();
  const { locale, setLocale, t, isPending } = useTranslation();

  return (
    <Dropdown<Locale>
      id={id}
      value={locale}
      onChange={(nextLocale) => {
        if (isLocale(nextLocale)) {
          setLocale(nextLocale);
        }
      }}
      options={LANGUAGE_OPTIONS}
      label={t("Language")}
      size="sm"
      align="right"
      ariaBusy={isPending}
      className={`shrink-0 ${className}`}
      icon={
        <svg
          className="h-3.5 w-3.5 text-zinc-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18Z" />
        </svg>
      }
    />
  );
}
