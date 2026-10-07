"use client";

import { useState } from "react";
import Link from "next/link";

export type AssetAnalysis = {
  id: string;
  symbol: string;
  name: string;
  assetClass: "Commodity" | "Forex" | "Crypto" | "Indices";
  price: string;
  change: string;
  isPositive: boolean;
  bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidence: number;
  timeframe: string;
  session: string;
  rrRatio: string;
  summary: string;
  keyLevels: {
    label: string;
    level: string;
    type: "resistance" | "equilibrium" | "support" | "invalidation";
    description: string;
  }[];
  primaryPlan: {
    direction: "BUY / LONG" | "SELL / SHORT";
    trigger: string;
    entry: string;
    stopLoss: string;
    tp1: string;
    tp2: string;
    tp3: string;
    notes: string;
  };
  alternativePlan: {
    condition: string;
    target: string;
    notes: string;
  };
  orderflowNotes: string[];
};

const ASSET_ANALYSES: AssetAnalysis[] = [
  {
    id: "xauusd",
    symbol: "XAUUSD",
    name: "Gold / US Dollar",
    assetClass: "Commodity",
    price: "$2,648.80",
    change: "+0.74%",
    isPositive: true,
    bias: "BULLISH",
    confidence: 89,
    timeframe: "H4 / H1 / M15",
    session: "London Killzone → NY Overlap",
    rrRatio: "1:3.4",
    summary:
      "Gold maintains a strong institutional bullish posture after sweeping Asian session sell-side liquidity at $2,638.20. Market structure on H1 shifted bullish with high displacement creating a prominent Fair Value Gap (FVG) at $2,642.00–$2,646.00.",
    keyLevels: [
      { label: "Major BSL Target (All-Time High Pool)", level: "$2,688.00", type: "resistance", description: "Buy-side liquidity resting above weekly swing high" },
      { label: "Session Target 1 (Interday High)", level: "$2,662.50", type: "resistance", description: "Internal range liquidity & NY session high objective" },
      { label: "Daily Equilibrium (50% Range)", level: "$2,652.00", type: "equilibrium", description: "Institutional median fair value retest zone" },
      { label: "Discount Order Block & M15 FVG", level: "$2,642.50", type: "support", description: "High-probability long entry zone upon pullback" },
      { label: "Structural Invalidation (SSL)", level: "$2,635.00", type: "invalidation", description: "H4 swing low; break below negates immediate bullish continuation" },
    ],
    primaryPlan: {
      direction: "BUY / LONG",
      trigger: "Pullback into M15 Discount FVG with 5m bar-close bullish engulfing confirmation",
      entry: "$2,644.00 – $2,646.50",
      stopLoss: "$2,637.80",
      tp1: "$2,658.00 (+120 Pips)",
      tp2: "$2,668.50 (+225 Pips)",
      tp3: "$2,682.00 (+360 Pips)",
      notes: "Move stop-loss to breakeven immediately upon TP1 fill. Do not enter during high-impact red news buffer.",
    },
    alternativePlan: {
      condition: "Sustained H1 bar close below $2,635.00 key institutional low",
      target: "$2,620.00 liquidity pool",
      notes: "Flip bias to neutral/bearish and look for distribution continuation into daily demand.",
    },
    orderflowNotes: [
      "Institutional Cumulative Volume Delta (CVD) shows aggressive passive absorption at the London open low.",
      "Commercial trader positioning (COT) remains net positive with sustained central bank accumulation tailwinds.",
      "DXY (US Dollar Index) facing key resistance at 104.20, providing confluence for bullion upside expansion.",
    ],
  },
  {
    id: "eurusd",
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    assetClass: "Forex",
    price: "1.08240",
    change: "-0.18%",
    isPositive: false,
    bias: "BEARISH",
    confidence: 84,
    timeframe: "H4 / H1",
    session: "London Killzone",
    rrRatio: "1:2.8",
    summary:
      "EURUSD remains under distribution pressure after failing to hold the 1.0880 supply cluster. London session opened with a turtle soup liquidity sweep above Asian highs followed by aggressive downside momentum.",
    keyLevels: [
      { label: "Premium Supply Order Block", level: "1.08850", type: "resistance", description: "H4 institutional mitigation block" },
      { label: "Intraday Breaker Block", level: "1.08500", type: "resistance", description: "Former support flipped resistance" },
      { label: "Dealing Range Midpoint", level: "1.08200", type: "equilibrium", description: "Current price action oscillating zone" },
      { label: "Sell-Side Liquidity (SSL)", level: "1.07750", type: "support", description: "Primary target resting below weekly equal lows" },
      { label: "Bullish Invalidation", level: "1.09100", type: "invalidation", description: "Daily structural high; invalidates short bias" },
    ],
    primaryPlan: {
      direction: "SELL / SHORT",
      trigger: "Retest of 1.08450 breaker zone with rejection wick on M15",
      entry: "1.08400 – 1.08480",
      stopLoss: "1.08720",
      tp1: "1.08050 (+35 Pips)",
      tp2: "1.07750 (+65 Pips)",
      tp3: "1.07400 (+100 Pips)",
      notes: "Trail stop behind successive 15m lower highs once price trades through 1.08100.",
    },
    alternativePlan: {
      condition: "Clean H4 close above 1.08850 with volume expansion",
      target: "1.09500 Fair Value Gap fill",
      notes: "Short-squeeze scenario triggered by ECB monetary policy hawkish commentary.",
    },
    orderflowNotes: [
      "Orderflow prints heavy aggressive selling during Frankfurt transition.",
      "Eurozone manufacturing PMIs continue to print contractionary, dampening long momentum.",
      "Negative EUR/USD swap differential favors persistent USD carry interest.",
    ],
  },
  {
    id: "gbpusd",
    symbol: "GBPUSD",
    name: "British Pound / US Dollar",
    assetClass: "Forex",
    price: "1.26850",
    change: "-0.09%",
    isPositive: false,
    bias: "NEUTRAL",
    confidence: 76,
    timeframe: "Daily / H4",
    session: "London → NY Transition",
    rrRatio: "1:3.1",
    summary:
      "Cable is compressing inside a symmetrical equilibrium coil between 1.2640 support and 1.2750 resistance. Liquidity is building on both sides of the market; wait for an institutional sweep before committing directional size.",
    keyLevels: [
      { label: "Range High Liquidity (BSL)", level: "1.27600", type: "resistance", description: "Stacked buy stops from retail double-top" },
      { label: "Interday Premium Zone", level: "1.27150", type: "resistance", description: "H1 Fair Value Gap ceiling" },
      { label: "Range Equilibrium (50%)", level: "1.26750", type: "equilibrium", description: "Fair value magnet" },
      { label: "Range Low Liquidity (SSL)", level: "1.26300", type: "support", description: "Accumulation demand zone" },
      { label: "Macro Invalidation", level: "1.25800", type: "invalidation", description: "Key monthly support pivot" },
    ],
    primaryPlan: {
      direction: "BUY / LONG",
      trigger: "Liquidity run into 1.26300 followed by M15 Change of Character (CHoCH)",
      entry: "1.26350 – 1.26500",
      stopLoss: "1.25980",
      tp1: "1.27050 (+60 Pips)",
      tp2: "1.27550 (+110 Pips)",
      tp3: "1.28200 (+175 Pips)",
      notes: "Patience required. Do not chase mid-range price action between 1.2670 and 1.2710.",
    },
    alternativePlan: {
      condition: "H1 displacement break below 1.26200 without immediate absorption",
      target: "1.25500 institutional demand cluster",
      notes: "Target multi-month swing liquidity if UK macro telemetry disappoints.",
    },
    orderflowNotes: [
      "Retail positioning sits 68% long, signaling prime conditions for institutional downside liquidity sweep.",
      "Bank of England terminal rate expectations stable; market awaiting CPI release.",
      "High correlation with EURUSD orderbook movements today.",
    ],
  },
  {
    id: "btcusd",
    symbol: "BTCUSD",
    name: "Bitcoin / US Dollar",
    assetClass: "Crypto",
    price: "$68,940",
    change: "+2.18%",
    isPositive: true,
    bias: "BULLISH",
    confidence: 91,
    timeframe: "Daily / H4 / H1",
    session: "Global 24/7 ECN",
    rrRatio: "1:3.8",
    summary:
      "Bitcoin displays institutional accumulation characteristics with spot ETF net inflows exceeding $450M over the trailing 48 hours. Structural breakout above $67,500 established new support with the $70,000 psychological magnet in crosshairs.",
    keyLevels: [
      { label: "Major Liquidity Target (ATH Pool)", level: "$73,800", type: "resistance", description: "Historical all-time high buy stops" },
      { label: "Psychological Barrier (BSL)", level: "$70,200", type: "resistance", description: "High gamma call option open interest cluster" },
      { label: "Volume Point of Control (VPOC)", level: "$68,400", type: "equilibrium", description: "Highest transacted volume level this week" },
      { label: "H4 Order Block Re-test", level: "$67,200", type: "support", description: "Institutional breakout re-accumulation floor" },
      { label: "Macro Invalidation", level: "$65,000", type: "invalidation", description: "Swing structural support; loss flips trend neutral" },
    ],
    primaryPlan: {
      direction: "BUY / LONG",
      trigger: "Limit order entry at $67,800 – $68,300 retest or 1H candle close above $69,200",
      entry: "$68,200 – $68,600",
      stopLoss: "$66,950",
      tp1: "$70,100 (+1,500 Pts)",
      tp2: "$72,000 (+3,400 Pts)",
      tp3: "$73,800 (+5,200 Pts)",
      notes: "Spot funding rates remain moderate (+0.01%), leaving substantial runway for non-leveraged upside.",
    },
    alternativePlan: {
      condition: "Daily rejection below $67,000 with spike in exchange deposits",
      target: "$64,200 CME gap fill",
      notes: "Wait for weekend CME gap closure before looking for fresh long entries.",
    },
    orderflowNotes: [
      "Open interest (OI) expanding +4.2% alongside positive funding rate, reflecting institutional spot-driven bid.",
      "Whale exchange reserves hit lowest point in 18 months according to on-chain cluster telemetry.",
      "Liquidation heatmap highlights thick short liquidations clustered between $69,800 and $70,500.",
    ],
  },
  {
    id: "nas100",
    symbol: "NAS100",
    name: "Nasdaq 100 Index",
    assetClass: "Indices",
    price: "20,412.0",
    change: "+0.85%",
    isPositive: true,
    bias: "BULLISH",
    confidence: 87,
    timeframe: "H1 / M15",
    session: "Wall St Open & NY PM",
    rrRatio: "1:3.2",
    summary:
      "Tech-heavy Nasdaq index continues upward expansion driven by semiconductor earnings momentum and declining Treasury yields. New York open printed an institutional gap-and-go pattern above 20,250.",
    keyLevels: [
      { label: "Record High Expansion Pool", level: "20,750.0", type: "resistance", description: "Fibonacci 1.618 extension target" },
      { label: "Session BSL Liquidity", level: "20,520.0", type: "resistance", description: "Immediate liquidity sweep target" },
      { label: "NY Open Dealing Midpoint", level: "20,380.0", type: "equilibrium", description: "VWAP session anchor" },
      { label: "M15 Fair Value Gap Support", level: "20,260.0", type: "support", description: "First institutional defense zone" },
      { label: "Daily Low Invalidation", level: "20,080.0", type: "invalidation", description: "Breach invalidates momentum playbook" },
    ],
    primaryPlan: {
      direction: "BUY / LONG",
      trigger: "M15 dip into VWAP / 20,280 FVG with aggressive delta absorption",
      entry: "20,280.0 – 20,340.0",
      stopLoss: "20,160.0",
      tp1: "20,480.0 (+180 Pts)",
      tp2: "20,620.0 (+320 Pts)",
      tp3: "20,750.0 (+450 Pts)",
      notes: "Strict 09:30 - 11:30 EST execution window. Respect NY lunch hour equilibrium lull.",
    },
    alternativePlan: {
      condition: "Sustained trading below 20,150 during cash session",
      target: "19,950 institutional liquidity pocket",
      notes: "Prepare for sector rotation into defensive assets.",
    },
    orderflowNotes: [
      "Market breadth positive with 74% of component stocks trading above 20-day exponential moving average.",
      "VIX (Volatility Index) compressed below 15.2, indicating risk-on macroeconomic appetite.",
      "Institutional dark pool prints concentrated in major mega-cap tech holdings.",
    ],
  },
];

