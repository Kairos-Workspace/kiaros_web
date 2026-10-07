import type { Stats } from "@/lib/signals";

export function StatsBar({ stats }: { stats: Stats }) {
  const items = [
    {
      label: "Total signals",
      value: String(stats.total),
      subtext: "Live verified dispatches",
      badge: "LIVE",
      badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Avg Confidence",
      value: stats.total > 0 ? `${stats.avgConfidence}%` : "—",
      subtext: "AI SEA-LION model confidence",
      badge: "AI SCORE",
      badgeColor: "text-zinc-800 bg-zinc-100 border-zinc-300",
    },
    {
      label: "Long / Short",
      value: `${stats.longs}L / ${stats.shorts}S`,
      subtext: "Market directional bias",
      badge: "ORDER FLOW",
      badgeColor: "text-amber-800 bg-amber-50 border-amber-200",
    },
    {
      label: "Win Rate",
      value: stats.winRate !== null ? `${stats.winRate}%` : "—",
      detail:
        stats.winRate !== null
          ? `${stats.tpHits} Full / ${stats.partialWins} Partial / ${stats.slHits}L`
          : undefined,
      subtext: "Audited closed outcomes",
      badge: "AUDITED",
      badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
  ];

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4.5 transition-all hover:border-zinc-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              {item.label}
            </p>
            <span
              className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${item.badgeColor}`}
            >
              {item.badge}
            </span>
          </div>

          <p className="mt-2 font-mono text-3xl font-extrabold tracking-tight tabular-nums text-zinc-950">
            {item.value}
          </p>

          {item.detail ? (
            <p className="mt-1 font-mono text-xs font-semibold text-emerald-600">
              {item.detail}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-zinc-500">{item.subtext}</p>
          )}
        </div>
      ))}
    </div>
  );
}
