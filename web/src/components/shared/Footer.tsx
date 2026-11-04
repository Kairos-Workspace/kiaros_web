import { T } from "@/components/i18n/T";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { TELEGRAM_GROUP_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 text-zinc-600">
      <div className="page-container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-zinc-600">
              <T>{"Institutional signal architecture across Gold (XAUUSD), Crypto, and Forex. Engineered with algorithmic orderflow, liquidity sweep detection, and neural macroeconomic shields. 100% free for the community."}</T> </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={TELEGRAM_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 font-mono text-xs font-bold text-zinc-900 hover:bg-zinc-100 hover:border-zinc-300 transition-all shadow-2xs"
              >
                <span><T>{"Telegram Community"}</T></span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900">
              <T>{"Navigation"}</T> </p>
            <ul className="mt-3.5 space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/signals" className="hover:text-zinc-950 transition-colors">
                  <T>{"Live Signals Terminal"}</T> </Link>
              </li>
              <li>
                <Link href="/analysis" className="hover:text-zinc-950 transition-colors">
                  <T>{"Daily Technical Analysis"}</T> </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-zinc-950 transition-colors">
                  <T>{"Economic Calendar"}</T> </Link>
              </li>
              <li>
                <Link href="/track-record" className="hover:text-zinc-950 transition-colors">
                  <T>{"Audited Performance (76.4%)"}</T> </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-zinc-950 transition-colors">
                  <T>{"Free Tools & MT5 Expert Advisors"}</T> </Link>
              </li>
              <li>
                <a href="#architecture" className="hover:text-zinc-950 transition-colors">
                  <T>{"Algorithmic Strategy Models"}</T> </a>
              </li>
              <li>
                <a href="#proof" className="hover:text-zinc-950 transition-colors">
                  <T>{"Funded Account Proof"}</T> </a>
              </li>
            </ul>
          </div>

          {/* Risk Disclosure */}
          <div className="md:col-span-4">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <span>⚠</span>
              <span><T>{"Institutional Risk Advisory"}</T></span>
            </p>
            <p className="mt-3.5 text-[11px] leading-relaxed text-zinc-600">
              <T>{"All signals, algorithms, models, and tools provided by Kiaros are strictly for educational and quantitative research purposes only. This does not constitute financial advice, investment recommendations, or solicitation. Trading CFDs, Forex, and Crypto involves substantial capital risk and can result in the loss of principal. Past audited performance is no guarantee of future returns."}</T> </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-zinc-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-zinc-500">
          <p>© {new Date().getFullYear()} <T>{"Kiaros Quant Terminal. All rights reserved."}</T></p>
          <p className="text-zinc-500"><T>{"Engineered with Institutional Precision & Zero Repaint Alpha."}</T></p>
        </div>
      </div>
    </footer>
  );
}
