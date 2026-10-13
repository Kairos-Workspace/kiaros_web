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
  const isGold = (sym: string) => {
    const s = (sym || "").toUpperCase();
    return s === "XAUUSD" || s.includes("XAU") || s.includes("GOLD");
  };

  const goldAnalyses = analyses.filter((a) => isGold(a.symbol));
  const activeAnalyses = goldAnalyses;

  const [selectedId, setSelectedId] = useState<string>(
    activeAnalyses.length > 0 ? activeAnalyses[0].id : ""
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Hook for ESC key dismissal and scroll locking
  useModalDismiss(isLightboxOpen, () => setIsLightboxOpen(false));

  if (!activeAnalyses || activeAnalyses.length === 0) {
    return (
      <div className="w-full rounded-xl border border-zinc-200 bg-white p-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
          <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="mt-4 text-sm font-bold text-zinc-900">
          No Analysis Published Yet
        </h3>
        <p className="mt-1.5 text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
          Daily Gold (XAUUSD) analysis will appear here once published. New blueprints are posted ahead of London and New York sessions.
        </p>
      </div>
    );
  }

  const selected = activeAnalyses.find((a) => a.id === selectedId) ?? activeAnalyses[0];
  const executionPlan = extractExecutionPlan(selected.description);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const biasColor =
    selected.bias === "BULLISH"
      ? { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" }
      : selected.bias === "BEARISH"
      ? { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-500" }
      : { text: "text-zinc-600", bg: "bg-zinc-100", border: "border-zinc-200", dot: "bg-zinc-400" };

  return (
    <div className="w-full space-y-5">
      {/* Session Switcher */}
      {activeAnalyses.length > 1 && (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100/80 w-fit">
          {activeAnalyses.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`px-3.5 py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                item.id === selected.id
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {item.session} · {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </button>
          ))}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">
              {selected.symbol}
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md ${biasColor.bg} ${biasColor.text} ${biasColor.border} border`}>
              <span className={`h-1.5 w-1.5 rounded-full ${biasColor.dot}`} />
              {selected.bias}
            </span>
            <span className="text-xs text-zinc-400 font-medium">{selected.timeframe}</span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-400 font-medium">{selected.session}</span>
          </div>
          <h2 className="text-sm font-medium text-zinc-700 max-w-2xl leading-relaxed">
            {selected.title}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span>{selected.author}</span>
            <span>·</span>
            <span>{formatRelativeTime(selected.createdAt)}</span>
            <span>·</span>
            <span>
              {new Date(selected.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Copied
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                Share
              </>
            )}
          </button>
          <a
            href={TELEGRAM_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-zinc-900 px-3.5 py-2 text-[11px] font-semibold text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <TelegramIcon size={13} />
            Live Alerts
          </a>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* LEFT: Chart + Analysis */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">

          {/* Chart */}
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="group relative w-full aspect-[16/10] bg-zinc-50 cursor-zoom-in overflow-hidden"
            >
              <Image
                src={selected.imageUrl}
                alt={selected.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 840px"
                className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[11px] font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
                  Click to enlarge
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2 text-[11px] text-zinc-400">
              <span>{selected.symbol} · {selected.timeframe} · {selected.session}</span>
              <a
                href={selected.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-700 transition-colors"
              >
                Open image ↗
              </a>
            </div>
          </div>

          {/* Technical Analysis */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Technical Analysis
            </h3>
            <div className="space-y-3 text-[13px] leading-relaxed text-zinc-700">
              {formatDescription(selected.description)}
            </div>
          </div>
        </div>

        {/* RIGHT: Execution + Levels */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">

          {/* Execution Blueprint */}
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between bg-zinc-900 px-4 py-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Execution Plan
              </h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                selected.bias === "BULLISH"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : selected.bias === "BEARISH"
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-zinc-700 text-zinc-300"
              }`}>
                {selected.bias}
              </span>
            </div>

            <div className="p-4 space-y-3">
              {/* Trigger */}
              {executionPlan.trigger && (
                <div className="bg-zinc-50 rounded-lg p-3">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase block">Trigger</span>
                  <span className="text-[13px] font-semibold text-zinc-900 mt-0.5 block">{executionPlan.trigger}</span>
                </div>
              )}

              {/* Entry */}
              {executionPlan.entry && (
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
                  <span className="text-[11px] font-medium text-zinc-500">Entry Zone</span>
                  <span className="text-sm font-bold text-zinc-900">{executionPlan.entry}</span>
                </div>
              )}

              {/* Stop Loss */}
              {executionPlan.stopLoss && (
                <div className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/50 p-3">
                  <span className="text-[11px] font-medium text-rose-600">Stop Loss</span>
                  <span className="text-sm font-bold text-rose-700">{executionPlan.stopLoss}</span>
                </div>
              )}

              {/* Targets */}
              {executionPlan.targets.length > 0 && (
                <div className="space-y-1.5">
                  {executionPlan.targets.map((tp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 p-3"
                    >
                      <span className="text-[11px] font-medium text-emerald-600">TP {idx + 1}</span>
                      <span className="text-sm font-bold text-emerald-700">{tp}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Risk/Reward */}
              {executionPlan.riskReward && (
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <span className="text-[11px] font-medium text-zinc-500">R:R</span>
                  <span className="text-sm font-bold text-zinc-900">{executionPlan.riskReward}</span>
                </div>
              )}

              {/* Fallback if no execution data */}
              {!executionPlan.trigger && !executionPlan.entry && !executionPlan.stopLoss && executionPlan.targets.length === 0 && (
                <p className="text-[11px] text-zinc-400 text-center py-4">
                  Execution details are embedded in the analysis breakdown.
                </p>
              )}
            </div>
          </div>

          {/* Key Price Levels */}
          {selected.keyLevels && selected.keyLevels.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Key Levels
                </h3>
                <span className="text-[10px] font-medium text-zinc-400">
                  {selected.keyLevels.length} levels
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
                      className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="text-[13px] font-semibold text-zinc-800 block truncate">
                          {lvl.label}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-medium capitalize ${
                            isResistance ? "text-rose-500" : isSupport ? "text-emerald-500" : isInvalidation ? "text-amber-500" : "text-zinc-400"
                          }`}>
                            {lvl.type}
                          </span>
                          {lvl.description && (
                            <>
                              <span className="text-zinc-200">·</span>
                              <span className="text-[10px] text-zinc-400 truncate max-w-[140px]">{lvl.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-bold tabular-nums shrink-0 ml-3 ${
                        isResistance ? "text-rose-600" : isSupport ? "text-emerald-600" : isInvalidation ? "text-amber-600" : "text-zinc-800"
                      }`}>
                        {lvl.level}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Fullscreen Lightbox ── */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col max-w-7xl max-h-[95vh] w-full bg-zinc-950 overflow-hidden rounded-xl border border-zinc-800 cursor-default"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/80">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-white">{selected.symbol}</span>
                <span className="text-zinc-500">{selected.timeframe} · {selected.session}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="relative flex-1 min-h-[65vh] sm:min-h-[78vh] w-full bg-zinc-950 flex items-center justify-center p-2">
              <Image
                src={selected.imageUrl}
                alt={selected.title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-500">
              <span>{selected.title}</span>
              <a
                href={selected.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-300 transition-colors"
              >
                Open original ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Format markdown lines into structured HTML elements.
 */
function formatDescription(raw: string) {
  if (!raw) return null;

  const lines = raw.split("\n");
  const elements: React.ReactNode[] = [];
  let bulletGroup: string[] = [];

  const flushBullets = () => {
    if (bulletGroup.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-1.5 my-2">
          {bulletGroup.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-zinc-700">
              <span className="text-zinc-300 select-none mt-0.5">•</span>
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
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pt-4 pb-1"
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
          className="text-sm font-bold text-zinc-900 pt-4 pb-1"
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
      <p key={`p-${idx}`} className="leading-relaxed text-zinc-600">
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
        <strong key={i} className="font-bold text-zinc-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
