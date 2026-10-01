"use client";

import { useState } from "react";

import { MarketIcon } from "@/components/landing/HeroAmbient";

const MARKETS = [
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar", icon: "bitcoin", change: "+1.18%", price: "$67,482", status: "Bullish bias", tone: "bitcoin" },
  { symbol: "ETHUSD", name: "Ethereum / US Dollar", icon: "ethereum", change: "+0.87%", price: "$3,842", status: "Trend intact", tone: "ethereum" },
  { symbol: "XAUUSD", name: "Gold / US Dollar", icon: "gold", change: "+0.42%", price: "$2,384.60", status: "Watching setup", tone: "gold" },
  { symbol: "EURUSD", name: "Euro / US Dollar", icon: "forex", change: "-0.21%", price: "1.0842", status: "Neutral", tone: "euro" },
  { symbol: "GBPUSD", name: "Pound / US Dollar", icon: "forex", change: "-0.09%", price: "1.2718", status: "Range bound", tone: "pound" },
  { symbol: "NAS100", name: "Nasdaq 100", icon: "nasdaq", change: "+0.55%", price: "18,642", status: "Momentum up", tone: "nasdaq" },
] as const;

type Market = (typeof MARKETS)[number];

export function HeroMarketCockpit() {
  const [selectedSymbol, setSelectedSymbol] = useState(MARKETS[0].symbol);
  const selected = MARKETS.find((market) => market.symbol === selectedSymbol) ?? MARKETS[0];
  const isPositive = selected.change.startsWith("+");

  return (
    <section className="hero-cockpit hero-glass-panel rounded-2xl border" aria-label="Live market overview">
      <header className="flex items-center justify-between border-b border-line px-4 py-3 md:px-5">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate">
            Market pulse
          </p>
          <p className="mt-0.5 text-sm font-semibold text-ink">Choose a market to explore</p>
        </div>
        <span className="hero-live-status">
          <span className="h-1.5 w-1.5 rounded-full bg-long" aria-hidden />
          Live
        </span>
      </header>

      <div className="hero-cockpit-focus p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`hero-cockpit-icon is-${selected.tone}`}>
              <MarketIcon type={selected.icon} />
            </span>
            <span>
              <span className="block font-mono text-lg font-bold tracking-tight text-ink">{selected.symbol}</span>
              <span className="block text-xs text-slate">{selected.name}</span>
            </span>
          </div>
          <span className={`hero-cockpit-change ${isPositive ? "is-positive" : "is-negative"}`}>
            {selected.change}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-2xl font-bold tracking-tight text-ink">{selected.price}</p>
            <p className="mt-1 text-xs font-medium text-long">{selected.status}</p>
          </div>
          <div className="hero-sparkline" aria-hidden>
            <span /><span /><span /><span /><span /><span /><span /><span />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px border-y border-line bg-line">
        <Metric label="Signal quality" value="A-" />
        <Metric label="Confidence" value="66%" />
        <Metric label="Timeframe" value="H1" />
      </div>

      <div className="hero-market-selector p-3 md:p-4" role="tablist" aria-label="Markets">
        {MARKETS.map((market) => (
          <MarketButton
            key={market.symbol}
            market={market}
            active={market.symbol === selected.symbol}
            onClick={() => setSelectedSymbol(market.symbol)}
          />
        ))}
      </div>
    </section>
  );
}

function MarketButton({ market, active, onClick }: { market: Market; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`hero-market-button ${active ? "is-active" : ""}`}
      onClick={onClick}
    >
      <span className={`hero-market-button-icon is-${market.tone}`}>
        <MarketIcon type={market.icon} />
      </span>
      <span>{market.symbol.replace("USD", "")}</span>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card/70 px-3 py-3">
      <p className="text-[10px] font-medium text-slate">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold text-ink">{value}</p>
    </div>
  );
}
