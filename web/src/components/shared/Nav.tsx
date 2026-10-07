import Link from "next/link";

import { Logo } from "@/components/shared/Logo";
import { SHOW_LOGIN_LINK } from "@/lib/access-mode";
import { getSessionEmail } from "@/lib/auth-session";
import { isAdminEmail } from "@/lib/supabase/admin";

const links = [
  { href: "/signals", label: "Live Signals" },
  { href: "/analysis", label: "Daily Analysis" },
  { href: "/calendar", label: "Economic Calendar" },
  { href: "/track-record", label: "Performance" },
  { href: "/tools", label: "Tools & EAs" },
];

const TELEGRAM_GROUP_URL = "https://t.me/kairoscommunity";

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
              <TelegramNavIcon />
              <span className="hidden sm:inline">JOIN TELEGRAM VIP</span>
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

        {/* Mobile Navigation Bar */}
        <div className="flex items-center justify-around border-t border-zinc-200 bg-white/95 px-2 py-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center px-3 py-1 text-xs font-semibold text-zinc-600 hover:text-zinc-950"
            >
              <span>{l.label}</span>
            </Link>
          ))}
        </div>
      </header>
    </div>
  );
}

function TelegramNavIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="text-white">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}
