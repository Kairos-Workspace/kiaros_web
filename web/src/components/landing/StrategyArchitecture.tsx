import Link from "next/link";

export function StrategyArchitecture() {
  const pipelineSteps = [
    {
      step: "01",
      title: "STP/ECN Feed",
      desc: "Sub-12ms tick streaming across liquidity providers",
      tag: "INGESTION",
    },
    {
      step: "02",
      title: "Liquidity Sweeps",
      desc: "Detects retail stop runs & engineered liquidity pools",
      tag: "SMC ENGINE",
    },
    {
      step: "03",
      title: "Imbalance Mitigation",
      desc: "Identifies Fair Value Gaps & institutional discount entries",
      tag: "ICT LOGIC",
    },
    {
      step: "04",
      title: "Neural News Shield",
      desc: "Auto-halts trading 30m before CPI, NFP & FOMC events",
      tag: "RISK FILTER",
    },
    {
      step: "05",
      title: "Zero Repaint Lock",
      desc: "Bar-close confirmed before Telegram push under 14ms",
      tag: "DISPATCH",
    },
  ];

  const strategies = [
    {
      id: "smc",
      number: "01",
      title: "Smart Money Concepts (SMC)",
      badge: "ORDER FLOW & LIQUIDITY",
      tone: "text-zinc-900 bg-zinc-100 border-zinc-200",
      accentBorder: "hover:border-zinc-500",
      description:
        "Identifies institutional liquidity engineering, order block mitigations, and Change of Character (CHoCH). Capitalizes on retail stop-loss liquidity triggered by market makers.",
      features: [
        "Liquidity Sweep & CHoCH Confirmation",
        "Institutional Order Block Identification",
        "London & New York Session Killzones",
        "Targeted 1:3.0+ Risk-to-Reward Ratio",
      ],
      timeframe: "M5 • M15 Timeframes",
    },
    {
      id: "ict",
      number: "02",
      title: "Inner Circle Trader (ICT)",
      badge: "INEFFICIENCY ARBITRAGE",
      tone: "text-zinc-900 bg-zinc-100 border-zinc-200",
      accentBorder: "hover:border-zinc-500",
      description:
        "Exploits Fair Value Gap (FVG) imbalances and market displacement legs. Enters systematically at deep institutional discount equilibrium and exits at premium objective targets.",
      features: [
        "Fair Value Gap (FVG) Sweep Detection",
        "Displacement & Market Equilibrium Logic",
        "Session Open High-Volume Injections",
        "Zero Repaint Execution Verification",
      ],
      timeframe: "M15 • H1 Timeframes",
    },
    {
      id: "bbma",
      number: "03",
      title: "BBMA Algorithmic Volatility",
      badge: "DYNAMIC RE-ENTRY",
      tone: "text-zinc-900 bg-zinc-100 border-zinc-200",
      accentBorder: "hover:border-zinc-500",
      description:
        "Direct algorithmic strategy analyzing Bollinger Band standard deviations and multi-layer moving average alignments for high-velocity exhaustion and re-entry moves.",
      features: [
        "Bollinger Band Extreme Deviation Tracking",
        "Multi-Layer Moving Average Alignment",
        "Momentum Re-entry & Take-Profit Ladders",
        "Direct MT5 Expert Advisor Automation",
      ],
      timeframe: "H1 Swing Horizon",
    },
  ];

  return (
    <section id="architecture" className="relative border-b border-zinc-200/80 bg-white py-16 md:py-24">
      <div className="page-container relative z-10">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
            How Quantitative Alpha Is Engineered
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base">
            Rather than relying on subjective intuition or lagging indicators, 
            Kiaros operates on mathematical orderflow mechanics, liquidity absorption, 
            and neural risk filtration.
          </p>
        </div>

        {/* 5-Stage Quant Pipeline Flowchart */}
        <div className="mt-12 overflow-x-auto pb-4">
          <div className="grid min-w-[700px] grid-cols-5 gap-3 font-mono">
            {pipelineSteps.map((p, idx) => (
              <div
                key={p.step}
                className="relative flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="font-bold text-zinc-950">{p.step}</span>
                    <span className="rounded bg-white border border-zinc-200 px-1.5 py-0.5 text-zinc-800 font-semibold">
                      {p.tag}
                    </span>
                  </div>
                  <h4 className="mt-2.5 font-sans text-sm font-bold text-zinc-950">
                    {p.title}
                  </h4>
                  <p className="mt-1 font-sans text-xs text-zinc-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                {idx < pipelineSteps.length - 1 ? (
                  <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-zinc-400 text-xs">
                    →
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* 3 Main Strategy Engine Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {strategies.map((s) => (
            <div
              key={s.id}
              className={`group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${s.accentBorder}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${s.tone}`}
                  >
                    {s.badge}
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-400">
                    {s.number}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold tracking-tight text-zinc-950 group-hover:text-black transition-colors">
                  {s.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                  {s.description}
                </p>

                <div className="mt-5 border-t border-zinc-100 pt-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-3">
                    <span className="uppercase tracking-wider font-semibold">HORIZON</span>
                    <span className="text-zinc-900 font-bold">{s.timeframe}</span>
                  </div>

                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Execution Mechanics
                  </p>
                  <ul className="mt-2 space-y-2 text-xs text-zinc-700">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="text-zinc-950 font-bold shrink-0">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100">
                <Link
                  href="/signals"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-800 hover:text-black transition-colors"
                >
                  <span>Explore {s.title.split(" ")[0]} Feeds</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* High-Contrast Macroeconomic Gatekeeper Banner */}
        <div className="mt-10 overflow-hidden rounded-2xl bg-zinc-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-black tracking-tight text-white">
                Multi-Timeframe Validation & Macro Volatility Shield
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300 sm:text-sm">
                Every prospective setup detected by our SMC, ICT, or BBMA algorithms is cross-referenced 
                against high-impact macroeconomic calendars (CPI, NFP, FOMC) and multi-timeframe trend 
                confluence. Choppy false breakouts and erratic news whipsaws are systematically rejected.
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start md:items-end gap-3 font-mono">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <span className="block text-[10px] uppercase tracking-wider text-zinc-400">Filter Precision</span>
                <span className="text-2xl font-black text-white">42% Filtered</span>
                <span className="block text-[10px] text-zinc-400">Erratic noise rejected</span>
              </div>
              <Link
                href="/signals"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 font-mono text-xs font-bold text-zinc-950 transition-all hover:bg-zinc-100"
              >
                <span>Inspect Live Matrix</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
