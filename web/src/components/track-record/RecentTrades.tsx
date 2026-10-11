"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { ClosedTrade } from "@/lib/track-record";
import { tradeR } from "@/lib/track-record";
import { formatPrice } from "@/lib/format";
import { relativeTime } from "@/lib/relative-time";

function outcomeLabel(reached: number): string {
  if (reached >= 3) return "TP3";
  if (reached >= 2) return "TP2";
  if (reached >= 1) return "TP1";
  return "SL";
}

function ClosedTradeCard({ trade }: { trade: ClosedTrade }) {
  const isLong = trade.direction === "long";
  const r = tradeR(trade);
  const win = trade.reached >= 1;
  const isSl = trade.status === "sl_hit" && trade.reached === 0;
  const label = outcomeLabel(trade.reached);
  const rText = `${r > 0 ? "+" : ""}${r.toFixed(2)}R`;
  const strategy = trade.strategy.replace(/_/g, " ").toUpperCase();

  const body = (
    <>
      {trade.outcomeChartUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-zinc-200 bg-zinc-50">
          <Image
            src={trade.outcomeChartUrl}
            alt={`${trade.symbol} outcome chart`}
            loading="lazy"
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2.5 right-2.5 rounded bg-zinc-950/80 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-xs">
            VERIFIED CHART ↗
          </div>
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center border-b border-zinc-200 bg-zinc-50">
          <span className="font-mono text-xs text-zinc-400">STP Execution Logged</span>
        </div>
      )}

      <div className="relative flex items-start justify-between gap-3 p-5 pl-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-lg font-black tracking-tight text-zinc-950">
              {trade.symbol}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase font-mono ${
                isLong
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {isLong ? "BUY" : "SELL"}
            </span>
          </div>
          <p className="mt-1 truncate font-mono text-xs text-zinc-500">
            {trade.timeframe} · {strategy}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <span
            className={`inline-block font-mono text-xs font-black px-2 py-0.5 rounded ${
              win
                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                : "bg-rose-100 text-rose-900 border border-rose-300"
            }`}
          >
            {label}
          </span>
          <p
            className={`mt-1 font-mono text-xs font-black ${
              r > 0 ? "text-emerald-700" : r < 0 ? "text-rose-700" : "text-zinc-500"
            }`}
          >
            {rText}
          </p>
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-3 border-t border-zinc-100 bg-zinc-50/50 px-5 py-3 pl-6 font-mono">
        <div>
          <p className="text-[10px] font-bold uppercase text-zinc-400">Entry</p>
          <p className="mt-0.5 text-xs font-bold text-zinc-950">
            {formatPrice(trade.entry)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-zinc-400">Stop</p>
          <p className="mt-0.5 text-xs font-bold text-rose-700">
            {formatPrice(trade.stopLoss)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-zinc-400">Target</p>
          <p className="mt-0.5 text-xs font-bold text-emerald-700 truncate">
            {trade.targets.map((p) => formatPrice(p)).join(" / ") || "—"}
          </p>
        </div>
      </div>

      <div className="relative border-t border-zinc-100 px-5 py-2.5 pl-6 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>Closed {relativeTime(trade.closedAt)}</span>
        <span className="text-[10px] text-zinc-400">Bar-Close STP</span>
      </div>
    </>
  );

  const cardClasses = `group relative w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left transition-all hover:shadow-md hover:border-zinc-300 ${
    isSl ? "opacity-85 hover:opacity-100" : ""
  }`;

  if (trade.outcomeChartUrl) {
    return (
      <a
        href={trade.outcomeChartUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardClasses} block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950`}
      >
        <div
          className={`absolute bottom-0 left-0 top-0 w-1.5 ${
            isLong ? "bg-emerald-500" : "bg-rose-500"
          }`}
        />
        {body}
      </a>
    );
  }

  return (
    <div className={cardClasses}>
      <div
        className={`absolute bottom-0 left-0 top-0 w-1.5 ${
          isLong ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      {body}
    </div>
  );
}

export function RecentTrades({ trades = [] }: { trades?: ClosedTrade[] }) {
  const [filter, setFilter] = useState<"ALL" | "WINS" | "LOSSES">("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (filter === "WINS" && t.reached === 0) return false;
      if (filter === "LOSSES" && t.reached > 0) return false;
      if (query.trim()) {
        const q = query.trim().toUpperCase();
        if (!t.symbol.toUpperCase().includes(q) && !t.strategy.toUpperCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [trades, filter, query]);

  if (trades.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
        <p className="font-mono text-sm font-bold text-zinc-900">No closed trades yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500">
          Results will appear here as trades close.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {(["ALL", "WINS", "LOSSES"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer ${
                filter === tab
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
            >
              {tab === "ALL" ? `All (${trades.length})` : tab === "WINS" ? "Wins (TP)" : "Losses (SL)"}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symbol (e.g. XAUUSD, BTC)..."
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <p className="font-mono text-xs text-zinc-500">No trades match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((trade) => (
            <ClosedTradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}
    </div>
  );
}
