"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Signals", match: "signals" },
] as const;

export function DashboardNav({
  showAdmin,
}: {
  showAdmin: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {links.map((l) => {
        const active =
          l.match === "signals"
            ? pathname === "/dashboard" || pathname.startsWith("/dashboard?")
            : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`nav-item ${active ? "nav-item-active" : ""}`}
          >
            <ChartIcon />
            {l.label}
          </Link>
        );
      })}
      {showAdmin ? (
        <>
          <Link
            href="/admin/analysis"
            className={`nav-item ${
              pathname.startsWith("/admin/analysis") ? "nav-item-active" : ""
            }`}
          >
            <DocumentIcon />
            Daily Analysis
          </Link>
          <Link
            href="/admin"
            className={`nav-item ${
              pathname === "/admin" || (pathname.startsWith("/admin") && !pathname.startsWith("/admin/analysis"))
                ? "nav-item-active"
                : ""
            }`}
          >
            <GearIcon />
            Admin Panel
          </Link>
        </>
      ) : null}
    </nav>
  );
}

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M7 16l4-8 4 5 5-9" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
