"use client";

import { useState } from "react";
import { MarketIcon } from "@/components/landing/HeroAmbient";

type MarketSetup = {
  symbol: string;
  name: string;
  icon: "gold" | "bitcoin" | "ethereum" | "forex" | "nasdaq";
  direction: "BUY" | "SELL";
  price: string;
  change: string;
  entry: string;
  stopLoss: string;
  tp1: string;
  tp2: string;
  tp3: string;
  rr: string;
  timeframe: string;
  confidence: number;
  status: string;
  statusType: "tp_hit" | "active" | "open";
  strategy: string;
  session: string;
  pips: string;
  chartPath: string;
};

const MARKETS: MarketSetup[] = [
  {
    symbol: "XAUUSD",
    name: "Gold / US Dollar",
    icon: "gold",
    direction: "BUY",
    price: "$2,648.80",
    change: "+0.74%",
    entry: "$2,648.80",
    stopLoss: "$2,638.20",
    tp1: "$2,662.50",
    tp2: "$2,674.00",
    tp3: "$2,688.00",
    rr: "1:3.4",
    timeframe: "M15",
    confidence: 89,
    status: "TP1 HIT (+137 PIPS)",
    statusType: "tp_hit",
    strategy: "ICT Liquidity Sweep + Bullish FVG",
    session: "London Killzone",
    pips: "+137 Pips",
    chartPath: "M0,32 Q25,28 45,22 T80,14 T110,8 T140,2",
  },
  {
    symbol: "BTCUSD",
    name: "Bitcoin / US Dollar",
    icon: "bitcoin",
    direction: "BUY",
    price: "$68,940",
    change: "+2.18%",
    entry: "$68,940",
    stopLoss: "$67,800",
    tp1: "$70,500",
    tp2: "$72,000",
    tp3: "$74,500",
    rr: "1:3.1",
    timeframe: "H1",
    confidence: 85,
    status: "ENTRY TRIGGERED // ACTIVE",
    statusType: "active",
    strategy: "SMC 4H Order Block + MSS",
    session: "NY Open Overlap",
    pips: "+1,560 Pts",
    chartPath: "M0,34 Q30,30 55,24 T95,16 T120,10 T140,4",
  },
  {
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    icon: "forex",
    direction: "SELL",
    price: "1.08240",
    change: "-0.18%",
    entry: "1.08240",
    stopLoss: "1.08450",
    tp1: "1.07800",
    tp2: "1.07500",
    tp3: "1.07150",
    rr: "1:2.8",
    timeframe: "M5",
    confidence: 82,
    status: "ACTIVE DISPATCH // ZERO REPAINT",
    statusType: "open",
    strategy: "ICT Session Sweep & FVG Rejection",
    session: "London Open",
    pips: "+44 Pips",
    chartPath: "M0,6 Q30,12 55,18 T95,26 T120,32 T140,36",
  },
  {
    symbol: "ETHUSD",
    name: "Ethereum / US Dollar",
    icon: "ethereum",
    direction: "BUY",
    price: "$3,620.50",
    change: "+1.42%",
    entry: "$3,620.50",
    stopLoss: "$3,560.00",
    tp1: "$3,720.00",
    tp2: "$3,810.00",
    tp3: "$3,950.00",
    rr: "1:3.0",
    timeframe: "M15",
    confidence: 80,
    status: "TP1 HIT (+99.5 PTS)",
    statusType: "tp_hit",
    strategy: "BBMA Volatility Re-entry",
    session: "NY Killzone",
    pips: "+99.5 Pts",
    chartPath: "M0,30 Q28,26 50,20 T85,14 T115,8 T140,3",
  },
  {
    symbol: "GBPUSD",
    name: "Pound / US Dollar",
    icon: "forex",
    direction: "SELL",
    price: "1.26850",
    change: "-0.09%",
    entry: "1.26850",
    stopLoss: "1.27150",
    tp1: "1.26250",
    tp2: "1.25800",
    tp3: "1.25200",
    rr: "1:2.7",
    timeframe: "M15",
    confidence: 81,
    status: "ORDER BLOCK MITIGATION",
    statusType: "open",
    strategy: "SMC Institutional Breaker Block",
    session: "London Afternoon",
    pips: "+60 Pips",
    chartPath: "M0,8 Q32,14 60,20 T95,27 T120,33 T140,37",
  },
  {
    symbol: "NAS100",
    name: "Nasdaq 100",
    icon: "nasdaq",
    direction: "BUY",
    price: "20,412.0",
    change: "+0.85%",
    entry: "20,412.0",
    stopLoss: "20,260.0",
    tp1: "20,650.0",
    tp2: "20,850.0",
    tp3: "21,100.0",
    rr: "1:3.2",
    timeframe: "H1",
    confidence: 86,
    status: "TP2 HIT (+438 PTS)",
    statusType: "tp_hit",
    strategy: "ICT Expansion Leg & FVG Fill",
    session: "Wall St Open",
    pips: "+438 Pts",
    chartPath: "M0,33 Q25,27 50,21 T85,12 T115,7 T140,1",
  },
];

