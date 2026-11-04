import { T } from "@/components/i18n/T";
import { TELEGRAM_GROUP_URL } from "@/lib/constants";

export function SyndicateCta() {
  return (
    <section className="relative z-20 border-t border-zinc-200/80 bg-[#fafafa] py-16 md:py-24">
      <div className="page-container">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 p-8 md:p-14 shadow-2xl text-white">
          {/* Subtle ambient lighting */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-zinc-800/40 blur-[120px]"
            aria-hidden
          />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              <T>{"Elevate Your Edge With Instant Signal Dispatches"}</T> </h2>

            <p className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
              <T>{"Receive instant real-time signal dispatches straight to your phone the millisecond our Algo + LLM dual-engine confirms an orderflow setup. Free forever — zero monthly subscriptions, zero paywalled alpha."}</T> </p>

            {/* Quick Metrics */}
            <div className="mt-8 grid grid-cols-3 gap-3 font-mono text-center">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-sm">
                <span className="block text-xl font-black text-white sm:text-3xl">1,250+</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400"><T>{"Active Quants"}</T></span>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-sm">
                <span className="block text-xl font-black text-emerald-400 sm:text-3xl"><T>{"< 14ms"}</T></span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400"><T>{"Push Latency"}</T></span>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-sm">
                <span className="block text-xl font-black text-white sm:text-3xl"><T>{"$0 / mo"}</T></span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400"><T>{"100% Free Access"}</T></span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href={TELEGRAM_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-black tracking-tight text-zinc-950 transition-all hover:bg-zinc-100 shadow-lg group cursor-pointer"
              >
                <span><T>{"Join Official Telegram Syndicate"}</T></span>
                <span className="transition-transform group-hover:translate-x-1 font-mono">→</span>
              </a>
            </div>

            <p className="mt-4 font-mono text-[11px] text-zinc-400">
              <T>{"⚡ Compatible with MetaTrader 5 (MT5), MT4, TradingView & Telegram Mobile."}</T> </p>
          </div>
        </div>
      </div>
    </section>
  );
}
