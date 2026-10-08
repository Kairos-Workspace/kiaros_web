"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import {
  createDailyAnalysisAction,
  deleteDailyAnalysisAction,
  toggleDailyAnalysisPublishedAction,
} from "@/app/admin/actions";
import type { DailyAnalysis } from "@/lib/analysis";

type Props = {
  analyses: DailyAnalysis[];
  r2Active: boolean;
  defaultTab?: "list" | "upload";
};

export function AdminAnalysisSections({
  analyses,
  r2Active,
  defaultTab = "list",
}: Props) {
  const [activeTab, setActiveTab] = useState<"list" | "upload">(defaultTab);
  const [selectedSymbolFilter, setSelectedSymbolFilter] = useState<string>("ALL");
  const [selectedBiasFilter, setSelectedBiasFilter] = useState<string>("ALL");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const handleTabChange = (tab: "list" | "upload") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const filteredAnalyses = analyses.filter((a) => {
    const matchesSymbol =
      selectedSymbolFilter === "ALL" || a.symbol === selectedSymbolFilter;
    const matchesBias =
      selectedBiasFilter === "ALL" || a.bias === selectedBiasFilter;
    return matchesSymbol && matchesBias;
  });

  const uniqueSymbols = Array.from(new Set(analyses.map((a) => a.symbol)));

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Navigation Tabs Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-4">
        <div className="inline-flex rounded-xl bg-zinc-100 p-1.5 border border-zinc-200/80 shadow-inner">
          <button
            type="button"
            onClick={() => handleTabChange("list")}
            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "list"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>Analysis Library</span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                activeTab === "list"
                  ? "bg-zinc-950 text-white"
                  : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {analyses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("upload")}
            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "upload"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Upload New Analysis</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.5 font-mono text-[9px] font-bold">
              + NEW
            </span>
          </button>
        </div>

        {/* Quick info or Switch Button */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/analysis"
            target="_blank"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors shadow-2xs"
          >
            Open Public Feed ↗
          </Link>

          {activeTab === "list" ? (
            <button
              type="button"
              onClick={() => handleTabChange("upload")}
              className="btn-primary py-2 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Publish New Setup</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTabChange("list")}
              className="btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Back to Library ({analyses.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: ANALYSIS LIBRARY */}
      {activeTab === "list" && (
        <section className="flex flex-col gap-5 animate-in fade-in duration-200">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase text-zinc-500 mr-1">
                Filter Asset:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSymbolFilter("ALL")}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-colors cursor-pointer ${
                  selectedSymbolFilter === "ALL"
                    ? "bg-zinc-950 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                All Assets ({analyses.length})
              </button>
              {uniqueSymbols.map((sym) => {
                const count = analyses.filter((a) => a.symbol === sym).length;
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSelectedSymbolFilter(sym)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-colors cursor-pointer ${
                      selectedSymbolFilter === sym
                        ? "bg-zinc-950 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {sym} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase text-zinc-500 mr-1">
                Bias:
              </span>
              {["ALL", "BULLISH", "BEARISH", "NEUTRAL"].map((bias) => (
                <button
                  key={bias}
                  type="button"
                  onClick={() => setSelectedBiasFilter(bias)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-colors cursor-pointer ${
                    selectedBiasFilter === bias
                      ? "bg-zinc-950 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {bias}
                </button>
              ))}
            </div>
          </div>

          {/* Records Count */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-mono text-zinc-500">
              Showing {filteredAnalyses.length} of {analyses.length} published breakdowns
            </p>
          </div>

          {/* Grid / List of Analyses */}
          {filteredAnalyses.length === 0 ? (
            <div className="card-surface py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-zinc-900">No Technical Analyses Found</h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                No setups match the current filters. Switch filters or tap Upload to publish a new institutional breakdown.
              </p>
              <button
                type="button"
                onClick={() => handleTabChange("upload")}
                className="btn-primary mt-4 py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                + Upload New Blueprint
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAnalyses.map((a) => (
                <div
                  key={a.id}
                  className="card-surface p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-zinc-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
                    {/* Thumbnail with zoom trigger */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setLightboxImage({ url: a.imageUrl, title: a.title })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setLightboxImage({ url: a.imageUrl, title: a.title });
                        }
                      }}
                      className="group relative h-28 w-44 sm:h-24 sm:w-36 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 cursor-zoom-in"
                      title="Click to view full high-res chart"
                    >
                      <Image
                        src={a.imageUrl}
                        alt={a.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 176px, 144px"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </div>
                    </div>

                    {/* Metadata & Copy */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black text-zinc-950 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                          {a.symbol}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                            a.bias === "BULLISH"
                              ? "bg-emerald-100 text-emerald-800"
                              : a.bias === "BEARISH"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-zinc-100 text-zinc-800"
                          }`}
                        >
                          {a.bias === "BULLISH" ? "▲ " : a.bias === "BEARISH" ? "▼ " : "● "}
                          {a.bias}
                        </span>
                        <span className="font-mono text-[11px] font-medium text-zinc-500">
                          {a.timeframe}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {a.session}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          • {new Date(a.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-sm sm:text-base font-bold text-zinc-950 line-clamp-1">
                        {a.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500 leading-relaxed">
                        {a.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                    <Link
                      href="/analysis"
                      target="_blank"
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors shadow-xs"
                    >
                      View Live ↗
                    </Link>

                    <form action={toggleDailyAnalysisPublishedAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <input
                        type="hidden"
                        name="published"
                        value={a.published ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-colors cursor-pointer border ${
                          a.published
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
                        }`}
                      >
                        {a.published ? "● Published" : "○ Draft"}
                      </button>
                    </form>

                    <form
                      action={deleteDailyAnalysisAction}
                      onSubmit={(e) => {
                        if (!confirm(`Are you sure you want to delete "${a.title}"?`)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="id" value={a.id} />
                      <button
                        type="submit"
                        className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                        title="Delete this analysis"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: UPLOAD NEW ANALYSIS */}
      {activeTab === "upload" && (
        <section className="card-surface p-6 sm:p-8 animate-in fade-in duration-200">
          <div className="border-b border-zinc-100 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-zinc-950">
                Publish Technical Blueprint
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Provide high-resolution chart setups, orderflow observations, and invalidation rules for institutional readers.
              </p>
            </div>
            <div className="shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold ${
                  r2Active
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                    : "bg-amber-50 text-amber-800 border border-amber-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    r2Active ? "bg-emerald-600 animate-pulse" : "bg-amber-600"
                  }`}
                />
                {r2Active ? "Cloudflare R2 Bucket Connected" : "Local Fallback Active"}
              </span>
            </div>
          </div>

          <form action={createDailyAnalysisAction} className="flex flex-col gap-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Blueprint Headline / Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="XAUUSD London Sweep & M15 Fair Value Gap Retest"
                  className="input-field w-full font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Asset / Symbol *
                  </label>
                  <select
                    name="symbol"
                    defaultValue="XAUUSD"
                    className="input-field w-full font-mono text-xs font-bold"
                  >
                    <option value="XAUUSD">XAUUSD (Gold)</option>
                    <option value="BTCUSD">BTCUSD (Bitcoin)</option>
                    <option value="ETHUSD">ETHUSD (Ethereum)</option>
                    <option value="EURUSD">EURUSD (Euro)</option>
                    <option value="GBPUSD">GBPUSD (Pound)</option>
                    <option value="USDJPY">USDJPY (Yen)</option>
                    <option value="SOLUSD">SOLUSD (Solana)</option>
                    <option value="US30">US30 (Dow Jones)</option>
                    <option value="NAS100">NAS100 (Nasdaq)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Market Bias *
                  </label>
                  <select
                    name="bias"
                    defaultValue="BULLISH"
                    className="input-field w-full font-mono text-xs font-bold"
                  >
                    <option value="BULLISH" className="text-emerald-700 font-bold">
                      ▲ BULLISH
                    </option>
                    <option value="BEARISH" className="text-rose-700 font-bold">
                      ▼ BEARISH
                    </option>
                    <option value="NEUTRAL" className="text-zinc-700 font-bold">
                      ● NEUTRAL
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Timeframe Focus *
                </label>
                <input
                  type="text"
                  name="timeframe"
                  defaultValue="H4 / H1 / M15"
                  placeholder="e.g. H4 / H1 / M15 or M15 Scalp"
                  className="input-field w-full font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Trading Session Window *
                </label>
                <input
                  type="text"
                  name="session"
                  defaultValue="London Killzone → NY Overlap"
                  placeholder="e.g. London Session, NY Open, Asian Session"
                  className="input-field w-full font-mono text-xs"
                  required
                />
              </div>
            </div>

            {/* Interactive Image Upload with Live Preview */}
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Technical Chart Screenshot (.png, .jpeg, .webp, max 15MB) *
              </label>

              <div className="mt-1 flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-4 hover:border-zinc-400 transition-colors">
                <input
                  type="file"
                  name="image"
                  required
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleImageChange}
                  className="file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-zinc-800 input-field w-full sm:w-auto py-2 cursor-pointer"
                />

                <span className="text-[11px] text-zinc-500">
                  Upload TradingView or MT5 execution graph screenshot. Auto-synced to Cloudflare R2 bucket.
                </span>
              </div>

              {previewImage && (
                <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3 shadow-xs">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-zinc-800">
                      Live Chart Preview
                    </span>
                    <span className="font-mono text-[10px] text-emerald-600 font-bold">
                      Ready for upload
                    </span>
                  </div>
                  <div className="relative h-64 w-full overflow-hidden rounded-lg bg-zinc-100">
                    <Image
                      src={previewImage}
                      alt="Upload preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Playbook Description */}
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Institutional Playbook & Orderflow Breakdown *
              </label>
              <textarea
                name="description"
                rows={6}
                required
                placeholder="Detail institutional liquidity sweeps, order blocks, premium/discount zones, entry triggers, stop-loss invalidation, and profit ladders..."
                className="input-field w-full font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 pt-5">
              <button
                type="button"
                onClick={() => handleTabChange("list")}
                className="btn-secondary py-2.5 px-4 text-xs font-bold cursor-pointer"
              >
                Cancel & Return to Library
              </button>

              <button
                type="submit"
                className="btn-primary py-3 px-6 text-sm font-bold tracking-tight shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Publish Daily Analysis</span>
                <span className="font-mono">→</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Lightbox / Image Zoom Modal */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-xl bg-zinc-950 p-2 shadow-2xl border border-zinc-800 cursor-default"
          >
            <div className="flex items-center justify-between p-3 border-b border-zinc-800">
              <h4 className="font-mono text-xs font-bold text-zinc-200">
                {lightboxImage.title}
              </h4>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="rounded-lg bg-zinc-800 px-2 py-1 font-mono text-xs font-bold text-zinc-300 hover:bg-zinc-700"
              >
                ✕ Close
              </button>
            </div>
            <div className="relative h-[70vh] w-[85vw] max-w-4xl">
              <Image
                src={lightboxImage.url}
                alt={lightboxImage.title}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
