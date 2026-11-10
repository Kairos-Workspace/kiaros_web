"use client";

import { T } from "@/components/i18n/T";
import { useState } from "react";
import type { DailyAnalysis } from "@/lib/analysis";
import type { MarketCandle } from "@/lib/markets/kraken";
import { poiLineColor } from "@/lib/analysis-poi";
import { PoiAnalysisChart } from "@/components/analysis/PoiAnalysisChart";

interface AnalysisViewProps {
  analyses?: DailyAnalysis[];
  candles?: MarketCandle[];
}

function isGoldSymbol(sym: string) {
  const s = (sym || "").toUpperCase();
  return s === "XAUUSD" || s.includes("XAU") || s.includes("GOLD");
}

function biasTone(bias: DailyAnalysis["bias"]) {
  if (bias === "BULLISH") {
    return "bg-emerald-500/10 text-emerald-700 ring-emerald-200/80";
  }
  if (bias === "BEARISH") {
    return "bg-rose-500/10 text-rose-700 ring-rose-200/80";
  }
  return "bg-zinc-100 text-zinc-600 ring-zinc-200";
}

function formatPublishedAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Fixed UTC format avoids SSR/client locale hydration mismatch
  return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export function AnalysisView({ analyses = [], candles = [] }: AnalysisViewProps) {
  const activeAnalyses = analyses.filter((a) => isGoldSymbol(a.symbol));

  const [selectedId, setSelectedId] = useState<string>(
    activeAnalyses.length > 0 ? activeAnalyses[0].id : "",
  );

  if (!activeAnalyses || activeAnalyses.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200/80 bg-white px-8 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-100">
          <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="mt-5 text-base font-bold text-zinc-950">
          <T>{"No Analysis Published Yet"}</T>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          <T>
            {
              "Daily Gold (XAUUSD) analysis will appear here once published. New blueprints are posted ahead of London and New York sessions."
            }
          </T>
        </p>
      </div>
    );
  }

  const selected = activeAnalyses.find((a) => a.id === selectedId) ?? activeAnalyses[0];
  const poiLevels = (selected.keyLevels || []).slice(0, 5);
  const note = selected.description?.trim() || "";
  const last = candles.length ? candles[candles.length - 1]?.close : null;

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      {/* Desk header */}
      <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 via-white to-amber-50/40 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-zinc-950 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                  {selected.symbol}
                </span>
                <span className="text-[11px] font-medium text-zinc-500">
                  {selected.timeframe}
                </span>
                <span className="text-zinc-300">·</span>
                <span className="text-[11px] font-medium text-zinc-500">
                  <T>{selected.session}</T>
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${biasTone(selected.bias)}`}
                >
                  <T>{selected.bias}</T>
                </span>
              </div>

              <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                <T>{selected.title}</T>
              </h2>

              {note ? (
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-600 sm:text-sm">
                  {note}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-end">
              {last != null ? (
                <div className="rounded-xl bg-zinc-950 px-3.5 py-2.5 text-right text-white shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    <T>{"Last price"}</T>
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-bold tabular-nums">
                    ${last.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              ) : null}
              <p className="text-[11px] text-zinc-400">
                <T>{"Updated"}</T> {formatPublishedAt(selected.updatedAt || selected.createdAt)}
                {selected.author ? (
                  <span className="text-zinc-300">
                    {" · "}
                    {selected.author}
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          {activeAnalyses.length > 1 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
              {activeAnalyses.map((item) => {
                const active = item.id === selected.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ring-1 ${
                      active
                        ? "bg-zinc-950 text-white ring-zinc-950"
                        : "bg-white text-zinc-600 ring-zinc-200 hover:ring-zinc-300 hover:text-zinc-900"
                    }`}
                  >
                    <T>{item.session}</T>
                    <span className="text-zinc-400">
                      {" · "}
                      {new Date(item.createdAt).toISOString().slice(0, 10)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      {/* Chart + POI map */}
      <div className="grid grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8 xl:col-span-8">
          <PoiAnalysisChart
            candles={candles}
            levels={poiLevels}
            symbol={selected.symbol}
          />
        </div>

        <aside className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-24">
          <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-4 py-4 sm:px-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                <T>{"Market Map"}</T>
              </p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <h3 className="text-sm font-bold text-zinc-950">
                  <T>{"Important POI Zones"}</T>
                </h3>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600">
                  {poiLevels.length} <T>{"zones"}</T>
                </span>
              </div>
            </div>

            {poiLevels.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {poiLevels.map((lvl, idx) => (
                  <div
                    key={`${lvl.label}-${lvl.level}-${idx}`}
                    className="relative flex items-start gap-3 px-4 py-4 sm:px-5"
                  >
                    <span
                      className="mt-1.5 h-9 w-1 shrink-0 rounded-full"
                      style={{ background: poiLineColor(lvl.type) }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 text-[13px] font-semibold leading-snug text-zinc-900">
                          <T>{lvl.label}</T>
                        </p>
                        <span
                          className="shrink-0 font-mono text-[13px] font-bold tabular-nums"
                          style={{ color: poiLineColor(lvl.type) }}
                        >
                          {lvl.level}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                          style={{ background: poiLineColor(lvl.type) }}
                        >
                          <T>{lvl.type}</T>
                        </span>
                        {lvl.description ? (
                          <span className="min-w-0 text-[11px] leading-snug text-zinc-500">
                            {lvl.description}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-zinc-400">
                <T>{"No POI zones published for this session."}</T>
              </p>
            )}

            <div className="border-t border-zinc-100 bg-zinc-50/70 px-4 py-3 sm:px-5">
              <p className="text-[11px] leading-relaxed text-zinc-500">
                <T>
                  {
                    "Lines on the chart mark the same POI zones. This is market structure context — not a buy or sell call."
                  }
                </T>
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
