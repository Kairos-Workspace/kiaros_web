import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const TELEGRAM_GROUP_URL = "https://t.me/kairoscommunity";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 text-zinc-600">
      {/* Institutional Telemetry Ribbon */}
      <div className="border-b border-zinc-200 bg-zinc-100/80 py-2.5 font-mono text-[11px]">
        <div className="page-container flex flex-wrap items-center justify-between gap-3 text-zinc-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>SYSTEMS 100% OPERATIONAL</span>
            </span>
            <span className="hidden text-zinc-300 sm:inline">|</span>
            <span className="hidden sm:inline">STP/ECN TICK PIPELINE: CONNECTED (12ms)</span>
            <span className="hidden text-zinc-300 md:inline">|</span>
            <span className="hidden md:inline">CORE: KIAROS ALPHA V4.2</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-zinc-500">
            <span>DISPATCH REGION: GLOBAL / MT5 SYNC</span>
          </div>
        </div>
      </div>

      <div className="page-container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-zinc-600">
              Institutional signal architecture across Gold (XAUUSD), Crypto, and Forex. 
              Engineered with algorithmic orderflow, liquidity sweep detection, and 
              neural macroeconomic shields. 100% free for the community.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={TELEGRAM_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-xs font-bold text-zinc-900 hover:bg-zinc-100 hover:border-zinc-300 transition-all shadow-2xs"
              >
                <span>Telegram Quant VIP</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900">
              Navigation
            </p>
            <ul className="mt-3.5 space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/signals" className="hover:text-zinc-950 transition-colors">
                  Live Signals Terminal
                </Link>
              </li>
              <li>
                <Link href="/analysis" className="hover:text-zinc-950 transition-colors">
                  Daily Technical Analysis
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-zinc-950 transition-colors">
                  Economic Calendar
                </Link>
              </li>
              <li>
                <Link href="/track-record" className="hover:text-zinc-950 transition-colors">
                  Audited Performance (76.4%)
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-zinc-950 transition-colors">
                  Free Tools & MT5 Expert Advisors
                </Link>
              </li>
              <li>
                <a href="#architecture" className="hover:text-zinc-950 transition-colors">
                  Algorithmic Strategy Models
                </a>
              </li>
              <li>
                <a href="#proof" className="hover:text-zinc-950 transition-colors">
                  Funded Account Proof
                </a>
              </li>
            </ul>
          </div>

          {/* Risk Disclosure */}
          <div className="md:col-span-4">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <span>⚠</span>
              <span>Institutional Risk Advisory</span>
            </p>
            <p className="mt-3.5 text-[11px] leading-relaxed text-zinc-600">
              All signals, algorithms, models, and tools provided by Kiaros are strictly for educational 
              and quantitative research purposes only. This does not constitute financial advice, 
              investment recommendations, or solicitation. Trading CFDs, Forex, and Crypto involves 
              substantial capital risk and can result in the loss of principal. Past audited performance 
              is no guarantee of future returns.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-zinc-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-zinc-500">
          <p>© {new Date().getFullYear()} Kiaros Quant Terminal. All rights reserved.</p>
          <p className="text-zinc-500">Engineered with Institutional Precision & Zero Repaint Alpha.</p>
        </div>
      </div>
    </footer>
  );
}
