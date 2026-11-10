"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { formatRelativeTime } from "@/lib/format";
import { relativeTime } from "@/lib/relative-time";

type RelativeTimeProps = {
  iso: string;
  /** Coarser buckets (just now / Nh / Nd) used by track-record. */
  coarse?: boolean;
  className?: string;
};

/** Deterministic SSR/first-paint label (no locale / timezone drift). */
function stableDate(iso: string): string {
  const value = Date.parse(iso);
  if (Number.isNaN(value)) return "—";
  return new Date(value).toISOString().slice(0, 10);
}

export function RelativeTime({ iso, coarse = false, className }: RelativeTimeProps) {
  const { locale } = useTranslation();
  const [label, setLabel] = useState(() => stableDate(iso));

  useEffect(() => {
    setLabel(
      coarse
        ? relativeTime(iso, locale)
        : formatRelativeTime(iso, new Date(), locale)
    );
  }, [iso, locale, coarse]);

  return <span className={className}>{label}</span>;
}
