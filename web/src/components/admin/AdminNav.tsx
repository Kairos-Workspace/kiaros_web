"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
  href: string;
  label: string;
  badge?: string;
  icon: (active: boolean) => React.ReactNode;
};

const SECTIONS: { group: string; links: NavLink[] }[] = [
  {
    group: "CORE TELEMETRY",
    links: [
      {
        href: "/admin",
        label: "Overview",
        icon: (active) => (
          <svg className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        ),
      },
      {
        href: "/admin/signals",
        label: "Live Signals",
        badge: "STP",
        icon: (active) => (
          <svg className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        href: "/admin/analysis",
        label: "Daily Analysis",
        badge: "NEW",
        icon: (active) => (
          <svg className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        href: "/admin/ai",
        label: "AI Reasoning",
        icon: (active) => (
          <svg className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "OPERATIONS & ENGINE",
    links: [
      {
        href: "/admin/tools",
        label: "Tools & EAs",
        icon: (active) => (
          <svg className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        ),
      },
      {
        href: "/admin/scans",
        label: "Market Scans",
        icon: (active) => (
          <svg className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ),
      },
      {
        href: "/admin/cron",
        label: "Cron Automation",
        icon: (active) => (
          <svg className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        href: "/admin/users",
        label: "User Accounts",
        icon: (active) => (
          <svg className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-4 px-2">
      {SECTIONS.map((sec) => (
        <div key={sec.group}>
          <p className="px-2.5 pb-1.5 font-mono text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
            {sec.group}
          </p>
          <div className="flex flex-col gap-0.5">
            {sec.links.map((l) => {
              const active =
                l.href === "/admin"
                  ? pathname === "/admin" || pathname.startsWith("/admin/calendar")
                  : pathname.startsWith(l.href);

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {l.icon(active)}
                    <span>{l.label}</span>
                  </div>

                  {l.badge ? (
                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold ${
                        active
                          ? "bg-zinc-800 text-zinc-200"
                          : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200 group-hover:text-zinc-900"
                      }`}
                    >
                      {l.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
