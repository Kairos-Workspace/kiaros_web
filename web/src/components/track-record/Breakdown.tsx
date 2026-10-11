import type { BreakdownRow } from "@/lib/track-record";

export function Breakdown({ title, rows = [] }: { title: string; rows: BreakdownRow[] }) {
  const formatName = (n: string) => {
    return n.replace(/_/g, " ").toUpperCase();
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900">
          {title}
        </h3>
        <span className="font-mono text-[10px] font-semibold text-zinc-400">
          {rows.length} {rows.length === 1 ? "Category" : "Categories"}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8 text-center">
          <p className="text-xs text-zinc-400">No category settlements recorded yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => {
            const isPositive = r.netR >= 0;
            return (
              <li key={r.name} className="group">
                <div className="mb-2 flex items-baseline justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-zinc-950 truncate">
                      {formatName(r.name)}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-normal">
                      ({r.count} trades)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 tabular-nums">
                    <span className="font-semibold text-zinc-600">
                      {r.winRate}% WR
                    </span>
                    <span
                      className={`font-black px-2 py-0.5 rounded text-[11px] ${
                        isPositive
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {r.netR.toFixed(1)}R
                    </span>
                  </div>
                </div>

                {/* Visual Dual Progress Bar (Win Rate Track) */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 flex">
                  <div
                    className={`h-full transition-all duration-500 ${
                      r.winRate >= 60
                        ? "bg-emerald-500"
                        : r.winRate >= 45
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, r.winRate))}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
