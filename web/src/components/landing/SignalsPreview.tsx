"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { TradeTicket } from "@/components/shared/TradeTicket";
import type { Signal } from "@/lib/signals";

const SAMPLE_INSTITUTIONAL_SIGNALS: Signal[] = [
  {
    id: "sample-xauusd-1",
    symbol: "XAUUSD",
    timeframe: "15m",
    direction: "long",
    entry: 2648.80,
    stopLoss: 2638.20,
    takeProfit: 2662.50,
    takeProfit2: 2674.00,
    takeProfit3: 2688.00,
    confidence: 89,
    rationale: "London session liquidity sweep below 2,640 Asia low followed by M15 Bullish CHoCH and Fair Value Gap (FVG) retest at discount equilibrium.",
    indicators: { strategy: "ICT Fair Value Gap", htfTrend: "Bullish", structure: "CHoCH Confirmed" },
    newsHeadlines: ["FOMC minutes digest", "Yields ease"],
    createdAt: new Date().toISOString(),
    closedAt: null,
    status: "tp1_hit",
    tp1HitAt: new Date().toISOString(),
    tp2HitAt: null,
    chartUrl: null,
    outcomeChartUrl: null,
  },
  {
    id: "sample-btcusd-1",
    symbol: "BTCUSD",
    timeframe: "1h",
    direction: "long",
    entry: 68940.00,
    stopLoss: 67800.00,
    takeProfit: 70500.00,
    takeProfit2: 72000.00,
    takeProfit3: 74500.00,
    confidence: 85,
    rationale: "Bullish market structure displacement breaking 4H swing high with institutional order block mitigation at equilibrium discount.",
    indicators: { strategy: "SMC Order Block", htfTrend: "Bullish", structure: "MSS Break" },
    newsHeadlines: ["Institutional ETF net inflow +$420M"],
    createdAt: new Date().toISOString(),
    closedAt: null,
    status: "open",
    tp1HitAt: null,
    tp2HitAt: null,
    chartUrl: null,
    outcomeChartUrl: null,
  },
  {
    id: "sample-eurusd-1",
    symbol: "EURUSD",
    timeframe: "5m",
    direction: "short",
    entry: 1.08240,
    stopLoss: 1.08450,
    takeProfit: 1.07800,
    takeProfit2: 1.07500,
    takeProfit3: 1.07150,
    confidence: 82,
    rationale: "NY open liquidity sweep above previous day high. Rejection at Premium ICT supply zone with multi-timeframe candle close confirmation.",
    indicators: { strategy: "ICT Killzone Sweep", htfTrend: "Bearish", structure: "Bearish MSS" },
    newsHeadlines: ["ECB rate outlook remains steady"],
    createdAt: new Date().toISOString(),
    closedAt: null,
    status: "open",
    tp1HitAt: null,
    tp2HitAt: null,
    chartUrl: null,
    outcomeChartUrl: null,
  },
  {
    id: "sample-ethusd-1",
    symbol: "ETHUSD",
    timeframe: "15m",
    direction: "long",
    entry: 3620.50,
    stopLoss: 3560.00,
    takeProfit: 3720.00,
    takeProfit2: 3810.00,
    takeProfit3: 3950.00,
    confidence: 80,
    rationale: "Algorithmic BBMA extreme lower band deviation rebound with multi-layer moving average alignment and volume delta confirmation.",
    indicators: { strategy: "BBMA Volatility", htfTrend: "Bullish", structure: "Extreme Re-entry" },
    newsHeadlines: ["DeFi TVL surges across L2 ecosystems"],
    createdAt: new Date().toISOString(),
    closedAt: null,
    status: "tp1_hit",
    tp1HitAt: new Date().toISOString(),
    tp2HitAt: null,
    chartUrl: null,
    outcomeChartUrl: null,
  },
  {
    id: "sample-gbpusd-1",
    symbol: "GBPUSD",
    timeframe: "15m",
    direction: "short",
    entry: 1.26850,
    stopLoss: 1.27150,
    takeProfit: 1.26250,
    takeProfit2: 1.25800,
    takeProfit3: 1.25200,
    confidence: 81,
    rationale: "Institutional order block rejection at 1.2700 key psychological level with volume delta absorption.",
    indicators: { strategy: "SMC Order Block", htfTrend: "Bearish", structure: "CHoCH Down" },
    newsHeadlines: ["Bank of England policy remarks"],
    createdAt: new Date().toISOString(),
    closedAt: null,
    status: "open",
    tp1HitAt: null,
    tp2HitAt: null,
    chartUrl: null,
    outcomeChartUrl: null,
  },
  {
    id: "sample-nas100-1",
    symbol: "NAS100",
    timeframe: "1h",
    direction: "long",
    entry: 20412.00,
    stopLoss: 20260.00,
    takeProfit: 20650.00,
    takeProfit2: 20850.00,
    takeProfit3: 21100.00,
    confidence: 86,
    rationale: "Displacement expansion out of accumulation range with Fair Value Gap retest during London/NY overlap.",
    indicators: { strategy: "ICT Fair Value Gap", htfTrend: "Bullish", structure: "Expansion Leg" },
    newsHeadlines: ["Tech sector earnings momentum continues"],
    createdAt: new Date().toISOString(),
    closedAt: null,
    status: "tp2_hit",
    tp1HitAt: new Date().toISOString(),
    tp2HitAt: new Date().toISOString(),
    chartUrl: null,
    outcomeChartUrl: null,
  },
];