export function AnalysisView() {
  const [selectedId, setSelectedId] = useState<string>("xauusd");
  const selected = ASSET_ANALYSES.find((a) => a.id === selectedId) ?? ASSET_ANALYSES[0];

  return (
    <div className="w-full space-y-8">
      {/* 1. Asset Navigation Tabs */}
      <div className="border-b border-zinc-200">
        <ul className="flex flex-wrap text-sm font-medium text-center text-zinc-600">
          {ASSET_ANALYSES.map((item) => {
            const active = item.id === selected.id;
            return (
              <li key={item.id} className="me-2">
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`inline-block p-4 rounded-t-lg transition-colors cursor-pointer ${
                    active
                      ? "text-white bg-zinc-950 font-bold shadow-xs active"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                  }`}
                >
                  <span className="font-mono">{item.symbol}</span>
                  <span className="hidden sm:inline text-xs ml-1.5 opacity-80 font-normal">
                    ({item.assetClass})
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 2. Master Asset Bias Header Card */}
      <div className="border border-zinc-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-zinc-100 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-3xl font-black text-zinc-950 tracking-tight">
                {selected.symbol}
              </span>
              <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-xs font-bold text-zinc-700">
                {selected.name}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-0.5 font-mono text-xs font-black uppercase tracking-wider ${
                  selected.bias === "BULLISH"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : selected.bias === "BEARISH"
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : "border-amber-300 bg-amber-50 text-amber-800"
                }`}
              >
                <span>{selected.bias === "BULLISH" ? "▲" : selected.bias === "BEARISH" ? "▼" : "◆"}</span>
                <span>{selected.bias} BIAS</span>
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 max-w-3xl">
              {selected.summary}
            </p>
          </div>

          {/* Pricing & Confidence Gauge */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-zinc-100">
            <div className="text-left lg:text-right">
              <div className="font-mono text-3xl font-black text-zinc-950 tracking-tight">
                {selected.price}
              </div>
              <div
                className={`font-mono text-xs font-bold mt-0.5 ${
                  selected.isPositive ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {selected.change} (24H SPOT)
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5">
              <span className="font-bold">Neural Confluence:</span>
              <span className="font-black text-emerald-700">{selected.confidence}%</span>
            </div>
          </div>
        </div>

        {/* 4 Quick Telemetry Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono text-xs">
          <div className="border border-zinc-100 bg-zinc-50/60 p-3">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Timeframe Focus</p>
            <p className="mt-1 font-bold text-zinc-950">{selected.timeframe}</p>
          </div>
          <div className="border border-zinc-100 bg-zinc-50/60 p-3">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Session Window</p>
            <p className="mt-1 font-bold text-zinc-950">{selected.session}</p>
          </div>
          <div className="border border-zinc-100 bg-zinc-50/60 p-3">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Target Risk:Reward</p>
            <p className="mt-1 font-bold text-emerald-700 font-black">{selected.rrRatio}</p>
          </div>
          <div className="border border-zinc-100 bg-zinc-50/60 p-3">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Live Execution Status</p>
            <p className="mt-1 font-bold text-zinc-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>ACTIVE RADAR</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Actionable Trade Plans (Scenario A & B) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Primary Playbook */}
        <div className="border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-zinc-950 text-white px-2 py-0.5">
                  PLAN A
                </span>
                <h3 className="font-mono text-sm font-bold text-zinc-950">
                  Primary Confluence Setup
                </h3>
              </div>
              <span
                className={`font-mono text-xs font-black ${
                  selected.primaryPlan.direction.includes("BUY") ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {selected.primaryPlan.direction}
              </span>
            </div>

            <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
              <span className="font-bold text-zinc-900">Trigger Condition: </span>
              {selected.primaryPlan.trigger}
            </p>

            <div className="grid grid-cols-2 gap-2.5 font-mono text-xs mb-4">
              <div className="border border-zinc-200 bg-zinc-50 p-2.5">
                <p className="text-[10px] uppercase font-bold text-zinc-500">Entry Zone</p>
                <p className="font-bold text-zinc-950 mt-0.5">{selected.primaryPlan.entry}</p>
              </div>
              <div className="border border-rose-200 bg-rose-50/50 p-2.5">
                <p className="text-[10px] uppercase font-bold text-rose-700">Stop Loss (SL)</p>
                <p className="font-bold text-rose-700 mt-0.5">{selected.primaryPlan.stopLoss}</p>
              </div>
              <div className="border border-emerald-200 bg-emerald-50/50 p-2.5">
                <p className="text-[10px] uppercase font-bold text-emerald-800">Target 1 (TP1)</p>
                <p className="font-bold text-emerald-800 mt-0.5">{selected.primaryPlan.tp1}</p>
              </div>
              <div className="border border-emerald-200 bg-emerald-50/50 p-2.5">
                <p className="text-[10px] uppercase font-bold text-emerald-800">Target 2 & 3</p>
                <p className="font-bold text-emerald-800 mt-0.5">{selected.primaryPlan.tp2}</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] font-mono text-zinc-500 border-t border-zinc-100 pt-3">
            💡 {selected.primaryPlan.notes}
          </p>
        </div>

        {/* Alternative Plan / Invalidation */}
        <div className="border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-zinc-200 text-zinc-800 px-2 py-0.5">
                  PLAN B
                </span>
                <h3 className="font-mono text-sm font-bold text-zinc-950">
                  Alternative Invalidation & Defense
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-amber-700">
                DEFENSIVE SHIELD
              </span>
            </div>

            <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
              <span className="font-bold text-zinc-900">Failure Trigger: </span>
              {selected.alternativePlan.condition}
            </p>

            <div className="border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs mb-4">
              <p className="text-[10px] uppercase font-bold text-zinc-500">Secondary Liquidity Target</p>
              <p className="font-bold text-zinc-950 mt-1">{selected.alternativePlan.target}</p>
            </div>
          </div>

          <p className="text-[11px] font-mono text-zinc-500 border-t border-zinc-100 pt-3">
            🛡️ {selected.alternativePlan.notes}
          </p>
        </div>
      </div>

      {/* 4. Institutional Liquidity & Key Price Levels Table */}
      <div className="border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4">
          <h3 className="font-mono text-sm font-bold text-zinc-950 uppercase tracking-wider">
            Key Institutional Price Levels & Liquidity Pools
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time algorithmic orderbook map for {selected.symbol}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-100/70 text-[11px] font-bold text-zinc-600 uppercase">
              <tr>
                <th className="px-6 py-3">Structure Role</th>
                <th className="px-6 py-3">Price Level</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Institutional Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {selected.keyLevels.map((lvl, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-zinc-950">{lvl.label}</td>
                  <td className="px-6 py-3.5 font-black text-sm text-zinc-950">{lvl.level}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        lvl.type === "resistance"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : lvl.type === "support"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : lvl.type === "equilibrium"
                          ? "bg-zinc-100 text-zinc-800 border border-zinc-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {lvl.type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-zinc-600">{lvl.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Orderflow & Macro Commentary */}
      <div className="border border-zinc-200 bg-white p-6 md:p-8 shadow-sm">
        <h3 className="font-mono text-sm font-bold text-zinc-950 uppercase tracking-wider mb-3">
          Institutional Orderflow Insights & Volume Analysis
        </h3>
        <ul className="space-y-2.5 text-xs text-zinc-700 leading-relaxed">
          {selected.orderflowNotes.map((note, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="font-mono text-emerald-700 font-bold">▶</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 pt-6">
          <p className="font-mono text-xs text-zinc-500">
            ⚡ Want instant Telegram notification when {selected.symbol} triggers entry?
          </p>
          <a
            href="https://t.me/kairoscommunity"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-zinc-950 text-white font-mono text-xs font-bold px-4 py-2 hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <span>Join Official Telegram Syndicate</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
