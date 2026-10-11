"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { EconomicCalendarEvent } from "@/lib/economic-calendar";
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
  const [dayFilter, setDayFilter] = useState<"all" | "today" | "tomorrow" | "this-week">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [predictingId, setPredictingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (impactFilter === "HIGH" && e.impact !== "HIGH") return false;
      if (impactFilter === "MEDIUM" && e.impact === "LOW") return false;
      if (dayFilter !== "all" && e.dateTag !== dayFilter) return false;
      return true;
    });
  }, [events, impactFilter, dayFilter]);

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
      {/* 1. Admin Telemetry Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
            Upcoming Events
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-zinc-950 tabular-nums">
            {stats.total}
          </p>
          <p className="text-[11px] text-zinc-500">Scheduled releases</p>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-2xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700">
            High Impact (Red)
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-rose-800 tabular-nums">
            {stats.highs}
          </p>
          <p className="text-[11px] text-rose-600">±15m News Shield rule</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">
            Gemini Predictions
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-emerald-800 tabular-nums">
            {stats.predicted}
          </p>
          <p className="text-[11px] text-emerald-700">Live on client calendar</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
            Client Preview
          </p>
          <Link
            href="/calendar"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-900 hover:text-emerald-700 hover:underline"
          >
            <span>Open /calendar</span>
            <span>↗</span>
          </Link>
          <p className="text-[10px] text-zinc-400">Public viewer portal</p>
        </div>
      </div>

      {/* 2. Filter & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs">
        {/* Days */}
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
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                dayFilter === tab.id
                  ? "bg-zinc-950 text-white shadow-2xs"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Impact & Currency */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Impact Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-xs font-mono">
            <span className="px-1.5 text-[10px] font-bold text-zinc-500 uppercase">Impact:</span>
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
                {imp === "HIGH" ? "🔴 High" : imp === "MEDIUM" ? "🟠 Med" : "All"}
              </button>
            ))}
          </div>

          {/* USD Focus Badge */}
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            <span className="font-bold text-zinc-950">USD Only</span>
            <span className="text-[10px] text-zinc-500 hidden sm:inline">(US Macro)</span>
          </div>
        </div>
      </div>

      {/* 3. Event List with Gemini Predict Trigger */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
            <p className="font-mono text-sm font-bold text-zinc-900">No events matching filters</p>
            <p className="text-xs text-zinc-500 mt-1">Adjust impact or currency filters above.</p>
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const isPredictingThis = isPending && predictingId === evt.id;
            const hasPrediction = Boolean(evt.prediction);
            const isExpanded = expandedId === evt.id;

            return (
              <div
                key={`${evt.id}-${idx}`}
                className={`rounded-xl border transition-all ${
                  hasPrediction
                    ? "border-emerald-300 bg-emerald-50/20 shadow-xs"
                    : evt.impact === "HIGH"
                    ? "border-zinc-200 bg-white hover:border-zinc-300 shadow-2xs"
                    : "border-zinc-200 bg-white shadow-2xs"
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
                      <span className="text-[10px] text-zinc-400 block">{evt.session} Session</span>
                    </div>

                    {/* Currency & Impact Badge */}
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-zinc-950 px-2.5 py-1 font-mono text-xs font-black text-white">
                        {evt.currency}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-black uppercase rounded ${
                          evt.impact === "HIGH"
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : evt.impact === "MEDIUM"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                        }`}
                      >
                        {evt.impact === "HIGH" ? "🔴 HIGH" : evt.impact === "MEDIUM" ? "🟠 MED" : "⚪ LOW"}
                      </span>
                    </div>

                    {/* Event Title */}
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
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-mono text-xs font-bold text-emerald-900 border border-emerald-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Gemini Predicted</span>
                          <span className="text-[10px] text-emerald-700 uppercase">
                            ({evt.prediction?.bias} {evt.currency})
                          </span>
                        </span>

                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                          className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-mono font-bold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors cursor-pointer"
                        >
                          {isExpanded ? "Hide Details" : "View Analysis"}
                        </button>
                      </div>
                    ) : null}

                    {/* Gemini Predict Form / Button */}
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
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                          hasPrediction
                            ? "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-300"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-700 shadow-xs"
                        } disabled:opacity-50`}
                      >
                        {isPredictingThis ? (
                          <>
                            <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            <span>Gemini Analyzing...</span>
                          </>
                        ) : hasPrediction ? (
                          <>
                            <span>🔄 Re-predict</span>
                          </>
                        ) : (
                          <>
                            <span>✨ Gemini Predict</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Delete Prediction if exists */}
                    {hasPrediction ? (
                      <form action={deleteEconomicPredictionAction} className="inline-flex">
                        <input type="hidden" name="id" value={evt.id} />
                        <button
                          type="submit"
                          title="Delete Prediction"
                          className="rounded-lg border border-zinc-200 bg-white p-1.5 text-xs text-zinc-400 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
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
                  <div className="border-t border-emerald-200 bg-white p-5 sm:p-6 rounded-b-xl space-y-4 font-mono text-xs">
                    {/* Header Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-black text-zinc-950">
                          Gemini Macro Intelligence Outlook
                        </span>
                        <span className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[10px] text-zinc-700 font-bold">
                          {evt.prediction?.modelName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-zinc-500">
                          Confidence: <strong className="text-zinc-950">{evt.prediction?.confidence}%</strong>
                        </span>
                        <span>•</span>
                        <span
                          className={`font-black px-2 py-0.5 rounded ${
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
                            className={`font-black px-2 py-0.5 rounded ${
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
                    <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3.5">
                      <p className="text-[11px] uppercase font-bold text-zinc-500">
                        Predicted Figure & Consensus Deviation
                      </p>
                      <p className="mt-1 font-sans text-sm font-bold text-zinc-950 leading-relaxed">
                        {evt.prediction?.predictedOutcome}
                      </p>
                    </div>

                    {/* Executive Summary */}
                    <div>
                      <p className="text-[11px] uppercase font-bold text-zinc-500">
                        Executive Summary
                      </p>
                      <p className="mt-1 font-sans text-sm text-zinc-700 leading-relaxed">
                        {evt.prediction?.summary}
                      </p>
                    </div>

                    {/* Macro Analysis & Playbook Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
                        <p className="text-[11px] uppercase font-bold text-zinc-500 mb-2">
                          Macroeconomic & Orderflow Reasoning
                        </p>
                        <div className="font-sans text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
                          {evt.prediction?.macroAnalysis}
                        </div>
                      </div>

                      <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4">
                        <p className="text-[11px] uppercase font-bold text-amber-800 mb-2">
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
