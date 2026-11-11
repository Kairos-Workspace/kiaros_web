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
      return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
    case "resistance":
      return "border-rose-200/80 bg-rose-50 text-rose-700";
    case "invalidation":
      return "border-amber-200/80 bg-amber-50 text-amber-700";
    case "equilibrium":
      return "border-sky-200/80 bg-sky-50 text-sky-700";
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

  const [activeTab, setActiveTab] = useState<"chart" | "blueprint">(
    hasCandles ? "chart" : hasImage ? "blueprint" : "chart"
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-xs">
        <h3 className="text-sm font-bold text-zinc-900">
          <T>{"No Analysis Published Yet"}</T>
        </h3>
        <p className="mt-1.5 text-xs text-zinc-500">
          <T>
            {
              "Daily Gold (XAUUSD) analysis will appear here once published."
            }
          </T>
        </p>
      </div>
    );
  }

  const poiLevels = selected.keyLevels || [];
  const parsedDesc = parseAnalysisDescription(selected.description || "");

  const executionPlanSection = parsedDesc.sections.find(
    (s) => s.title.toLowerCase().includes("execution") || s.title.toLowerCase().includes("setup")
  );
  const confluenceSection = parsedDesc.sections.find(
    (s) => s.title.toLowerCase().includes("confluence") || s.title.toLowerCase().includes("orderflow")
  );
  const otherSections = parsedDesc.sections.filter(
    (s) => s !== executionPlanSection && s !== confluenceSection
  );

  // Extract primary trigger vs numeric parameters
  const triggerItem = executionPlanSection?.items.find(
    (item): item is ParsedKvItem =>
      item.type === "kv" && item.key.toLowerCase().includes("trigger")
  );
  const parameterItems = executionPlanSection?.items.filter(
    (item): item is ParsedKvItem =>
      item.type === "kv" && !item.key.toLowerCase().includes("trigger")
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Session Switcher Pills (Only if > 1 analysis) */}
      {activeAnalyses.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {activeAnalyses.map((item) => {
            const active = item.id === selected.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <T>{item.session}</T>
                <span className="opacity-60 ml-1">
                  ({new Date(item.createdAt).toISOString().slice(5, 10)})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 1. Article Header & Meta */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500">
          <span className="font-bold text-zinc-950">{selected.symbol}</span>
          <span>·</span>
          <span>{selected.timeframe}</span>
          <span>·</span>
          <span><T>{selected.session}</T></span>
          <span>·</span>
          <span
            className={`font-bold ${
              selected.bias === "BULLISH"
                ? "text-emerald-600"
                : selected.bias === "BEARISH"
                ? "text-rose-600"
                : "text-zinc-600"
            }`}
          >
            <T>{selected.bias}</T>
          </span>
          <span>·</span>
          <span>{formatPublishedAt(selected.updatedAt || selected.createdAt)}</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
          <T>{selected.title}</T>
        </h1>
      </div>

      {/* 2. Hero Visual (Interactive Chart / Annotated Blueprint) */}
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-zinc-100 px-4 py-2.5 bg-zinc-50/70">
          {/* Segmented Switcher */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-200/70 p-0.5 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("chart")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "chart"
                  ? "bg-white text-zinc-950 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <T>{"Interactive Chart"}</T>
            </button>
            {hasImage && (
              <button
                onClick={() => setActiveTab("blueprint")}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "blueprint"
                    ? "bg-white text-zinc-950 shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <T>{"Annotated Blueprint"}</T>
              </button>
            )}
          </div>

          {/* POI Overlay Legend */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { type: "support", label: "Support", color: "#10b981" },
              { type: "resistance", label: "Resistance", color: "#f43f5e" },
              { type: "equilibrium", label: "Equilibrium", color: "#38bdf8" },
              { type: "invalidation", label: "Invalidation", color: "#f59e0b" },
            ].map((item) => (
              <span
                key={item.type}
                className="inline-flex items-center gap-1.5 rounded-md bg-white border border-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-600"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <T>{item.label}</T>
              </span>
            ))}
          </div>
        </div>

        {/* Viewport: Seamless Edge-to-Edge Canvas */}
        <div className="relative h-[420px] sm:h-[480px] lg:h-[520px] w-full bg-[#0c0c0e]">
          {activeTab === "chart" ? (
            <PoiAnalysisChart
              candles={candles}
              levels={poiLevels}
              symbol={selected.symbol}
              frameless
            />
          ) : (
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative h-full w-full cursor-pointer overflow-hidden group flex items-center justify-center p-2"
            >
              <Image
                src={selected.imageUrl}
                alt={selected.title}
                fill
                sizes="(max-width: 1024px) 100vw, 1000px"
                className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
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
          )}
        </div>
      </section>

      {/* 3. Trade Setup & Execution Plan (If Available) */}
      {executionPlanSection && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-900">
              <T>{"Trade Setup & Execution Plan"}</T>
            </h2>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                selected.bias === "BULLISH"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                  : selected.bias === "BEARISH"
                  ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                  : "bg-zinc-50 text-zinc-700 border border-zinc-200"
              }`}
            >
              <T>{selected.bias}</T>
            </span>
          </div>

          {/* Primary Trigger Note */}
          {triggerItem && (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3 sm:p-3.5 text-xs text-amber-950">
              <span className="font-bold text-amber-900 uppercase tracking-wide text-[10px] block mb-0.5">
                <T>{triggerItem.key}</T>
              </span>
              <p className="font-medium leading-relaxed">{triggerItem.value}</p>
            </div>
          )}

          {/* Parameters Grid */}
          {parameterItems && parameterItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
              {parameterItems.map((item, idx) => {
                const keyLower = item.key.toLowerCase();
                const isStop = keyLower.includes("stop");
                const isTarget = keyLower.includes("target");
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 space-y-1"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block truncate">
                      <T>{item.key}</T>
                    </span>
                    <span
                      className={`font-mono text-xs sm:text-sm font-bold block truncate ${
                        isStop
                          ? "text-rose-600"
                          : isTarget
                          ? "text-emerald-600"
                          : "text-zinc-900"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 4. Important POI Zones (Clean Minimalist Table) */}
      {poiLevels.length > 0 && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-900">
              <T>{"Important POI Zones"}</T>
            </h2>
            <span className="text-xs text-zinc-400 font-medium">
              {poiLevels.length} <T>{"zones"}</T>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="pb-2.5 font-medium"><T>{"Zone Type"}</T></th>
                  <th className="pb-2.5 font-medium"><T>{"Price Level"}</T></th>
                  <th className="pb-2.5 font-medium"><T>{"Description"}</T></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {poiLevels.map((lvl, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getPoiBadgeStyle(
                          lvl.type
                        )}`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: poiLineColor(lvl.type) }}
                        />
                        <T>{lvl.type}</T>
                      </span>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-zinc-900 whitespace-nowrap pr-4">
                      {lvl.level}
                    </td>
                    <td className="py-2.5 text-zinc-600">
                      <span className="font-semibold text-zinc-900 block">{lvl.label}</span>
                      {lvl.description && (
                        <span className="text-zinc-500 text-[11px] block">{lvl.description}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 5. Analysis Narrative & Confluence */}
      {(parsedDesc.overview || confluenceSection || otherSections.length > 0) && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7 shadow-xs space-y-6">
          {/* Market Context narrative */}
          {parsedDesc.overview && (
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-zinc-900">
                <T>{"Market Context & Analysis"}</T>
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-700">
                {parsedDesc.overview}
              </p>
            </div>
          )}

          {/* Orderflow Confluence */}
          {confluenceSection && (
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <h2 className="text-sm font-bold text-zinc-900">
                <T>{"Orderflow Confluence"}</T>
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-zinc-700 leading-relaxed">
                {confluenceSection.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>
                      {item.type === "bullet" || item.type === "text"
                        ? item.text
                        : `${item.key}: ${item.value}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Other Sections */}
          {otherSections.map((sec, idx) => (
            <div key={idx} className="space-y-2 pt-4 border-t border-zinc-100">
              <h2 className="text-sm font-bold text-zinc-900">
                <T>{sec.title}</T>
              </h2>
              <div className="space-y-1.5 text-xs sm:text-sm text-zinc-700 leading-relaxed">
                {sec.items.map((item, i) => (
                  <p key={i}>
                    {item.type === "bullet" || item.type === "text"
                      ? item.text
                      : `${item.key}: ${item.value}`}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 6. Clean Disclaimer */}
      <div className="text-center py-4 text-xs text-zinc-400">
        <T>
          {"Educational quantitative research only — not financial advice. Past performance does not guarantee future results."}
        </T>
      </div>

      {/* 7. Lightbox Modal */}
      {isLightboxOpen && selected.imageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-semibold text-zinc-300">
                {selected.symbol} · {selected.title}
              </span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-bold text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                ✕ <T>{"Close"}</T>
              </button>
            </div>

            <div className="relative w-full h-[78vh] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
              <Image
                src={selected.imageUrl}
                alt={selected.title}
                fill
                sizes="100vw"
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}