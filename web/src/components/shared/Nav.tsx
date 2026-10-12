import Link from "next/link";

import { Logo } from "@/components/shared/Logo";
import { TelegramIcon } from "@/components/shared/TelegramIcon";
import { SHOW_LOGIN_LINK } from "@/lib/access-mode";
import { getSessionEmail } from "@/lib/auth-session";
import { TELEGRAM_GROUP_URL } from "@/lib/constants";
import { isAdminEmail } from "@/lib/supabase/admin";

const links = [
  { href: "/signals", label: "Live Signals" },
  { href: "/analysis", label: "Daily Analysis" },
  { href: "/calendar", label: "Economic Calendar" },
  { href: "/track-record", label: "Performance" },
  { href: "/tools", label: "Tools & EAs" },
];

export async function Nav() {
  const email = await getSessionEmail();

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* 1. Institutional Risk Disclaimer Marquee Strip */}
      <div
        className="warn-marquee border-b border-amber-200/80 bg-amber-50/95 py-1.5 text-amber-900 backdrop-blur-md overflow-hidden"
        role="region"
        aria-label="Risk Disclaimer"
      >
        <div className="warn-marquee-track flex items-center">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-center gap-2.5 pr-12 text-[11px] font-mono whitespace-nowrap"
              aria-hidden={copy === 1}
            >
              <span className="inline-flex items-center gap-1 rounded bg-amber-200/80 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-950 border border-amber-300">
                ⚠ RISK DISCLAIMER
              </span>
              <span className="text-amber-950 font-semibold">
                Trading CFDs, Forex, Gold & Crypto carries significant risk of capital loss.
              </span>
              <span className="text-amber-400">•</span>
              <span className="text-amber-900">
                All signals, algorithms, and quantitative models on Kiaros are strictly for educational & research purposes only — not financial advice.
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main Glass Navbar (Gray & Black) */}
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl supports-backdrop-filter:bg-white/80 transition-colors">
        <div className="page-container flex h-16 items-center justify-between">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                prefetch
                className="group relative flex items-center rounded-lg px-3.5 py-2 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-950"
              >
                <span>{l.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Telegram Syndicate VIP Link */}
            <a
              href={TELEGRAM_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3.5 py-1.5 font-mono text-xs font-bold text-white transition-all hover:bg-zinc-800 shadow-sm"
            >
              <TelegramIcon size={14} />
              <span className="hidden sm:inline">JOIN TELEGRAM</span>
              <span className="sm:hidden">TELEGRAM</span>
              <span className="rounded bg-zinc-800 px-1 py-0.2 font-mono text-[9px] text-zinc-200">
                FREE
              </span>
            </a>

            {email && isAdminEmail(email) ? (
              <Link href="/admin" className="btn-secondary py-1.5! px-3! text-xs!">
                Admin Console
              </Link>
            ) : null}

            {!email && SHOW_LOGIN_LINK ? (
              <Link href="/login" className="btn-secondary py-1.5! px-3! text-xs!">
                Sign In
              </Link>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation Bar - Horizontally Scrollable Pill Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none border-t border-zinc-200/90 bg-white/95 px-3 py-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 flex items-center rounded-lg px-3 py-1 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 whitespace-nowrap active:bg-zinc-200"
            >
              <span>{l.label}</span>
            </Link>
          ))}
        </div>
      </header>
    </div>
  );
}