export function HeroMarketCockpit() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("XAUUSD");
  const selected = MARKETS.find((m) => m.symbol === selectedSymbol) ?? MARKETS[0];
  const isBuy = selected.direction === "BUY";

  return (
    <div className="relative w-full max-w-2xl justify-self-end">
      <div className="relative rounded-2xl border border-zinc-200 bg-white/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Cockpit HUD Header */}
        <header className="flex items-center justify-between border-b border-zinc-200/80 bg-zinc-50/80 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900">
              LIVE SIGNAL COCKPIT // STP-ECN
            </span>
            <span className="hidden sm:inline-block rounded bg-zinc-200/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-700">
              {selected.session}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
              12ms LATENCY
            </span>
          </div>
        </header>

        {/* Selected Asset Core Specs */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border p-2 shadow-sm transition-colors ${
                  isBuy
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                <MarketIcon type={selected.icon} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-2xl font-black tracking-tight text-zinc-950">
                    {selected.symbol}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-black uppercase tracking-wider border ${
                      isBuy
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "border-rose-300 bg-rose-50 text-rose-800"
                    }`}
                  >
                    <span>{isBuy ? "▲ LONG" : "▼ SHORT"}</span>
                  </span>
                  <span className="rounded bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-700">
                    {selected.timeframe}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{selected.name}</p>
              </div>
            </div>

            {/* Current Price & Status */}
            <div className="text-right">
              <div className="font-mono text-2xl font-black text-zinc-950">
                {selected.price}
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span
                  className={`font-mono text-xs font-bold ${
                    selected.change.startsWith("+") ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {selected.change}
                </span>
                <span className="rounded bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 font-mono text-[10px] font-bold text-emerald-800">
                  {selected.pips}
                </span>
              </div>
            </div>
          </div>

          {/* Setup Strategy Tag & Outcome */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="text-zinc-900 font-bold">⚡ Engine:</span>
              <span className="font-semibold text-zinc-950">{selected.strategy}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>{selected.status}</span>
            </div>
          </div>

          {/* Live Orderflow Price Ladder */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-2">
              <span className="uppercase tracking-wider font-semibold">Institutional Trade Targets</span>
              <span className="text-emerald-700 font-bold">R:R {selected.rr}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs">
              {/* Entry */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5">
                <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                  Entry
                </span>
                <span className="mt-0.5 block font-black text-zinc-950">
                  {selected.entry}
                </span>
              </div>

              {/* Stop Loss */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-2.5">
                <span className="block text-[10px] uppercase tracking-wider text-rose-800 font-semibold">
                  Stop Loss (SL)
                </span>
                <span className="mt-0.5 block font-black text-rose-700">
                  {selected.stopLoss}
                </span>
              </div>

              {/* Take Profit 1 */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
                <span className="block text-[10px] uppercase tracking-wider text-emerald-800 font-semibold">
                  TP1 (Secured)
                </span>
                <span className="mt-0.5 block font-black text-emerald-700">
                  {selected.tp1}
                </span>
              </div>

              {/* Take Profit 2 / 3 */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
                <span className="block text-[10px] uppercase tracking-wider text-emerald-800 font-semibold">
                  TP2 / TP3
                </span>
                <span className="mt-0.5 block font-black text-emerald-700">
                  {selected.tp2}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Execution Curve + Neural Confidence Checklist */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-zinc-900">Neural Confluence:</span>
                <span className="font-mono text-xs font-black text-emerald-700">{selected.confidence}%</span>
              </div>
              <div className="h-1.5 w-full sm:w-48 rounded-full bg-zinc-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-900 transition-all duration-500"
                  style={{ width: `${selected.confidence}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono text-zinc-600">
                <span className="text-emerald-700 font-bold">✓ Bar-Close Locked</span>
                <span>•</span>
                <span className="font-bold text-zinc-800">✓ Zero Repaint</span>
                <span>•</span>
                <span>✓ News Filter Safe</span>
              </div>
            </div>

            {/* SVG Trajectory Sparkline */}
            <div className="flex flex-col items-end shrink-0">
              <svg className="h-10 w-36 overflow-visible" viewBox="0 0 140 40" fill="none">
                <path
                  d={selected.chartPath}
                  stroke={isBuy ? "#059669" : "#e11d48"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="140"
                  cy={isBuy ? "2" : "37"}
                  r="4"
                  fill={isBuy ? "#059669" : "#e11d48"}
                  className="animate-ping"
                />
                <circle
                  cx="140"
                  cy={isBuy ? "2" : "37"}
                  r="3.5"
                  fill={isBuy ? "#059669" : "#e11d48"}
                />
              </svg>
              <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                Projected Orderflow Path
              </span>
            </div>
          </div>
        </div>

        {/* Asset Quick Switcher Bar */}
        <div className="border-t border-zinc-200 bg-zinc-50/80 p-3 sm:p-4">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" role="tablist" aria-label="Select asset">
            {MARKETS.map((m) => {
              const active = m.symbol === selected.symbol;
              return (
                <button
                  key={m.symbol}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedSymbol(m.symbol)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2 transition-all font-mono cursor-pointer ${
                    active
                      ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-950 hover:bg-zinc-50"
                  }`}
                >
                  <span className="text-xs font-bold">{m.symbol.replace("USD", "")}</span>
                  <span
                    className={`text-[10px] mt-0.5 font-semibold ${
                      active
                        ? "text-zinc-300"
                        : m.change.startsWith("+")
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {m.change}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
