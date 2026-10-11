"use client";

import { useMemo, useState } from "react";
import type { EconomicCalendarEvent, EconomicPrediction } from "@/lib/economic-calendar";

export function EconomicCalendarView({
  initialEvents = [],
}: {
  initialEvents?: EconomicCalendarEvent[];
}) {
  const [impactFilter, setImpactFilter] = useState<"ALL" | "HIGH" | "MEDIUM">("ALL");
  const [dayFilter, setDayFilter] = useState<"all" | "today" | "tomorrow" | "this-week">("all");
  const [selectedPrediction, setSelectedPrediction] = useState<EconomicPrediction | null>(null);

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((e) => {
      if (impactFilter === "HIGH" && e.impact !== "HIGH") return false;
      if (impactFilter === "MEDIUM" && e.impact === "LOW") return false;
      if (dayFilter !== "all" && e.dateTag !== dayFilter) return false;
      return true;
    });
  }, [initialEvents, impactFilter, dayFilter]);

  return (
    <div className="w-full space-y-8">
      {/* 1. Interactive Filter Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-5">
        {/* Day Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Upcoming" },
            { id: "today", label: "Today" },
            { id: "tomorrow", label: "Tomorrow" },
            { id: "this-week", label: "This Week" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDayFilter(tab.id as typeof dayFilter)}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                dayFilter === tab.id
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Impact & Currency Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Impact Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 text-xs font-mono">
            <span className="px-2 text-[10px] font-bold text-zinc-500 uppercase">Impact:</span>
            {(["ALL", "HIGH", "MEDIUM"] as const).map((imp) => (
              <button
                key={imp}
                type="button"
                onClick={() => setImpactFilter(imp)}
                className={`px-2 py-0.5 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                  impactFilter === imp
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                {imp === "HIGH" ? "🔴 High" : imp === "MEDIUM" ? "🟠 Med+" : "All"}
              </button>
            ))}
          </div>

          {/* USD Focus Indicator */}
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span className="font-bold text-zinc-950">USD Only</span>
            <span className="text-[10px] text-zinc-500 hidden sm:inline">(US Macro Catalysts)</span>
          </div>
        </div>
      </div>

      {/* 3. Global Economic Schedule Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-mono text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Macroeconomic Event Matrix
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Showing {filteredEvents.length} scheduled institutional catalysts
            </p>
          </div>
          <div className="font-mono text-xs text-zinc-600 hidden sm:block">
            All times standardized to <span className="font-bold text-zinc-950">GMT / UTC</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-100/70 text-[11px] font-bold text-zinc-600 uppercase">
              <tr>
                <th className="px-6 py-3">Time & Date</th>
                <th className="px-6 py-3">Currency</th>
                <th className="px-6 py-3">Economic Catalyst</th>
                <th className="px-6 py-3">Impact</th>
                <th className="px-6 py-3">Actual</th>
                <th className="px-6 py-3">Forecast</th>
                <th className="px-6 py-3">Previous</th>
                <th className="px-6 py-3">Gemini AI / Shield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredEvents.map((evt, idx) => {
                const hasPrediction = Boolean(evt.prediction);

                return (
                  <tr key={`${evt.id}-${idx}`} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-zinc-950 block">{evt.time}</span>
                      <span className="text-[10px] text-zinc-500 block">{evt.dateFormatted}</span>
                    </td>
                    <td className="px-6 py-3.5 font-black text-sm whitespace-nowrap">
                      <span className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-xs text-zinc-900">
                        {evt.currency}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-zinc-950">
                      <span>{evt.event}</span>
                      <span className="text-[10px] text-zinc-500 block font-normal mt-0.5">
                        Session: {evt.session}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                          evt.impact === "HIGH"
                            ? "bg-rose-50 text-rose-800 border border-rose-300"
                            : evt.impact === "MEDIUM"
                            ? "bg-amber-50 text-amber-800 border border-amber-300"
                            : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                        }`}
                      >
                        {evt.impact === "HIGH" ? "🔴 HIGH" : evt.impact === "MEDIUM" ? "🟠 MED" : "⚪ LOW"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-black whitespace-nowrap">
                      {evt.actual ? (
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {evt.actual}
                        </span>
                      ) : (
                        <span className="text-zinc-400">PENDING</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-zinc-700 whitespace-nowrap">
                      {evt.forecast}
                    </td>
                    <td className="px-6 py-3.5 text-zinc-500 whitespace-nowrap">
                      {evt.previous}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {hasPrediction ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPrediction(evt.prediction ?? null)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-300 px-2.5 py-1 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>✨ Gemini: {evt.prediction?.bias}</span>
                          <span className="text-[10px] text-emerald-700">↗</span>
                        </button>
                      ) : (
                        <span
                          className={`text-[11px] font-semibold ${
                            evt.algoAction.includes("Active")
                              ? "text-rose-700 font-bold"
                              : "text-zinc-600"
                          }`}
                        >
                          {evt.algoAction}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {/* 5. Modal: In-depth Gemini AI Prediction Report */}
      {selectedPrediction ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-100 border border-emerald-300 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-900 uppercase">
                    ✨ GEMINI AI MACRO OUTLOOK
                  </span>
                  <span className="font-mono text-xs text-zinc-500">
                    {selectedPrediction.modelName}
                  </span>
                </div>
                <h3 className="mt-1.5 font-sans text-xl font-black text-zinc-950">
                  {selectedPrediction.currency} · {selectedPrediction.eventTitle}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPrediction(null)}
                className="rounded-lg border border-zinc-200 bg-zinc-100 p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-950 transition-colors cursor-pointer"
                aria-label="Close prediction details"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-4 font-mono text-xs">
              {/* Score and Bias Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Forecast</span>
                  <span className="text-sm font-black text-zinc-950">{selectedPrediction.forecast}</span>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Confidence</span>
                  <span className="text-sm font-black text-emerald-700">{selectedPrediction.confidence}%</span>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {selectedPrediction.currency} Bias
                  </span>
                  <span
                    className={`text-sm font-black ${
                      selectedPrediction.bias === "BULLISH"
                        ? "text-emerald-700"
                        : selectedPrediction.bias === "BEARISH"
                        ? "text-rose-700"
                        : "text-zinc-700"
                    }`}
                  >
                    {selectedPrediction.bias}
                  </span>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Gold (XAU) Bias</span>
                  <span
                    className={`text-sm font-black ${
                      selectedPrediction.goldImpact === "BULLISH"
                        ? "text-emerald-800"
                        : selectedPrediction.goldImpact === "BEARISH"
                        ? "text-rose-800"
                        : "text-zinc-800"
                    }`}
                  >
                    {selectedPrediction.goldImpact}
                  </span>
                </div>
              </div>

              {/* Predicted Figure */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5">
                <p className="text-[11px] uppercase font-bold text-zinc-500">
                  Predicted Figure Projection
                </p>
                <p className="mt-1 font-sans text-sm font-bold text-zinc-950 leading-relaxed">
                  {selectedPrediction.predictedOutcome}
                </p>
              </div>

              {/* Executive Summary */}
              <div>
                <p className="text-[11px] uppercase font-bold text-zinc-500">
                  Executive Summary
                </p>
                <p className="mt-1 font-sans text-xs text-zinc-700 leading-relaxed">
                  {selectedPrediction.summary}
                </p>
              </div>

              {/* Macro Analysis */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
                <p className="text-[11px] uppercase font-bold text-zinc-500 mb-2">
                  Macroeconomic Intelligence & Orderflow Drivers
                </p>
                <div className="font-sans text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
                  {selectedPrediction.macroAnalysis}
                </div>
              </div>

              {/* Trading Playbook */}
              <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4">
                <p className="text-[11px] uppercase font-bold text-amber-800 mb-2">
                  Institutional Execution & Risk Advisory
                </p>
                <div className="font-sans text-xs text-amber-950 leading-relaxed whitespace-pre-line">
                  {selectedPrediction.tradingPlaybook}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end border-t border-zinc-200 pt-3">
              <button
                type="button"
                onClick={() => setSelectedPrediction(null)}
                className="rounded-lg bg-zinc-950 px-4 py-2 font-mono text-xs font-bold text-white shadow-xs hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
