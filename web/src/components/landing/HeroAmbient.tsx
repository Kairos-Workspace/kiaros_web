const MARKETS = [
  { symbol: "BTC", name: "Bitcoin", tone: "bitcoin", icon: "bitcoin" },
  { symbol: "XAU", name: "Gold", tone: "gold", icon: "gold" },
  { symbol: "EUR/USD", name: "Euro Dollar", tone: "euro", icon: "forex" },
  { symbol: "ETH", name: "Ethereum", tone: "ethereum", icon: "ethereum" },
  { symbol: "GBP/USD", name: "Pound Dollar", tone: "pound", icon: "forex" },
  { symbol: "NAS100", name: "Nasdaq 100", tone: "nasdaq", icon: "nasdaq" },
] as const;

export type MarketIconType =
  | "bitcoin"
  | "ethereum"
  | "gold"
  | "forex"
  | "nasdaq";

export function HeroAmbient() {
  return null;
}

export function MarketIcon({ type }: { type: MarketIconType }) {
  if (type === "bitcoin") {
    return (
      <svg className="hero-market-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 6.5v11M13.5 6.5v11M8 8.5h5a2 2 0 0 1 0 4H8h5.5a2 2 0 0 1 0 4H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "ethereum") {
    return (
      <svg className="hero-market-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="m12 2.5 6 9.5-6 3-6-3 6-9.5Z" fill="currentColor" opacity=".75" />
        <path d="m6 13 6 3 6-3-6 8.5L6 13Z" fill="currentColor" opacity=".45" />
        <path d="m12 2.5-6 9.5 6 3 6-3-6-9.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "gold") {
    return (
      <svg className="hero-market-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 15h10M8.5 15l2-5h3l2 5M10 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "forex") {
    return (
      <svg className="hero-market-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="9" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="15" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.7" opacity=".55" />
        <path d="M7 12h4M9 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className="hero-market-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 18V13M10 18V9M15 18V5M20 18v-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4 19.5h17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
