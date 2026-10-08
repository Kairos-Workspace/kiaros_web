"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { DailyAnalysis } from "@/lib/analysis";

interface AnalysisViewProps {
  analyses?: DailyAnalysis[];
}

export function AnalysisView({ analyses = [] }: AnalysisViewProps) {
  const [selectedId, setSelectedId] = useState<string>(
    analyses.length > 0 ? analyses[0].id : ""
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // If selectedId is invalid or analyses changed, default to first item
  useEffect(() => {
    if (analyses.length > 0 && (!selectedId || !analyses.some((a) => a.id === selectedId))) {
      setSelectedId(analyses[0].id);
    }
  }, [analyses, selectedId]);

  // Handle escape key to close lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    }
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
  }, [isLightboxOpen]);

  if (!analyses || analyses.length === 0) {
    return (
      <div className="w-full border border-zinc-200 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 font-mono text-xl">
          📊
        </div>
        <h3 className="mt-4 text-base font-bold text-zinc-900">
          No Daily Analyses Published Yet
        </h3>
        <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
          The quantitative desk has not published active session breakdowns for today yet. 
          New technical playbooks are posted ahead of the London and New York session opens.
        </p>
      </div>
    );
  }

  const selected = analyses.find((a) => a.id === selectedId) ?? analyses[0];

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Asset Navigation Tabs */}
      <div className="border-b border-zinc-200 overflow-x-auto scrollbar-none">
        <ul className="flex flex-nowrap sm:flex-wrap text-sm font-medium text-center text-zinc-600 gap-2 pb-px">
          {analyses.map((item) => {
            const active = item.id === selected.id;
            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-mono transition-all cursor-pointer ${
                    active
                      ? "border-zinc-950 text-zinc-950 font-bold bg-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100/60"
                  }`}
                >
                  <span className="font-bold">{item.symbol}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      item.bias === "BULLISH"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.bias === "BEARISH"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-zinc-200 text-zinc-800"
                    }`}
                  >
                    {item.bias === "BULLISH" ? "▲" : item.bias === "BEARISH" ? "▼" : "●"} {item.bias}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 2. Executive Header Card */}
      <div className="border border-zinc-200 bg-white p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 border-b border-zinc-100 pb-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                {selected.symbol}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-0.5 font-mono text-xs font-black uppercase tracking-wider ${
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
              <span className="rounded border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-mono text-xs font-bold text-zinc-600">
                {selected.timeframe}
              </span>
              <span className="rounded border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 font-mono text-xs text-zinc-600">
                {selected.session}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 leading-snug">
              {selected.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-mono">
              <span>Desk: <strong className="text-zinc-800 font-semibold">{selected.author}</strong></span>
              <span>•</span>
              <span>
                {new Date(selected.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                ACTIVE BLUEPRINT // ALGO + LLM CONFLUENCE
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-3 py-1.5 text-xs font-mono font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <span>{copiedLink ? "✓ Link Copied" : "Share Analysis"}</span>
            </button>
            <a
              href="https://t.me/kairoscommunity"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded bg-zinc-950 px-3.5 py-1.5 text-xs font-mono font-bold text-white hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <span>Join Telegram</span>
              <span>→</span>
            </a>
          </div>
        </div>

        {/* 4 Quick Telemetry Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
          <div className="border border-zinc-100 bg-zinc-50/70 p-3">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Asset Symbol</p>
            <p className="mt-1 font-bold text-zinc-950">{selected.symbol}</p>
          </div>
          <div className="border border-zinc-100 bg-zinc-50/70 p-3">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Timeframe Focus</p>
            <p className="mt-1 font-bold text-zinc-950">{selected.timeframe}</p>
          </div>
          <div className="border border-zinc-100 bg-zinc-50/70 p-3">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Session Window</p>
            <p className="mt-1 font-bold text-zinc-950">{selected.session}</p>
          </div>
          <div className="border border-zinc-100 bg-zinc-50/70 p-3">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Trading Direction</p>
            <p
              className={`mt-1 font-bold ${
                selected.bias === "BULLISH"
                  ? "text-emerald-700"
                  : selected.bias === "BEARISH"
                  ? "text-rose-700"
                  : "text-zinc-700"
              }`}
            >
              {selected.bias === "BULLISH" ? "Long / Accumulation" : selected.bias === "BEARISH" ? "Short / Distribution" : "Range Bound / Neutral"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Centerpiece: High-Resolution Graph / Chart Visualizer */}
      <div className="border border-zinc-200 bg-white p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black bg-zinc-950 text-white px-2 py-0.5">
              CHART
            </span>
            <h3 className="font-mono text-xs font-bold text-zinc-950 uppercase tracking-wider">
              Institutional Orderflow & Graph Structure
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-zinc-600 hover:text-zinc-950 hover:underline cursor-pointer"
          >
            <span>⛶ Click to Expand Fullscreen</span>
          </button>
        </div>

        {/* Chart Image Container */}
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="group relative w-full aspect-video sm:aspect-[16/10] max-h-[580px] overflow-hidden rounded border border-zinc-200 bg-zinc-950/5 cursor-zoom-in transition-all hover:border-zinc-400"
        >
          <Image
            src={selected.imageUrl}
            alt={selected.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          />
          {/* Zoom Overlay Prompt */}
          <div className="absolute inset-0 bg-zinc-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-zinc-950/80 text-white font-mono text-xs px-3.5 py-1.5 rounded-full backdrop-blur-xs font-semibold shadow-lg">
              🔍 Click to View Fullscreen Chart
            </span>
          </div>
        </div>
        <p className="mt-2.5 text-center font-mono text-[11px] text-zinc-500">
          *High-resolution technical breakdown with price structure, liquidity sweeps, and invalidation points.
        </p>
      </div>

      {/* 4. Technical Analysis Breakdown & Execution Plan */}
      <div className="border border-zinc-200 bg-white p-6 md:p-8 shadow-xs">
        <div className="border-b border-zinc-100 pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black bg-zinc-950 text-white px-2 py-0.5">
              PLAYBOOK
            </span>
            <h3 className="font-mono text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Technical Analysis Breakdown & Execution Strategy
            </h3>
          </div>
          <span className="font-mono text-xs text-zinc-500">
            {selected.symbol} • {selected.timeframe}
          </span>
        </div>

        {/* Structured Description Content */}
        <div className="space-y-4 text-xs leading-relaxed text-zinc-700">
          {formatDescription(selected.description)}
        </div>
      </div>

      {/* 5. Key Institutional Price Levels (if available) */}
      {selected.keyLevels && selected.keyLevels.length > 0 ? (
        <div className="border border-zinc-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4">
            <h3 className="font-mono text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Key Institutional Price Levels & Liquidity Pools
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Algorithmic orderbook map for {selected.symbol}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-100/70 text-[11px] font-bold text-zinc-600 uppercase">
                <tr>
                  <th className="px-6 py-3">Structure Role</th>
                  <th className="px-6 py-3">Price Level</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Institutional Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {selected.keyLevels.map((lvl, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-zinc-950">{lvl.label}</td>
                    <td className="px-6 py-3.5 font-black text-sm text-zinc-950">{lvl.level}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          lvl.type === "resistance"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : lvl.type === "support"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : lvl.type === "equilibrium"
                            ? "bg-zinc-100 text-zinc-800 border border-zinc-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {lvl.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-zinc-600">
                      {lvl.description || "Key structural price point"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* 6. Telegram Syndicate Alert Banner */}
      <div className="border border-zinc-200 bg-zinc-50 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900">
              Live Execution Alerts
            </span>
          </div>
          <h4 className="mt-1 text-base font-bold text-zinc-950">
            Get Instant Alerts When {selected.symbol} Triggers
          </h4>
          <p className="mt-1 text-xs text-zinc-600 max-w-xl leading-relaxed">
            Every daily analysis blueprint is monitored live by our Algo + LLM quantitative execution engine. 
            Receive real-time entry and take-profit notifications directly via Telegram.
          </p>
        </div>

        <a
          href="https://t.me/kairoscommunity"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-zinc-950 text-white font-mono text-xs font-bold px-6 py-3 hover:bg-zinc-800 transition-colors shadow-sm shrink-0"
        >
          <span>Join Telegram Community</span>
          <span>→</span>
        </a>
      </div>

      {/* 7. High-Resolution Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-8 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col max-w-7xl max-h-[92vh] w-full bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 shadow-2xl cursor-default"
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/90 text-white">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {selected.symbol}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  • {selected.timeframe}
                </span>
                <span className="font-sans text-xs text-zinc-300 font-medium truncate max-w-md hidden sm:inline">
                  {selected.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="font-mono text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded transition-colors cursor-pointer"
              >
                Close [Esc] ✕
              </button>
            </div>

            {/* Lightbox Full-res Image */}
            <div className="relative flex-1 min-h-[50vh] sm:min-h-[70vh] w-full bg-zinc-950 flex items-center justify-center p-2">
              <Image
                src={selected.imageUrl}
                alt={selected.title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Lightbox Footer */}
            <div className="px-5 py-2.5 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>{selected.session}</span>
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
 * Helper to parse markdown-like text lines (headings, bullet points, and plain text)
 * into nicely formatted HTML elements.
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
            <li key={i} className="flex items-start gap-2 text-zinc-700">
              <span className="font-bold text-emerald-700 select-none">▶</span>
              <span>{renderInlineFormatting(b)}</span>
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
          className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 pt-3 pb-1 border-b border-zinc-100"
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
          className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-950 pt-4 pb-1.5 border-b border-zinc-200"
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
 * Simple parser for **bold** inline tokens.
 */
function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-zinc-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
