"use client";
import { Fragment, useMemo, useState } from "react";
import type { EconomicCalendarEvent, EconomicPrediction } from "@/lib/economic-calendar";
import { isEventReleased } from "@/lib/economic-calendar-utils";

function getActualComparison(
  actualStr?: string | null,
  forecastStr?: string | null
): "beat" | "miss" | "inline" | null {
  if (!actualStr || !forecastStr || forecastStr === "—" || forecastStr === "-") return null;
  const parseNum = (s: string) => {
    const cleaned = s.replace(/[^0-9.-]/g, "");
    if (!cleaned || cleaned === "-" || cleaned === ".") return null;
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  };
  const a = parseNum(actualStr);
  const f = parseNum(forecastStr);
  if (a === null || f === null) return null;
  if (Math.abs(a - f) < 0.0001) return "inline";
  return a > f ? "beat" : "miss";
}

export function EconomicCalendarView({
  initialEvents = [],
}: {
  initialEvents?: EconomicCalendarEvent[];
}) {
  const [impactFilter, setImpactFilter] = useState<"ALL" | "HIGH" | "MEDIUM">("ALL");
  const [dayFilter, setDayFilter] = useState<"all" | "today" | "tomorrow" | "this-week">("today");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UPCOMING" | "RELEASED">("ALL");
  const [selectedPrediction, setSelectedPrediction] = useState<EconomicPrediction | null>(null);

  const counts = useMemo(() => {
    let released = 0;
    let upcoming = 0;
    for (const e of initialEvents) {
      if (isEventReleased(e)) released++;
      else upcoming++;
    }
    return { all: initialEvents.length, released, upcoming };
  }, [initialEvents]);

  const filteredEvents = useMemo(() => {
    const list = initialEvents.filter((e) => {
      if (impactFilter === "HIGH" && e.impact !== "HIGH") return false;
      if (impactFilter === "MEDIUM" && e.impact === "LOW") return false;
      if (dayFilter !== "all" && e.dateTag !== dayFilter) return false;
      const isOut = isEventReleased(e);
      if (statusFilter === "UPCOMING" && isOut) return false;
      if (statusFilter === "RELEASED" && !isOut) return false;
      return true;
    });

    return list.slice().sort((a, b) => {
      const aReleased = isEventReleased(a);
      const bReleased = isEventReleased(b);
      if (aReleased && !bReleased) return 1;
      if (!aReleased && bReleased) return -1;
      return 0;
    });
  }, [initialEvents, impactFilter, dayFilter, statusFilter]);

  return (
    <div className="w-full space-y-5">
      {/* ── Filter Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Day Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100/80">
          {[
            { id: "today", label: "Today" },
            { id: "tomorrow", label: "Tomorrow" },
            { id: "this-week", label: "This Week" },
            { id: "all", label: "All" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDayFilter(tab.id as typeof dayFilter)}
              className={`px-3.5 py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                dayFilter === tab.id
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right-side Filters */}
        <div className="flex items-center gap-2">
          {/* Status pills */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100/80">
            {(
              [
                { id: "ALL", label: "All", count: counts.all },
                { id: "UPCOMING", label: "Upcoming", count: counts.upcoming },
                { id: "RELEASED", label: "Released", count: counts.released },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {st.label}
                <span className={`ml-1 text-[10px] ${statusFilter === st.id ? "text-zinc-400" : "text-zinc-400"}`}>
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* Impact pills */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100/80">
            {(["ALL", "HIGH", "MEDIUM"] as const).map((imp) => (
              <button
                key={imp}
                type="button"
                onClick={() => setImpactFilter(imp)}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  impactFilter === imp
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {imp === "HIGH" && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />}
                {imp === "MEDIUM" && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />}
                {imp === "HIGH" ? "High" : imp === "MEDIUM" ? "Medium+" : "All Impact"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80">
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Time</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Currency</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Event</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Impact</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Actual</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Forecast</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Previous</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">AI Insight</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-zinc-500">No events found</p>
                      <button
                        type="button"
                        onClick={() => {
                          setDayFilter("all");
                          setStatusFilter("ALL");
                          setImpactFilter("ALL");
                        }}
                        className="text-xs text-zinc-400 hover:text-zinc-700 underline underline-offset-4 cursor-pointer transition-colors"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt, idx) => {
                  const hasPrediction = Boolean(evt.prediction);
                  const isOut = isEventReleased(evt);
                  const comparison = isOut ? getActualComparison(evt.actual, evt.forecast) : null;

                  return (
                    <tr
                      key={`${evt.id}-${idx}`}
                      className={`border-b border-zinc-100 last:border-0 transition-colors ${
                        isOut
                          ? "bg-zinc-50/40 text-zinc-400"
                          : "hover:bg-zinc-50/60"
                      }`}
                    >
                      {/* Time */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`font-semibold ${isOut ? "text-zinc-400" : "text-zinc-900"}`}>
                          {evt.time}
                        </span>
                        <span className="text-[10px] text-zinc-400 block">{evt.dateFormatted}</span>
                      </td>

                      {/* Currency */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            isOut
                              ? "bg-zinc-100 text-zinc-400"
                              : "bg-zinc-900 text-white"
                          }`}
                        >
                          {evt.currency}
                        </span>
                      </td>

                      {/* Event */}
                      <td className="px-5 py-3.5">
                        <span className={`font-semibold ${isOut ? "text-zinc-400" : "text-zinc-900"}`}>
                          {evt.event}
                        </span>
                      </td>

                      {/* Impact */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 ${
                              isOut
                                ? "bg-zinc-300"
                                : evt.impact === "HIGH"
                                ? "bg-rose-500"
                                : evt.impact === "MEDIUM"
                                ? "bg-amber-500"
                                : "bg-zinc-300"
                            }`}
                          />
                          <span className={`text-[11px] font-medium capitalize ${isOut ? "text-zinc-400" : "text-zinc-600"}`}>
                            {evt.impact?.toLowerCase()}
                          </span>
                        </div>
                      </td>

                      {/* Actual */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {isOut ? (
                          evt.actual ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold text-[13px] ${
                                comparison === "beat"
                                  ? "text-emerald-600"
                                  : comparison === "miss"
                                  ? "text-rose-600"
                                  : "text-zinc-600"
                              }`}>
                                {evt.actual}
                              </span>
                              {comparison === "beat" && (
                                <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">▲</span>
                              )}
                              {comparison === "miss" && (
                                <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-1 py-0.5 rounded">▼</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-300">—</span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Forecast */}
                      <td className={`px-5 py-3.5 whitespace-nowrap font-medium ${isOut ? "text-zinc-300" : "text-zinc-700"}`}>
                        {evt.forecast || "—"}
                      </td>

                      {/* Previous */}
                      <td className={`px-5 py-3.5 whitespace-nowrap ${isOut ? "text-zinc-300" : "text-zinc-500"}`}>
                        {evt.previous || "—"}
                      </td>

                      {/* AI Insight */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {hasPrediction ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPrediction(evt.prediction ?? null)}
                            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                              isOut
                                ? "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {!isOut && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                            {evt.prediction?.bias}
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ) : (
                          <span className={`text-[11px] ${
                            isOut
                              ? "text-zinc-300"
                              : evt.algoAction?.includes("Active")
                              ? "text-rose-600 font-semibold"
                              : "text-zinc-400"
                          }`}>
                            {isOut ? "—" : (evt.algoAction || "—")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Gemini AI Prediction Report ── */}
      {selectedPrediction ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPrediction(null); }}
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-t-2xl">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                  Gemini AI Outlook
                </span>
                <h3 className="text-lg font-bold text-zinc-950 mt-0.5">
                  {selectedPrediction.currency} · {selectedPrediction.eventTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPrediction(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                aria-label="Close prediction details"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-zinc-50 p-3">
                  <span className="text-[10px] font-medium text-zinc-400 block">Forecast</span>
                  <span className="text-sm font-bold text-zinc-900">{selectedPrediction.forecast}</span>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3">
                  <span className="text-[10px] font-medium text-zinc-400 block">Confidence</span>
                  <span className="text-sm font-bold text-emerald-600">{selectedPrediction.confidence}%</span>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3">
                  <span className="text-[10px] font-medium text-zinc-400 block">{selectedPrediction.currency} Bias</span>
                  <span
                    className={`text-sm font-bold ${
                      selectedPrediction.bias === "BULLISH"
                        ? "text-emerald-600"
                        : selectedPrediction.bias === "BEARISH"
                        ? "text-rose-600"
                        : "text-zinc-600"
                    }`}
                  >
                    {selectedPrediction.bias}
                  </span>
                </div>
                <div className="rounded-lg bg-amber-50/80 p-3">
                  <span className="text-[10px] font-medium text-amber-700 block">Gold Bias</span>
                  <span
                    className={`text-sm font-bold ${
                      selectedPrediction.goldImpact === "BULLISH"
                        ? "text-emerald-600"
                        : selectedPrediction.goldImpact === "BEARISH"
                        ? "text-rose-600"
                        : "text-zinc-600"
                    }`}
                  >
                    {selectedPrediction.goldImpact}
                  </span>
                </div>
              </div>

              {/* Predicted Figure */}
              <div className="rounded-lg bg-zinc-50 p-4">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Predicted Figure
                </h4>
                <p className="text-sm font-medium text-zinc-900 leading-relaxed">
                  {selectedPrediction.predictedOutcome}
                </p>
              </div>

              {/* Executive Summary */}
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Executive Summary
                </h4>
                <p className="text-[13px] text-zinc-700 leading-relaxed">
                  {selectedPrediction.summary}
                </p>
              </div>

              {/* Macro Analysis */}
              <div className="rounded-lg bg-zinc-50 p-4">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Macro Analysis
                </h4>
                <div className="text-[13px] text-zinc-700 leading-relaxed whitespace-pre-line">
                  {selectedPrediction.macroAnalysis}
                </div>
              </div>

              {/* Trading Playbook */}
              <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 mb-2">
                  Execution & Risk Advisory
                </h4>
                <div className="text-[13px] text-amber-950 leading-relaxed whitespace-pre-line">
                  {selectedPrediction.tradingPlaybook}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-zinc-100 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-b-2xl flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">{selectedPrediction.modelName}</span>
              <button
                type="button"
                onClick={() => setSelectedPrediction(null)}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
