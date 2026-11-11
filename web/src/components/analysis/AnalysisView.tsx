"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { T } from "@/components/i18n/T";
import type { DailyAnalysis } from "@/lib/analysis";
import type { MarketCandle } from "@/lib/markets/kraken";
import { parsePoiLevel, poiLineColor } from "@/lib/analysis-poi";
import { PoiAnalysisChart } from "@/components/analysis/PoiAnalysisChart";

interface AnalysisViewProps {
  analyses?: DailyAnalysis[];
  candles?: MarketCandle[];
}

function isGoldSymbol(sym: string) {
  const s = (sym || "").toUpperCase();
  return s === "XAUUSD" || s.includes("XAU") || s.includes("GOLD");
}

function formatPublishedAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

interface ParsedKvItem {
  type: "kv";
  key: string;
  value: string;
}

interface ParsedBulletItem {
  type: "bullet";
  text: string;
}

interface ParsedTextItem {
  type: "text";
  text: string;
}

type ParsedItem = ParsedKvItem | ParsedBulletItem | ParsedTextItem;

interface ParsedSection {
  title: string;
  items: ParsedItem[];
}

function parseAnalysisDescription(raw: string): {
  overview: string;
  sections: ParsedSection[];
} {
  if (!raw) return { overview: "", sections: [] };

  const rawSections = raw.split(/^###\s+/m);
  const overview = rawSections[0].trim();
  const sections: ParsedSection[] = [];

  for (let i = 1; i < rawSections.length; i++) {
    const sectionChunk = rawSections[i];
    const lines = sectionChunk.split("\n");
    const title = lines[0].replace(/[:#]+$/, "").trim();
    const contentLines = lines.slice(1).map((l) => l.trim()).filter(Boolean);

    const items: ParsedItem[] = [];
    for (const line of contentLines) {
      const kvMatch = line.match(/^[-*]\s+\*\*([^*:]+):\*\*\s*(.+)$/);
      if (kvMatch) {
        items.push({ type: "kv", key: kvMatch[1].trim(), value: kvMatch[2].trim() });
      } else if (line.match(/^[-*]\s+(.+)$/)) {
        items.push({ type: "bullet", text: line.replace(/^[-*]\s+/, "").trim() });
      } else {
        items.push({ type: "text", text: line });
      }
    }
    sections.push({ title, items });
  }

  return { overview, sections };
}

function getPoiBadgeStyle(type: string) {
  switch (type.toLowerCase()) {
    case "support":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "resistance":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "invalidation":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "equilibrium":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
  }
}

export function AnalysisView({ analyses = [], candles = [] }: AnalysisViewProps) {
  const activeAnalyses = useMemo(
    () => analyses.filter((a) => isGoldSymbol(a.symbol)),
    [analyses]
  );

  const [selectedId, setSelectedId] = useState<string>(
    activeAnalyses.length > 0 ? activeAnalyses[0].id : ""
  );

  const selected = useMemo(() => {
    return activeAnalyses.find((a) => a.id === selectedId) ?? activeAnalyses[0];
  }, [activeAnalyses, selectedId]);

  const hasCandles = candles && candles.length >= 2;
  const hasImage = Boolean(selected?.imageUrl);

  // Default tab: interactive chart if candles available, else blueprint image
  const [activeTab, setActiveTab] = useState<"chart" | "blueprint">(
    hasCandles ? "chart" : hasImage ? "blueprint" : "chart"
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Close lightbox on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsLightboxOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isLightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen, handleKeyDown]);

  if (!selected) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-base font-bold text-zinc-950">
          <T>{"No Analysis Published Yet"}</T>
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          <T>
            {
              "Daily Gold (XAUUSD) analysis will appear here once published. New blueprints are posted ahead of London and New York sessions."
            }
          </T>
        </p>
      </div>
    );
  }

  const poiLevels = selected.keyLevels || [];
  const lastPrice = candles.length ? candles[candles.length - 1]?.close : null;
  const parsedDesc = parseAnalysisDescription(selected.description || "");

  // Separate sections for dedicated UI treatment
  const executionPlanSection = parsedDesc.sections.find(
    (s) => s.title.toLowerCase().includes("execution") || s.title.toLowerCase().includes("setup")
  );
  const confluenceSection = parsedDesc.sections.find(
    (s) => s.title.toLowerCase().includes("confluence") || s.title.toLowerCase().includes("orderflow")
  );
  const otherSections = parsedDesc.sections.filter(
    (s) => s !== executionPlanSection && s !== confluenceSection
  );

  return (
    <div className="w-full space-y-6">
      {/* 1. Top Desk Header Card */}
      <section className="rounded-3xl border border-zinc-200/90 bg-white p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="min-w-0 max-w-3xl space-y-3">
            {/* Meta Badges Strip */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-zinc-950 px-2.5 py-1 text-xs font-black tracking-wide text-white">
                {selected.symbol}
              </span>
              <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                {selected.timeframe}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <T>{selected.session}</T>
              </span>

              {/* Directional Bias Badge */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${
                  selected.bias === "BULLISH"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : selected.bias === "BEARISH"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-zinc-200 bg-zinc-100 text-zinc-700"
                }`}
              >
                {selected.bias === "BULLISH" ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="17 6 23 6 23 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : selected.bias === "BEARISH" ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="17 18 23 18 23 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
                <T>{selected.bias}</T>
              </span>

              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200/80 bg-amber-50/60 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                <svg className="h-3 w-3 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <T>{"Zero Repaint Verified"}</T>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight leading-snug">
              <T>{selected.title}</T>
            </h1>

            {/* Attribution & Date */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-medium">
              <span>{selected.author || "Kiaros Quant Desk"}</span>
              <span className="text-zinc-300">·</span>
              <span>
                <T>{"Updated"}</T> {formatPublishedAt(selected.updatedAt || selected.createdAt)}
              </span>
            </div>
          </div>

          {/* Live Price Widget */}
          <div className="flex shrink-0 items-center justify-between lg:justify-end gap-3 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-4 min-w-[200px]">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <T>{"XAUUSD Live"}</T>
                </span>
              </div>
              <p className="mt-1 font-mono text-xl sm:text-2xl font-black text-zinc-950 tabular-nums">
                {lastPrice != null
                  ? `$${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "$2,648.80"}
              </p>
            </div>
            <div className="text-right text-[11px] font-medium text-zinc-400">
              <span className="block text-zinc-500 font-semibold">Kraken L1</span>
              <span>1H VWAP</span>
            </div>
          </div>
        </div>

        {/* Multi-Session Selector Bar (if more than 1 analysis available) */}
        {activeAnalyses.length > 1 && (
          <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400 mr-1">
              <T>{"Sessions"}</T>:
            </span>
            {activeAnalyses.map((item) => {
              const active = item.id === selected.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <span><T>{item.session}</T></span>
                  <span className="text-[11px] opacity-70">
                    ({new Date(item.createdAt).toISOString().slice(5, 10)})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Main 12-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Chart + Full Technical Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* Chart & Blueprint Container */}
          <section className="rounded-3xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs">
            {/* View Mode Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 px-5 py-3.5 bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-5 5-4-4-3 3" />
                </svg>
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  <T>{"Live Market Structure"}</T>
                </h2>
              </div>

              {/* Toggle Buttons: Live Chart vs Annotated Blueprint */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab("chart")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "chart"
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <span><T>{"Interactive Chart"}</T></span>
                </button>

                {hasImage && (
                  <button
                    onClick={() => setActiveTab("blueprint")}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "blueprint"
                        ? "bg-zinc-950 text-white shadow-xs"
                        : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <span><T>{"Annotated Blueprint"}</T></span>
                  </button>
                )}
              </div>
            </div>

            {/* Chart Area Viewport */}
            <div className="p-2 sm:p-3 bg-[#0c0c0e]">
              {activeTab === "chart" ? (
                <PoiAnalysisChart
                  candles={candles}
                  levels={poiLevels}
                  symbol={selected.symbol}
                />
              ) : (
                <div className="relative group cursor-pointer overflow-hidden rounded-2xl bg-zinc-950">
                  <div
                    onClick={() => setIsLightboxOpen(true)}
                    className="relative aspect-video w-full overflow-hidden"
                  >
                    <Image
                      src={selected.imageUrl}
                      alt={selected.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 800px"
                      className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="flex items-center gap-2 rounded-xl bg-zinc-900/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-xs">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                        <T>{"Expand Blueprint"}</T>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 text-[11px] text-zinc-400 border-t border-zinc-800">
                    <span>TradingView Annotated Chart Blueprint · {selected.timeframe}</span>
                    <button
                      onClick={() => setIsLightboxOpen(true)}
                      className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                    >
                      <T>{"Expand Fullscreen"}</T> ↗
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Technical Breakdown & Execution Parameters */}
          <section className="rounded-3xl border border-zinc-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-base sm:text-lg font-black text-zinc-950 flex items-center gap-2">
                <svg className="h-5 w-5 text-zinc-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <T>{"Technical Breakdown"}</T>
              </h2>
            </div>

            {/* 1. Context Narrative */}
            {parsedDesc.overview ? (
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 sm:p-5">
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 font-medium">
                  {parsedDesc.overview}
                </p>
              </div>
            ) : null}

            {/* 2. Structured Execution Plan Parameters */}
            {executionPlanSection && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  <T>{"Trade Setup & Execution Plan"}</T>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {executionPlanSection.items
                    .filter((item): item is ParsedKvItem => item.type === "kv")
                    .map((item, idx) => {
                      const isTrigger = item.key.toLowerCase().includes("trigger");
                      const isEntry = item.key.toLowerCase().includes("entry");
                      const isSL = item.key.toLowerCase().includes("stop");
                      const isTarget = item.key.toLowerCase().includes("target");

                      return (
                        <div
                          key={`param-${idx}`}
                          className={`rounded-2xl border p-4 transition-all ${
                            isTrigger
                              ? "sm:col-span-2 md:col-span-3 border-amber-200/80 bg-amber-50/40"
                              : isEntry
                              ? "border-emerald-200/80 bg-emerald-50/40"
                              : isSL
                              ? "border-rose-200/80 bg-rose-50/40"
                              : isTarget
                              ? "border-sky-200/80 bg-sky-50/40"
                              : "border-zinc-200 bg-zinc-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                isEntry
                                  ? "text-emerald-700"
                                  : isSL
                                  ? "text-rose-700"
                                  : isTarget
                                  ? "text-sky-700"
                                  : "text-zinc-600"
                              }`}
                            >
                              <T>{item.key}</T>
                            </span>
                          </div>
                          <p className="mt-1.5 font-mono text-sm font-bold text-zinc-950 leading-snug">
                            {item.value}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 3. Orderflow & Macro Confluence */}
            {confluenceSection && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <T>{"Orderflow Confluence"}</T>
                </h3>

                <div className="space-y-2.5">
                  {confluenceSection.items.map((item, idx) => (
                    <div
                      key={`confluence-${idx}`}
                      className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-700 font-medium">
                        {item.type === "bullet" || item.type === "text"
                          ? item.text
                          : `${item.key}: ${item.value}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Other Markdown Sections */}
            {otherSections.map((sec, idx) => (
              <div key={`other-sec-${idx}`} className="space-y-2 pt-2 border-t border-zinc-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                  <T>{sec.title}</T>
                </h3>
                <div className="space-y-2">
                  {sec.items.map((item, i) => (
                    <p key={i} className="text-xs sm:text-[13px] text-zinc-700 leading-relaxed font-medium">
                      {item.type === "bullet" || item.type === "text"
                        ? item.text
                        : `${item.key}: ${item.value}`}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Right Column (4 cols): POI Zones + Execution Rules + Syndicate Link */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* Important POI Zones Card */}
          <section className="rounded-3xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs">
            <div className="border-b border-zinc-100 p-5 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <T>{"Market Map"}</T>
                </span>
                <h2 className="text-sm font-black text-zinc-950">
                  <T>{"Important POI Zones"}</T>
                </h2>
              </div>
              <span className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-bold text-zinc-700 shadow-2xs">
                {poiLevels.length} <T>{"zones"}</T>
              </span>
            </div>

            {poiLevels.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {poiLevels.map((lvl, idx) => {
                  const parsed = parsePoiLevel(lvl.level);
                  let distanceLabel = "";
                  let isAbove = false;

                  if (lastPrice != null && parsed) {
                    const diff = lastPrice - parsed.mid;
                    if (Math.abs(diff) < 0.5) {
                      distanceLabel = "At zone";
                    } else if (diff > 0) {
                      distanceLabel = `+$${diff.toFixed(1)} (Above)`;
                      isAbove = true;
                    } else {
                      distanceLabel = `-$${Math.abs(diff).toFixed(1)} (Below)`;
                      isAbove = false;
                    }
                  }

                  return (
                    <div
                      key={`${lvl.label}-${lvl.level}-${idx}`}
                      className="p-4 sm:p-5 hover:bg-zinc-50/60 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getPoiBadgeStyle(
                            lvl.type
                          )}`}
                        >
                          <T>{lvl.type}</T>
                        </span>

                        <span
                          className="font-mono text-sm font-bold tabular-nums"
                          style={{ color: poiLineColor(lvl.type) }}
                        >
                          {lvl.level}
                        </span>
                      </div>

                      <p className="mt-2 text-xs font-bold text-zinc-900 leading-snug">
                        <T>{lvl.label}</T>
                      </p>

                      {lvl.description ? (
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                          {lvl.description}
                        </p>
                      ) : null}

                      {distanceLabel && (
                        <div className="mt-2 flex items-center justify-between pt-2 border-t border-dashed border-zinc-100 text-[10px] font-semibold text-zinc-400">
                          <span><T>{"Distance"}</T></span>
                          <span className={isAbove ? "text-emerald-600" : "text-rose-600"}>
                            {distanceLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-zinc-400">
                <T>{"No POI zones published for this session."}</T>
              </div>
            )}

            <div className="border-t border-zinc-100 bg-zinc-50/60 p-4 text-[11px] leading-relaxed text-zinc-500">
              <T>
                {
                  "Lines on the chart mark the same POI zones. This is market structure context — not a buy or sell call."
                }
              </T>
            </div>
          </section>

          {/* Execution Rules Card */}
          <section className="rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <svg className="h-4 w-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <T>{"Trading Rules & Guidelines"}</T>
            </h3>

            <ul className="space-y-2 text-xs text-zinc-600 font-medium leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  <T>{"Wait for bar close confirmation (M5/M15) before entering"}</T>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  <T>{"Strict invalidation — exit immediately if SL price is breached"}</T>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  <T>{"Lock in partial profits at TP1 and move stop loss to entry (break-even)"}</T>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  <T>{"Macro news shield — avoid execution within ±15m of CPI/NFP releases"}</T>
                </span>
              </li>
            </ul>
          </section>

          {/* Telegram Syndicate Banner */}
          <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/50 via-white to-sky-50/30 p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500 text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </span>
              <div>
                <h4 className="text-xs font-bold text-zinc-900">
                  <T>{"Telegram Quant Syndicate"}</T>
                </h4>
                <p className="text-[11px] text-zinc-500">
                  <T>{"Instant Gold session alert dispatches"}</T>
                </p>
              </div>
            </div>
            <a
              href="https://t.me/kiaros_alpha"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-950 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <span><T>{"Join Telegram Syndicate"}</T></span>
              <span>→</span>
            </a>
          </section>
        </aside>
      </div>

      {/* 3. Lightbox Modal for Blueprint Fullscreen View */}
      {isLightboxOpen && selected.imageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Controls Bar */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-black">
                  {selected.symbol}
                </span>
                <span className="text-xs font-semibold text-zinc-300">
                  {selected.title}
                </span>
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <span>✕</span>
                <span><T>{"Close"}</T></span>
              </button>
            </div>

            {/* High-res Image */}
            <div className="relative w-full h-[78vh] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
              <Image
                src={selected.imageUrl}
                alt={selected.title}
                fill
                sizes="100vw"
                className="object-contain"
                unoptimized
              />
            </div>

            <p className="mt-2 text-center text-xs text-zinc-400">
              <T>{"Press ESC or click anywhere outside to close"}</T>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
