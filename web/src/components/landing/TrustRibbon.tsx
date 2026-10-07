export function TrustRibbon() {
  const tickerItems = [
    { symbol: "XAUUSD", price: "$2,648.80", change: "+0.74%", setup: "ICT Bullish FVG [M15]", positive: true, pips: "+137 Pips" },
    { symbol: "BTCUSD", price: "$68,940", change: "+2.18%", setup: "SMC 4H Order Block", positive: true, pips: "+1,560 Pts" },
    { symbol: "ETHUSD", price: "$3,620.50", change: "+1.42%", setup: "Discount Expansion [M15]", positive: true, pips: "+99.5 Pts" },
    { symbol: "EURUSD", price: "1.08240", change: "-0.18%", setup: "London Liquidity Sweep", positive: false, pips: "+44 Pips" },
    { symbol: "GBPUSD", price: "1.26850", change: "-0.09%", setup: "NY Killzone Breaker", positive: false, pips: "+60 Pips" },
    { symbol: "NAS100", price: "20,412.0", change: "+0.85%", setup: "Institutional Expansion", positive: true, pips: "+438 Pts" },
    { symbol: "US30", price: "42,150.0", change: "+0.45%", setup: "Equilibrium Retest [H1]", positive: true, pips: "+310 Pts" },
    { symbol: "SOLUSD", price: "$178.40", change: "+3.40%", setup: "Bullish Structure Shift", positive: true, pips: "+12.2 Pts" },
  ];

  const sessions = [
    { name: "London Killzone", hours: "08:00 - 16:30 GMT", status: "ACTIVE", active: true },
    { name: "New York Overlap", hours: "13:00 - 21:00 GMT", status: "ACTIVE", active: true },
    { name: "Tokyo Session", hours: "00:00 - 09:00 GMT", status: "CLOSED", active: false },
    { name: "Sydney Session", hours: "22:00 - 07:00 GMT", status: "CLOSED", active: false },
  ];

  const credentials = [
    {
      metric: "76.4%",
      label: "Audited Win Rate",
      sub: "6+ Years Tick-Validated (2020–2026)",
      tone: "text-emerald-700",
    },
    {
      metric: "Zero Repaint",
      label: "Guaranteed Execution",
      sub: "Bar close candle confirmation only",
      tone: "text-zinc-950",
    },
    {
      metric: "3 Engines",
      label: "Multi-Model Confluence",
      sub: "SMC • ICT • BBMA Algorithmic",
      tone: "text-zinc-950",
    },
    {
      metric: "100% Free",
      label: "Open Community VIP",
      sub: "Zero monthly subscription fees",
      tone: "text-emerald-700",
    },
  ];

  return (
    <section className="relative z-20 border-b border-zinc-200/80 bg-white">
      {/* 1. Real-Time Streaming Ticker Ribbon */}
      <div className="border-b border-zinc-200/80 bg-zinc-50/80 py-2.5 overflow-hidden ticker-marquee">
        <div className="ticker-marquee-track flex items-center gap-8 text-xs font-mono">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={`${item.symbol}-${idx}`} className="flex items-center gap-2.5 whitespace-nowrap">
              <span className="font-black text-zinc-950 tracking-wider">{item.symbol}</span>
              <span className="text-zinc-700 font-semibold">{item.price}</span>
              <span
                className={`font-bold ${
                  item.positive ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {item.change}
              </span>
              <span className="rounded bg-white border border-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-700 shadow-2xs">
                {item.setup}
              </span>
              <span className="rounded bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.2 text-[10px] font-bold">
                {item.pips}
              </span>
              <span className="text-zinc-300 ml-3">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Global Trading Sessions Radar Strip */}
      <div className="border-b border-zinc-200/80 bg-white py-3">
        <div className="page-container flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-700 font-bold uppercase tracking-wider text-[11px]">
            <span className="h-2 w-2 rounded-full bg-zinc-900 animate-pulse" />
            <span>SESSION RADAR:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-4 text-[11px]">
            {sessions.map((s) => (
              <div
                key={s.name}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 ${
                  s.active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    s.active ? "bg-emerald-600 animate-ping" : "bg-zinc-400"
                  }`}
                />
                <span className="font-bold">{s.name}</span>
                <span className="text-[10px] opacity-75 hidden md:inline">({s.hours})</span>
                <span className="text-[9px] font-bold uppercase rounded px-1 bg-white border border-zinc-200">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Key Quantitative Audit Credentials */}
      <div className="page-container py-8 sm:py-10">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 divide-y divide-zinc-200 sm:divide-y-0 sm:divide-x sm:divide-zinc-200">
          {credentials.map((c, i) => (
            <div
              key={c.label}
              className={`flex flex-col items-center text-center ${
                i > 0 ? "pt-5 sm:pt-0 sm:pl-6" : ""
              }`}
            >
              <span className={`font-mono text-3xl font-black tracking-tight sm:text-4xl ${c.tone}`}>
                {c.metric}
              </span>
              <span className="mt-1.5 font-sans text-xs font-bold uppercase tracking-wider text-zinc-900">
                {c.label}
              </span>
              <span className="mt-0.5 text-xs text-zinc-500">
                {c.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
