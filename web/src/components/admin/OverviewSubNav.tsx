"use client";

import { T } from "@/components/i18n/T";
import { useTranslation } from "@/components/i18n/LanguageProvider";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/calendar", label: "Calendar", exact: false },
];

export function OverviewSubNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <nav
      className="mt-6 flex gap-1 border-b border-line"
      aria-label={t("Overview sections")}
    >
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "border-accent text-accent"
                : "border-transparent text-slate hover:border-line hover:text-ink"
            }`}
          >
            <T>{tab.label}</T>
          </Link>
        );
      })}
    </nav>
  );
}
