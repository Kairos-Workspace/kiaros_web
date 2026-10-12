"use client";

import { useState } from "react";
import Image from "next/image";
import type { DailyAnalysis } from "@/lib/analysis";
import { TELEGRAM_GROUP_URL } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import { useModalDismiss } from "@/lib/use-modal-dismiss";
import { TelegramIcon } from "@/components/shared/TelegramIcon";

interface AnalysisViewProps {
  analyses?: DailyAnalysis[];
}

type ExtractedPlan = {
  trigger?: string;
  entry?: string;
  stopLoss?: string;
  targets: string[];
  riskReward?: string;
};

function extractExecutionPlan(raw: string): ExtractedPlan {
  const plan: ExtractedPlan = { targets: [] };
  if (!raw) return plan;

  const lines = raw.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("- **") && !trimmed.startsWith("* **")) continue;
    const match = trimmed.match(/^[-*]\s+\*\*([^:]+):\*\*\s*(.+)$/i);
    if (!match) continue;
    const key = match[1].toLowerCase().trim();
    const val = match[2].trim();
    if (key.includes("trigger") || key.includes("bias")) {
      plan.trigger = val;
    } else if (key.includes("entry")) {
      plan.entry = val;
    } else if (key.includes("stop")) {
      plan.stopLoss = val;
    } else if (key.includes("target") || key.includes("take profit") || key.includes("tp")) {
      plan.targets.push(val);
    } else if (key.includes("risk") || key.includes("reward") || key.includes("r:r")) {
      plan.riskReward = val;
    }
  }
  return plan;
}

