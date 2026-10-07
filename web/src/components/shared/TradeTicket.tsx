import type { Signal } from "@/lib/signals";
import { formatPrice, formatRelativeTime, formatTimeframe } from "@/lib/format";

function DirectionBadge({ direction }: { direction: Signal["direction"] }) {
  const isLong = direction === "long";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 font-mono text-[11px] font-black uppercase tracking-wider border shadow-2xs ${
        isLong
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-rose-300 bg-rose-50 text-rose-800"
      }`}
    >
      <span aria-hidden>{isLong ? "▲" : "▼"}</span>
      <span>{isLong ? "BUY" : "SELL"}</span>
    </span>
  );
}

function StatusBadge({
  status,
  closedAt,
}: {
  status: Signal["status"];
  closedAt?: string | null;
}) {
  if (status === "open") return null;
  if (status === "expired") {
    return (
      <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-600">
        Expired
      </span>
    );
  }
  // Open partials (no closedAt) stay emerald; closed TP1/TP2 wins go green.
  if ((status === "tp1_hit" || status === "tp2_hit") && !closedAt) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
        <span>{status === "tp1_hit" ? "TP1 Hit" : "TP2 Hit"}</span>
      </span>
    );
  }
  const label =
    status === "tp3_hit"
      ? "TP3 Hit"
      : status === "tp2_hit"
        ? "TP2 Hit"
        : status === "tp1_hit"
          ? "TP1 Hit"
          : status === "tp_hit"
            ? "TP Hit"
            : "SL Hit";
  const isWin = status !== "sl_hit";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
        isWin
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-rose-300 bg-rose-50 text-rose-800"
      }`}
    >
      <span>{label}</span>
    </span>
  );
}

function ConfidenceGauge({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2" title={`Neural Confluence ${value}/100`}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-zinc-900 transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="font-mono text-xs font-bold text-zinc-900">{value}%</span>
    </div>
  );
}

function PriceCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "long" | "short";
}) {
  const toneClass =
    tone === "long"
      ? "text-emerald-700 font-black"
      : tone === "short"
      ? "text-rose-700 font-black"
      : "text-zinc-950 font-black";

  const bgBorderClass =
    tone === "long"
      ? "border-emerald-200 bg-emerald-50/60"
      : tone === "short"
      ? "border-rose-200 bg-rose-50/60"
      : "border-zinc-200 bg-zinc-50";

  return (
    <div className={`flex flex-col gap-1 rounded-xl border p-2.5 transition-colors ${bgBorderClass}`}>
      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <span className={`font-mono text-sm tracking-tight ${toneClass}`}>
        {formatPrice(value)}
      </span>
    </div>
  );
}

export function TradeTicket({
  signal,
  sample = false,
  showRationale = true,
  adminSlot,
}: {
  signal: Signal;
  sample?: boolean;
  showRationale?: boolean;
  adminSlot?: React.ReactNode;
}) {
  const isLong = signal.direction === "long";

  return (
    <article
      className={`relative overflow-hidden border bg-white shadow-sm transition-all duration-300 hover:border-zinc-400 hover:shadow-md hover:-translate-y-0.5 ${
        isLong
          ? "border-l-4 border-l-emerald-600 border-zinc-200"
          : "border-l-4 border-l-rose-600 border-zinc-200"
      }`}
    >
      {/* Ticket Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <DirectionBadge direction={signal.direction} />
          <span className="font-mono text-base font-black tracking-tight text-zinc-950">
            {signal.symbol}
          </span>
          <span className="rounded bg-white border border-zinc-200 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-zinc-700">
            {formatTimeframe(signal.timeframe)}
          </span>
          <StatusBadge status={signal.status} closedAt={signal.closedAt} />
        </div>
        <ConfidenceGauge value={signal.confidence} />
      </div>

      {/* Pricing Matrix */}
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-5">
        <PriceCell label="Entry" value={signal.entry} />
        <PriceCell label="Stop Loss" value={signal.stopLoss} tone="short" />
        <PriceCell
          label={
            signal.takeProfit2 != null || signal.takeProfit3 != null
              ? "TP1"
              : "Take Profit"
          }
          value={signal.takeProfit}
          tone="long"
        />
        {signal.takeProfit2 != null ? (
          <PriceCell label="TP2" value={signal.takeProfit2} tone="long" />
        ) : null}
        {signal.takeProfit3 != null ? (
          <PriceCell label="TP3" value={signal.takeProfit3} tone="long" />
        ) : null}
      </div>

      {/* AI Rationale / Order Flow thesis */}
      {showRationale && signal.rationale ? (
        <div className="border-t border-zinc-100 bg-zinc-50/60 px-4 py-3 text-xs leading-relaxed text-zinc-600">
          <div className="flex items-start gap-2">
            <span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[9px] font-black uppercase text-white shrink-0 mt-0.5">
              QUANT THESIS
            </span>
            <span className="text-zinc-700 font-medium">{signal.rationale}</span>
          </div>
        </div>
      ) : null}

      {/* Ticket Footer */}
      <div className="flex items-center justify-between border-t border-zinc-100 bg-white px-4 py-2.5 font-mono text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          <span>{sample ? "example signal" : formatRelativeTime(signal.createdAt)}</span>
        </span>
        <div className="flex items-center gap-3">
          {signal.newsHeadlines && signal.newsHeadlines.length > 0 ? (
            <span className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[10px] text-zinc-700">
              {signal.newsHeadlines.length} Headlines Checked
            </span>
          ) : null}
          {adminSlot}
        </div>
      </div>
    </article>
  );
}