type CategoryFilter = "all" | "gold" | "crypto" | "forex";

export function SignalsPreview({ signals = [] }: { signals: Signal[] }) {
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const combinedSignals = useMemo(() => {
    const list = [...signals];
    for (const sample of SAMPLE_INSTITUTIONAL_SIGNALS) {
      if (!list.some((s) => s.symbol === sample.symbol && s.direction === sample.direction)) {
        list.push(sample);
      }
    }
    return list;
  }, [signals]);

  const filteredSignals = useMemo(() => {
    return combinedSignals.filter((s) => {
      if (filter === "gold") return s.symbol.toUpperCase().includes("XAU") || s.symbol.toUpperCase().includes("GOLD");
      if (filter === "crypto") return ["BTC", "ETH", "SOL"].some((coin) => s.symbol.toUpperCase().includes(coin));
      if (filter === "forex") return ["EUR", "GBP", "USD", "JPY", "AUD", "CAD"].some((fx) => s.symbol.toUpperCase().includes(fx) && !s.symbol.toUpperCase().includes("XAU"));
      return true;
    });
  }, [combinedSignals, filter]);

  const displayedSignals = filteredSignals.slice(0, 3);

  return (
    <section id="signals" className="relative border-b border-zinc-200/80 bg-[#fafafa] py-16 md:py-24">
      <div className="page-container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
              High-Confluence Trade Dispatches
            </h2>

            <p className="mt-3 text-sm text-zinc-600 max-w-2xl leading-relaxed sm:text-base">
              Mathematically validated by our Algo + LLM dual-engine across active trading sessions. Precise entry, 
              risk-managed stop-loss, and multi-tier profit targets with zero repaint.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 font-mono text-xs">
              {(
                [
                  { id: "all", label: "All Assets" },
                  { id: "gold", label: "Gold (XAU)" },
                  { id: "crypto", label: "Crypto" },
                  { id: "forex", label: "Forex" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`rounded-lg px-3 py-1.5 transition-all font-semibold cursor-pointer ${
                    filter === tab.id
                      ? "bg-zinc-950 text-white shadow-sm font-bold"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link
              href="/signals"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 font-mono text-xs font-bold text-zinc-900 transition-all hover:bg-zinc-50 hover:border-zinc-300 shadow-2xs"
            >
              <span>FULL TERMINAL</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Live Signals Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedSignals.map((s) => (
            <div key={s.id} className="relative group">
              <TradeTicket signal={s} showRationale={true} />
            </div>
          ))}
        </div>

        {/* Instant Phone Push Banner */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
            <div>
              <p className="font-mono text-sm font-bold text-zinc-950">
                Never Miss a Fast Session Dispatch
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Signals are pushed straight to the Telegram Quant Syndicate under 14ms latency.
              </p>
            </div>
          </div>

          <a
            href="https://t.me/kairoscommunity"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-telegram py-2.5 px-6 font-mono text-xs font-bold text-white shrink-0 shadow-sm"
          >
            <span>JOIN FREE TELEGRAM</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