export function AnalysisView({ analyses = [] }: AnalysisViewProps) {
  const [selectedId, setSelectedId] = useState<string>(
    analyses.length > 0 ? analyses[0].id : ""
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Hook for ESC key dismissal and scroll locking
  useModalDismiss(isLightboxOpen, () => setIsLightboxOpen(false));

  if (!analyses || analyses.length === 0) {
    return (
      <div className="w-full border border-zinc-200 bg-white p-16 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center bg-zinc-100 text-zinc-500 font-mono text-xl">
          📊
        </div>
        <h3 className="mt-4 text-base font-bold text-zinc-950 font-mono uppercase tracking-wider">
          No Daily Analyses Published Yet
        </h3>
        <p className="mt-2 text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
          The quantitative desk has not published active session breakdowns for today yet. 
          New technical blueprints are posted ahead of London and New York killzones.
        </p>
      </div>
    );
  }

  const selected = analyses.find((a) => a.id === selectedId) ?? analyses[0];
  const executionPlan = extractExecutionPlan(selected.description);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Asset Navigation Ribbon */}
      <div className="border border-zinc-200/80 bg-white p-2 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {analyses.map((item) => {
            const active = item.id === selected.id;
            const isBullish = item.bias === "BULLISH";
            const isBearish = item.bias === "BEARISH";

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`group shrink-0 flex items-center gap-3 px-3.5 py-2 border transition-all cursor-pointer text-left ${
                  active
                    ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                    : "border-zinc-200/80 bg-zinc-50/60 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black tracking-tight">
                      {item.symbol}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider ${
                        active
                          ? isBullish
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : isBearish
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          : isBullish
                          ? "bg-emerald-100 text-emerald-800"
                          : isBearish
                          ? "bg-rose-100 text-rose-800"
                          : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {isBullish ? "▲" : isBearish ? "▼" : "●"} {item.bias}
                    </span>
                  </div>
                  <div className={`mt-0.5 flex items-center gap-1.5 font-mono text-[10px] ${active ? "text-zinc-400" : "text-zinc-500"}`}>
                    <span>{item.timeframe}</span>
                    <span>•</span>
                    <span className="truncate max-w-[120px]">{item.session}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Cockpit Meta Action Bar */}
      <div className="border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-zinc-100 pb-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                {selected.symbol}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 font-mono text-xs font-black uppercase tracking-wider ${
                  selected.bias === "BULLISH"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : selected.bias === "BEARISH"
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : "border-zinc-300 bg-zinc-100 text-zinc-800"
                }`}
              >
                <span>{selected.bias === "BULLISH" ? "▲" : selected.bias === "BEARISH" ? "▼" : "●"}</span>
                <span>{selected.bias} BIAS</span>
              </span>

              <span className="border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-mono text-xs font-bold text-zinc-700">
                {selected.timeframe}
              </span>

              <span className="border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-mono text-xs text-zinc-600">
                {selected.session}
              </span>

              <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50/60 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                ACTIVE BLUEPRINT
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-zinc-950 leading-snug">
              {selected.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-mono pt-0.5">
              <span>Author: <strong className="text-zinc-800 font-semibold">{selected.author}</strong></span>
              <span>•</span>
              <span>Updated: {formatRelativeTime(selected.createdAt)}</span>
              <span>•</span>
              <span>
                {new Date(selected.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Quick Cockpit Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="inline-flex items-center gap-1.5 border border-zinc-200 bg-white px-3 py-2 text-xs font-mono font-bold text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 transition-colors cursor-pointer shadow-2xs"
            >
              <span>⛶ Enlarge Chart</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 border border-zinc-200 bg-white px-3 py-2 text-xs font-mono font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer shadow-2xs"
            >
              <span>{copiedLink ? "✓ Copied" : "Share"}</span>
            </button>

            <a
              href={TELEGRAM_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-zinc-950 px-3.5 py-2 text-xs font-mono font-bold text-white hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
            >
              <TelegramIcon size={14} />
              <span>Get Live Alerts</span>
              <span>→</span>
            </a>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
          <div className="border border-zinc-100 bg-zinc-50/70 p-2.5">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Asset Instrument</p>
            <p className="mt-0.5 font-black text-zinc-950">{selected.symbol}</p>
          </div>
          <div className="border border-zinc-100 bg-zinc-50/70 p-2.5">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Structure Focus</p>
            <p className="mt-0.5 font-bold text-zinc-950">{selected.timeframe}</p>
          </div>
          <div className="border border-zinc-100 bg-zinc-50/70 p-2.5">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Execution Window</p>
            <p className="mt-0.5 font-bold text-zinc-950 truncate">{selected.session}</p>
          </div>
          <div className="border border-zinc-100 bg-zinc-50/70 p-2.5">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Orderflow Posture</p>
            <p
              className={`mt-0.5 font-bold ${
                selected.bias === "BULLISH"
                  ? "text-emerald-700"
                  : selected.bias === "BEARISH"
                  ? "text-rose-700"
                  : "text-zinc-700"
              }`}
            >
              {selected.bias === "BULLISH" ? "Long / Accumulation" : selected.bias === "BEARISH" ? "Short / Distribution" : "Neutral / Consolidation"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Master 2-Column Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Visual Chart & In-Depth Technical Narrative */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          {/* Chart Terminal Canvas */}
          <div className="border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 bg-zinc-100/80 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black bg-zinc-950 text-white px-2 py-0.5 uppercase tracking-wider">
                  ORDERFLOW CHART
                </span>
                <span className="font-mono text-xs font-bold text-zinc-900">
                  {selected.symbol} • {selected.timeframe}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="font-mono text-[11px] font-semibold text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer flex items-center gap-1"
                title="Open fullscreen view"
              >
                <span>⛶ Click to Enlarge</span>
              </button>
            </div>

            {/* High-Resolution Chart Viewport */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="group relative w-full aspect-[16/10] bg-zinc-950/5 cursor-zoom-in overflow-hidden transition-all hover:bg-zinc-950/10"
            >
              <Image
                src={selected.imageUrl}
                alt={selected.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 840px"
                className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-zinc-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="bg-zinc-950/85 text-white font-mono text-xs px-3.5 py-1.5 shadow-lg font-semibold border border-zinc-700">
                  🔍 View Fullscreen Chart [ESC to close]
                </span>
              </div>
            </div>

            {/* Chart Sub-Footer */}
            <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-4 py-2 font-mono text-[11px] text-zinc-500">
              <span>*High-resolution technical breakdown with price structure & liquidity pools</span>
              <a
                href={selected.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-900 underline"
              >
                Direct Image ↗
              </a>
            </div>
          </div>

          {/* Deep-Dive Technical Narrative & Playbook */}
          <div className="border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <div className="border-b border-zinc-100 pb-3 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-zinc-950 text-white px-2 py-0.5">
                  DEEP DIVE
                </span>
                <h3 className="font-mono text-sm font-bold text-zinc-950 uppercase tracking-wider">
                  Technical Analysis Breakdown & Market Context
                </h3>
              </div>
              <span className="font-mono text-xs text-zinc-500">
                {selected.symbol} Playbook
              </span>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-zinc-700">
              {formatDescription(selected.description)}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Execution Blueprint, Key Levels Matrix & Live Dispatches */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">

          {/* 1. Execution Setup Card (Top priority for traders) */}
          <div className="border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-zinc-200 bg-zinc-950 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-emerald-400">⚡</span>
                <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                  Execution Blueprint
                </h3>
              </div>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 uppercase ${
                  selected.bias === "BULLISH"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : selected.bias === "BEARISH"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {selected.bias} POSTURE
              </span>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono">
              {/* Trigger description if extracted */}
              {executionPlan.trigger ? (
                <div className="border-l-2 border-zinc-900 bg-zinc-50 p-3">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Primary Execution Trigger</span>
                  <span className="text-zinc-900 font-semibold text-xs mt-0.5 block">
                    {executionPlan.trigger}
                  </span>
                </div>
              ) : null}

              {/* Trade Parameter Stack */}
              <div className="space-y-2.5">
                {executionPlan.entry ? (
                  <div className="flex items-center justify-between border border-zinc-200/80 bg-zinc-50/60 p-2.5">
                    <span className="text-zinc-500 text-[11px] font-semibold uppercase">Optimal Entry Zone</span>
                    <span className="font-black text-zinc-950 text-xs sm:text-sm">{executionPlan.entry}</span>
                  </div>
                ) : null}

                {executionPlan.stopLoss ? (
                  <div className="flex items-center justify-between border border-rose-200 bg-rose-50/50 p-2.5">
                    <span className="text-rose-700 text-[11px] font-bold uppercase">Invalidation / Stop Loss</span>
                    <span className="font-black text-rose-900 text-xs sm:text-sm">{executionPlan.stopLoss}</span>
                  </div>
                ) : null}

                {executionPlan.targets && executionPlan.targets.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Profit Target Objectives</span>
                    {executionPlan.targets.map((tp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between border border-emerald-200 bg-emerald-50/50 p-2 text-xs"
                      >
                        <span className="text-emerald-800 font-bold text-[11px]">
                          Target {idx + 1}
                        </span>
                        <span className="font-black text-emerald-950">{tp}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {executionPlan.riskReward ? (
                  <div className="flex items-center justify-between border border-zinc-200 bg-zinc-50 p-2">
                    <span className="text-zinc-500 text-[11px] uppercase font-bold">Risk / Reward Ratio</span>
                    <span className="font-black text-zinc-950">{executionPlan.riskReward}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* 2. Key Institutional Price Levels Matrix */}
          {selected.keyLevels && selected.keyLevels.length > 0 ? (
            <div className="border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-xs font-black text-zinc-950 uppercase tracking-wider">
                    Institutional Orderbook Levels
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    Key liquidity maps for {selected.symbol}
                  </p>
                </div>
                <span className="font-mono text-[10px] bg-zinc-200 text-zinc-800 px-2 py-0.5 font-bold">
                  {selected.keyLevels.length} LEVELS
                </span>
              </div>

              <div className="divide-y divide-zinc-100">
                {selected.keyLevels.map((lvl, idx) => {
                  const isResistance = lvl.type === "resistance";
                  const isSupport = lvl.type === "support";
                  const isInvalidation = lvl.type === "invalidation";

                  return (
                    <div
                      key={idx}
                      className="p-3.5 hover:bg-zinc-50/80 transition-colors font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900 truncate max-w-[200px]">
                          {lvl.label}
                        </span>
                        <span
                          className={`font-black text-xs sm:text-sm px-2 py-0.5 ${
                            isResistance
                              ? "text-rose-900 bg-rose-50 border border-rose-200"
                              : isSupport
                              ? "text-emerald-900 bg-emerald-50 border border-emerald-200"
                              : isInvalidation
                              ? "text-amber-900 bg-amber-50 border border-amber-200"
                              : "text-zinc-900 bg-zinc-100 border border-zinc-200"
                          }`}
                        >
                          {lvl.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span className="uppercase font-bold tracking-wider">
                          Type: {lvl.type}
                        </span>
                        {lvl.description ? (
                          <span className="truncate max-w-[190px] text-right text-zinc-600">
                            {lvl.description}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* 3. Telegram Live Signals Dispatch Bridge */}
          <div className="border border-zinc-950 bg-zinc-950 p-5 text-white shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Automated Execution Engine
              </span>
            </div>
            
            <h4 className="text-sm font-bold text-white leading-snug">
              Live Trigger Dispatches for {selected.symbol}
            </h4>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              When price taps these daily orderflow zones, our Algo + LLM dual engine verifies the bar close and pushes execution alerts directly to Telegram.
            </p>

            <a
              href={TELEGRAM_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 bg-white text-zinc-950 font-mono text-xs font-black py-2.5 hover:bg-zinc-100 transition-colors shadow-sm cursor-pointer"
            >
              <TelegramIcon size={16} className="text-zinc-950" />
              <span>Join Telegram Syndicate</span>
              <span>→</span>
            </a>
          </div>

        </div>

      </div>

      {/* 4. Fullscreen High-Resolution Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col max-w-7xl max-h-[94vh] w-full bg-zinc-950 overflow-hidden border border-zinc-800 shadow-2xl cursor-default"
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/95 text-white">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-black text-emerald-400">
                  {selected.symbol}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  • {selected.timeframe}
                </span>
                <span className="font-sans text-xs text-zinc-300 font-medium truncate max-w-lg hidden sm:inline">
                  {selected.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="font-mono text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1 transition-colors cursor-pointer"
              >
                Close [ESC] ✕
              </button>
            </div>

            {/* Lightbox Image */}
            <div className="relative flex-1 min-h-[60vh] sm:min-h-[75vh] w-full bg-zinc-950 flex items-center justify-center p-2">
              <Image
                src={selected.imageUrl}
                alt={selected.title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Lightbox Footer */}
            <div className="px-5 py-2.5 border-t border-zinc-800 bg-zinc-900/95 flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Session: {selected.session}</span>
              <a
                href={selected.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 underline"
              >
                Open Original Image ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Format markdown lines into structured, institutional HTML elements.
 */
function formatDescription(raw: string) {
  if (!raw) return null;

  const lines = raw.split("\n");
  const elements: React.ReactNode[] = [];
  let bulletGroup: string[] = [];

  const flushBullets = () => {
    if (bulletGroup.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-2 my-2 font-mono text-xs">
          {bulletGroup.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-zinc-700">
              <span className="font-bold text-emerald-700 select-none mt-0.5">▸</span>
              <span className="leading-relaxed">{renderInlineFormatting(b)}</span>
            </li>
          ))}
        </ul>
      );
      bulletGroup = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushBullets();
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushBullets();
      elements.push(
        <h4
          key={`h4-${idx}`}
          className="text-xs font-mono font-black uppercase tracking-wider text-zinc-950 pt-3 pb-1 border-b border-zinc-100"
        >
          {trimmed.replace(/^###\s+/, "")}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushBullets();
      elements.push(
        <h3
          key={`h3-${idx}`}
          className="text-sm font-mono font-black uppercase tracking-wider text-zinc-950 pt-4 pb-1.5 border-b border-zinc-200"
        >
          {trimmed.replace(/^##\s+/, "")}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      bulletGroup.push(trimmed.replace(/^[-*]\s+/, ""));
      return;
    }

    flushBullets();
    elements.push(
      <p key={`p-${idx}`} className="leading-relaxed text-zinc-700">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });

  flushBullets();
  return elements;
}

/**
 * Parse **bold** inline tokens.
 */
function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-black text-zinc-950">
          {part.slice(2, -2)}
        </strong>
      );
      }
    return part;
  });
}
