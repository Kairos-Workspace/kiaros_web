"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { EconomicCalendarEvent } from "@/lib/economic-calendar";
import { isEventReleased } from "@/lib/economic-calendar-utils";
import {
  predictEconomicEventAction,
  deleteEconomicPredictionAction,
} from "@/app/admin/actions";

export function AdminEconomicCalendar({
  events,
}: {
  events: EconomicCalendarEvent[];
}) {
  const [impactFilter, setImpactFilter] = useState<"ALL" | "HIGH" | "MEDIUM">("ALL");
  const [dayFilter, setDayFilter] = useState<"all" | "today" | "tomorrow" | "this-week">("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [predictingId, setPredictingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredEvents = useMemo(() => {
    const list = events.filter((e) => {
      if (impactFilter === "HIGH" && e.impact !== "HIGH") return false;
      if (impactFilter === "MEDIUM" && e.impact === "LOW") return false;
      if (dayFilter !== "all" && e.dateTag !== dayFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = e.event.toLowerCase().includes(q);
        const matchesCurrency = e.currency.toLowerCase().includes(q);
        if (!matchesName && !matchesCurrency) return false;
      }
      return true;
    });

    // Move all grayed-out / released news to the bottom:
    return list.slice().sort((a, b) => {
      const aReleased = isEventReleased(a);
      const bReleased = isEventReleased(b);
      if (aReleased && !bReleased) return 1;  // a goes to bottom
      if (!aReleased && bReleased) return -1; // b goes to bottom
      return 0;
    });
  }, [events, impactFilter, dayFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = events.length;
    const highs = events.filter((e) => e.impact === "HIGH").length;
    const predicted = events.filter((e) => Boolean(e.prediction)).length;
    return { total, highs, predicted };
  }, [events]);

  const handlePredictSubmit = (eventId: string, formData: FormData) => {
    setPredictingId(eventId);
    startTransition(async () => {
      await predictEconomicEventAction(formData);
      setPredictingId(null);
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Admin Telemetry KPI Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
        {/* Total Events */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Scheduled Catalysts
            </span>
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 tabular-nums">
              {stats.total}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Macro events loaded</p>
          </div>
        </div>

        {/* High Impact */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              High Impact Releases
            </span>
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-700 tabular-nums">
              {stats.highs}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">±15m News Shield target</p>
          </div>
        </div>

        {/* AI Predictions */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Gemini Projections
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums">
              {stats.predicted}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Live on client portal</p>
          </div>
        </div>

        {/* Client Viewer Portal */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Public Interface
            </span>
            <span className="text-zinc-400 text-xs">↗</span>
          </div>
          <div className="mt-2">
            <Link
              href="/calendar"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-zinc-950 hover:text-emerald-700 transition-colors"
            >
              <span>Open /calendar</span>
              <span>↗</span>
            </Link>
            <p className="text-[11px] text-zinc-400 mt-0.5">Real-time trader feed</p>
          </div>
        </div>
      </div>

      {/* 2. Sleek Filter & Search Bar */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Day Tabs */}
        <div className="inline-flex items-center rounded-xl bg-zinc-100 p-1 border border-zinc-200/60 font-mono text-xs overflow-x-auto">
          {[
            { id: "today", label: "Today" },
            { id: "tomorrow", label: "Tomorrow" },
            { id: "this-week", label: "This Week" },
            { id: "all", label: "All Upcoming" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDayFilter(tab.id as typeof dayFilter)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                dayFilter === tab.id
                  ? "bg-white text-zinc-950 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Impact Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter catalyst (e.g. CPI, NFP)..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 py-1.5 text-xs font-mono placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Impact Selector */}
          <div className="inline-flex items-center rounded-xl bg-zinc-100 p-1 border border-zinc-200/60 font-mono text-xs">
            {(["ALL", "HIGH", "MEDIUM"] as const).map((imp) => (
              <button
                key={imp}
                type="button"
                onClick={() => setImpactFilter(imp)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  impactFilter === imp
                    ? "bg-white text-zinc-950 shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                {imp === "HIGH" ? "High Impact" : imp === "MEDIUM" ? "Medium+" : "All"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Event Matrix List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center font-mono">
            <p className="text-sm font-bold text-zinc-900">No scheduled catalysts match filters</p>
            <p className="text-xs text-zinc-500 mt-1">Try resetting the day or impact filters above.</p>
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const isPredictingThis = isPending && predictingId === evt.id;
            const hasPrediction = Boolean(evt.prediction);
            const isExpanded = expandedId === evt.id;
            const isOut = isEventReleased(evt);

            return (
              <div
                key={`${evt.id}-${idx}`}
                className={`rounded-2xl border transition-all ${
                  isOut
                    ? "border-zinc-200/60 bg-zinc-50/50 opacity-60 hover:opacity-100 shadow-2xs"
                    : hasPrediction
                    ? "border-emerald-200/90 bg-white shadow-2xs"
                    : "border-zinc-200/80 bg-white shadow-2xs hover:border-zinc-300"
                }`}
              >
                {/* Event Summary Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left: Event Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
                    {/* Time & Session */}
                    <div className="font-mono text-xs whitespace-nowrap min-w-[110px]">
                      <span className="font-black text-zinc-950 block text-sm">{evt.time}</span>
                      <span className="text-[11px] text-zinc-500 block">{evt.dateFormatted}</span>
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-zinc-500 uppercase mt-0.5">
                          <span>✓</span> RELEASED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-700 uppercase mt-0.5">
                          <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> COMING OUT
                        </span>
                      )}
                    </div>

                    {/* Currency & Impact Badge */}
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-zinc-950 px-2.5 py-1 font-mono text-xs font-black text-white">
                        {evt.currency}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-lg border ${
                          evt.impact === "HIGH"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : evt.impact === "MEDIUM"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-zinc-50 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        {evt.impact === "HIGH" ? "HIGH" : evt.impact === "MEDIUM" ? "MED" : "LOW"}
                      </span>
                    </div>

                    {/* Event Title & Data */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-sans font-bold text-zinc-950 text-sm sm:text-base leading-snug">
                        {evt.event}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-500">
                        <span>
                          Forecast: <strong className="text-zinc-900">{evt.forecast}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Previous: <strong className="text-zinc-600">{evt.previous}</strong>
                        </span>
                        {evt.actual ? (
                          <>
                            <span>•</span>
                            <span>
                              Actual: <strong className="text-emerald-700 bg-emerald-50 px-1 rounded">{evt.actual}</strong>
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                    {/* Prediction Status Badge */}
                    {hasPrediction ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1 font-mono text-xs font-bold text-emerald-900 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Gemini Predicted</span>
                          <span className="text-[10px] text-emerald-700 uppercase">
                            ({evt.prediction?.bias} {evt.currency})
                          </span>
                        </span>

                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                          className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-mono font-bold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors cursor-pointer"
                        >
                          {isExpanded ? "Hide Details ↑" : "View Analysis ↓"}
                        </button>
                      </div>
                    ) : null}

                    {/* Gemini Predict Action Button */}
                    <form
                      action={(formData) => handlePredictSubmit(evt.id, formData)}
                      className="inline-flex"
                    >
                      <input type="hidden" name="id" value={evt.id} />
                      <input type="hidden" name="title" value={evt.event} />
                      <input type="hidden" name="currency" value={evt.currency} />
                      <input type="hidden" name="date" value={evt.rawDate} />
                      <input type="hidden" name="forecast" value={evt.forecast} />
                      <input type="hidden" name="previous" value={evt.previous} />
                      <input type="hidden" name="actual" value={evt.actual || ""} />
                      <input type="hidden" name="impact" value={evt.impact} />

                      <button
                        type="submit"
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                          hasPrediction
                            ? "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-200"
                            : "bg-zinc-950 text-white hover:bg-zinc-850 shadow-2xs"
                        } disabled:opacity-50`}
                      >
                        {isPredictingThis ? (
                          <>
                            <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            <span>Analyzing...</span>
                          </>
                        ) : hasPrediction ? (
                          <span>🔄 Re-analyze</span>
                        ) : (
                          <span>✨ Run Gemini AI</span>
                        )}
                      </button>
                    </form>

                    {/* Delete Prediction */}
                    {hasPrediction ? (
                      <form action={deleteEconomicPredictionAction} className="inline-flex">
                        <input type="hidden" name="id" value={evt.id} />
                        <button
                          type="submit"
                          title="Delete Prediction"
                          className="rounded-xl border border-zinc-200 bg-white p-2 text-xs text-zinc-400 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>

                {/* Expanded Gemini Prediction Details Card */}
                {hasPrediction && (isExpanded || isPredictingThis) ? (
                  <div className="border-t border-zinc-100 bg-zinc-50/60 p-5 sm:p-6 rounded-b-2xl space-y-4 font-mono text-xs">
                    {/* Header Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-black text-zinc-950">
                          Gemini Macro Intelligence Outlook
                        </span>
                        <span className="rounded-md bg-white border border-zinc-200 px-2 py-0.5 text-[10px] text-zinc-700 font-bold">
                          {evt.prediction?.modelName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-zinc-500">
                          Confidence: <strong className="text-zinc-950">{evt.prediction?.confidence}%</strong>
                        </span>
                        <span>•</span>
                        <span
                          className={`font-black px-2 py-0.5 rounded-md ${
                            evt.prediction?.bias === "BULLISH"
                              ? "bg-emerald-100 text-emerald-800"
                              : evt.prediction?.bias === "BEARISH"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-zinc-100 text-zinc-800"
                          }`}
                        >
                          {evt.currency}: {evt.prediction?.bias}
                        </span>
                        {evt.prediction?.goldImpact ? (
                          <span
                            className={`font-black px-2 py-0.5 rounded-md ${
                              evt.prediction?.goldImpact === "BULLISH"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : evt.prediction?.goldImpact === "BEARISH"
                                ? "bg-rose-100 text-rose-800 border border-rose-300"
                                : "bg-zinc-100 text-zinc-800"
                            }`}
                          >
                            XAUUSD: {evt.prediction?.goldImpact}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Predicted Outcome */}
                    <div className="rounded-xl bg-white border border-zinc-200 p-3.5">
                      <p className="text-[10px] uppercase font-bold text-zinc-400">
                        Predicted Figure & Consensus Deviation
                      </p>
                      <p className="mt-1 font-sans text-sm font-bold text-zinc-950 leading-relaxed">
                        {evt.prediction?.predictedOutcome}
                      </p>
                    </div>

                    {/* Executive Summary */}
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">
                        Executive Summary
                      </p>
                      <p className="mt-1 font-sans text-sm text-zinc-700 leading-relaxed">
                        {evt.prediction?.summary}
                      </p>
                    </div>

                    {/* Macro Analysis & Playbook Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="rounded-xl border border-zinc-200 bg-white p-4">
                        <p className="text-[10px] uppercase font-bold text-zinc-500 mb-2">
                          Macroeconomic & Orderflow Reasoning
                        </p>
                        <div className="font-sans text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
                          {evt.prediction?.macroAnalysis}
                        </div>
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                        <p className="text-[10px] uppercase font-bold text-amber-800 mb-2">
                          Institutional Execution & Shield Playbook
                        </p>
                        <div className="font-sans text-xs text-amber-950 leading-relaxed whitespace-pre-line">
                          {evt.prediction?.tradingPlaybook}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
