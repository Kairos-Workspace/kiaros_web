"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
  href: string;
  label: string;
  badge?: string;
  badgeColor?: "emerald" | "amber" | "indigo" | "zinc";
  icon: (active: boolean) => React.ReactNode;
};

const SECTIONS: { group: string; links: NavLink[] }[] = [
  {
    group: "Core Telemetry",
    links: [
      {
        href: "/admin",
        label: "Overview",
        icon: (active) => (
          <svg
            className={`h-4 w-4 shrink-0 transition-colors ${
              active ? "text-white" : "text-zinc-400 group-hover:text-zinc-700"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        ),
      },
      {
        href: "/admin/signals",
        label: "Live Signals",
        badge: "STP",
        badgeColor: "emerald",
        icon: (active) => (
          <svg
            className={`h-4 w-4 shrink-0 transition-colors ${
              active ? "text-white" : "text-zinc-400 group-hover:text-zinc-700"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ),
      },
      {
        href: "/admin/analysis",
        label: "Daily Analysis",
        badge: "NEW",
        badgeColor: "amber",
        icon: (active) => (
          <svg
            className={`h-4 w-4 shrink-0 transition-colors ${
              active ? "text-white" : "text-zinc-400 group-hover:text-zinc-700"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
        ),
      },
      {
        href: "/admin/calendar",
        label: "Economic Calendar",
        badge: "AI",
        badgeColor: "indigo",
        icon: (active) => (
          <svg
            className={`h-4 w-4 shrink-0 transition-colors ${
              active ? "text-white" : "text-zinc-400 group-hover:text-zinc-700"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
            />
          </svg>
        ),
      },
      {
        href: "/admin/ai",
        label: "AI Reasoning",
        icon: (active) => (
          <svg
            className={`h-4 w-4 shrink-0 transition-colors ${
              active ? "text-white" : "text-zinc-400 group-hover:text-zinc-700"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Operations & Engine",
    links: [
      {
        href: "/admin/tools",
        label: "Tools & EAs",
        icon: (active) => (
          <svg
            className={`h-4 w-4 shrink-0 transition-colors ${
              active ? "text-white" : "text-zinc-400 group-hover:text-zinc-700"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
            />
          </svg>
        ),
      },
      {
        href: "/admin/scans",
        label: "Market Scans",
        icon: (active) => (
          <svg
            className={`h-4 w-4 shrink-0 transition-colors ${
              active ? "text-white" : "text-zinc-400 group-hover:text-zinc-700"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
            />
          </svg>
        ),
      },
      {
        href: "/admin/cron",
        label: "Cron Automation",
        icon: (active) => (
          <svg
            className={`h-4 w-4 shrink-0 transition-colors ${
              active ? "text-white" : "text-zinc-400 group-hover:text-zinc-700"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      {
        href: "/admin/users",
        label: "User Accounts",
        icon: (active) => (
          <svg
            className={`h-4 w-4 shrink-0 transition-colors ${
              active ? "text-white" : "text-zinc-400 group-hover:text-zinc-700"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
        ),
      },
    ],
  },
];

export function AdminNav({
  orientation = "vertical",
}: {
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (orientation === "horizontal") {
    return (
      <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {SECTIONS.flatMap((s) => s.links).map((l) => {
          const active = isLinkActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              {l.icon(active)}
              <span>{l.label}</span>
              {l.badge ? (
                <span
                  className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {l.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-4 px-3">
      {SECTIONS.map((sec) => (
        <div key={sec.group}>
          <div className="px-2.5 pb-2 pt-1">
            <span className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              {sec.group}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            {sec.links.map((l) => {
              const active = isLinkActive(l.href);

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-zinc-950 text-white font-semibold shadow-xs"
                      : "text-zinc-600 hover:bg-zinc-100/90 hover:text-zinc-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {l.icon(active)}
                    <span className="truncate">{l.label}</span>
                  </div>

                  {l.badge ? (
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide transition-colors ${
                        active
                          ? "bg-white/15 text-white border border-white/20"
                          : l.badgeColor === "emerald"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 group-hover:bg-emerald-100"
                          : l.badgeColor === "amber"
                          ? "bg-amber-50 text-amber-700 border border-amber-200/80 group-hover:bg-amber-100"
                          : l.badgeColor === "indigo"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 group-hover:bg-indigo-100"
                          : "bg-zinc-100 text-zinc-600 border border-zinc-200 group-hover:bg-zinc-200"
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

