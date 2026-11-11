"use client";

import { useMemo, useState } from "react";
import { T } from "@/components/i18n/T";
import { CoinAnalysis } from "@/lib/coins";
import { CoinCard } from "./CoinCard";
import { CoinDetailModal } from "./CoinDetailModal";

interface CoinRadarViewProps {
  initialCoins: CoinAnalysis[];
}

type FilterTab = "all" | "potential" | "risky" | "neutral";
type SortOption = "potential" | "risk" | "gainers" | "losers" | "volume";

export function CoinRadarView({ initialCoins }: CoinRadarViewProps) {
  const [selectedTab, setSelectedTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("potential");
  const [selectedCoin, setSelectedCoin] = useState<CoinAnalysis | null>(null);

  // Compute key KPI metrics
  const kpis = useMemo(() => {
    const potentialCoins = initialCoins.filter((c) => c.category === "potential");
    const riskyCoins = initialCoins.filter((c) => c.category === "risky");
    const topPotential = [...initialCoins].sort((a, b) => b.potentialScore - a.potentialScore)[0];
    const topRisk = [...initialCoins].sort((a, b) => b.riskScore - a.riskScore)[0];

    return {
      potentialCount: potentialCoins.length,
      riskyCount: riskyCoins.length,
      neutralCount: initialCoins.length - potentialCoins.length - riskyCoins.length,
      topPotential,
      topRisk,
    };
  }, [initialCoins]);

  // Filter & sort coins
  const displayedCoins = useMemo(() => {
    let result = [...initialCoins];

    // Filter by tab
    if (selectedTab !== "all") {
      result = result.filter((c) => c.category === selectedTab);
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          c.symbol.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "potential") return b.potentialScore - a.potentialScore;
      if (sortBy === "risk") return b.riskScore - a.riskScore;
      if (sortBy === "gainers") return b.change24h - a.change24h;
      if (sortBy === "losers") return a.change24h - b.change24h;
      if (sortBy === "volume") return b.volumeUsd24h - a.volumeUsd24h;
      return 0;
    });

    return result;
  }, [initialCoins, selectedTab, searchQuery, sortBy]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Intelligence KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Top Potential */}
        <div className="rounded-2xl border border-emerald-200/80 bg-linear-to-br from-emerald-500/10 via-emerald-50/50 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <span><T>{"🚀 Top Potential Pick"}</T></span>
            <span className="font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
              {kpis.topPotential?.potentialScore}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-xl font-black text-zinc-950">
              {kpis.topPotential?.symbol}
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              {kpis.topPotential?.name}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 line-clamp-1">
            <T>{kpis.topPotential?.primarySignal}</T>
          </p>
        </div>

        {/* Top Risk Warning */}
        <div className="rounded-2xl border border-rose-200/80 bg-linear-to-br from-rose-500/10 via-rose-50/50 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800 uppercase tracking-wider">
            <span><T>{"⚠️ Highest Risk Watch"}</T></span>
            <span className="font-mono bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded text-[10px]">
              {kpis.topRisk?.riskScore}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-xl font-black text-zinc-950">
              {kpis.topRisk?.symbol}
            </span>
            <span className="text-xs font-semibold text-rose-700">
              {kpis.topRisk?.name}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 line-clamp-1">
            <T>{kpis.topRisk?.primarySignal}</T>
          </p>
        </div>

        {/* Market Breadth */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <T>{"Quant Radar Health"}</T>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-xl font-black text-emerald-700">
              {kpis.potentialCount}
            </span>
            <span className="text-xs text-zinc-400">/</span>
            <span className="font-mono text-xl font-black text-rose-700">
              {kpis.riskyCount}
            </span>
            <span className="text-xs text-zinc-500 ml-auto">
              <T>{"Potential vs Risky"}</T>
            </span>
          </div>
          <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="bg-emerald-500"
              style={{ width: `${(kpis.potentialCount / (initialCoins.length || 1)) * 100}%` }}
            />
            <div
              className="bg-rose-500"
              style={{ width: `${(kpis.riskyCount / (initialCoins.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Live Feed Status */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <T>{"Real-Time Feed"}</T>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-xl font-black text-zinc-950">
              {initialCoins.length} <span className="text-xs font-normal text-zinc-500"><T>{"Coins"}</T></span>
            </span>
            <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              <T>{"Public Kraken L1"}</T>
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">
            <T>{"Sub-second institutional liquidity & VWAP feeds"}</T>
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-zinc-200 pb-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSelectedTab("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTab === "all"
                ? "bg-zinc-950 text-white shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <T>{"All Coins"}</T> ({initialCoins.length})
          </button>

          <button
            onClick={() => setSelectedTab("potential")}
            className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTab === "potential"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-emerald-700 border border-emerald-200/80 hover:bg-emerald-50"
            }`}
          >
            <span>🚀</span>
            <span><T>{"High Potential"}</T></span>
            <span className="opacity-80">({kpis.potentialCount})</span>
          </button>

          <button
            onClick={() => setSelectedTab("risky")}
            className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTab === "risky"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-rose-700 border border-rose-200/80 hover:bg-rose-50"
            }`}
          >
            <span>⚠️</span>
            <span><T>{"High Risk"}</T></span>
            <span className="opacity-80">({kpis.riskyCount})</span>
          </button>

          <button
            onClick={() => setSelectedTab("neutral")}
            className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTab === "neutral"
                ? "bg-zinc-800 text-white shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <span>👀</span>
            <span><T>{"Watchlist"}</T></span>
            <span className="opacity-80">({kpis.neutralCount})</span>
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coin or tag..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 pl-8 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-hidden"
            />
            <svg
              className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-xs text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 focus:border-zinc-950 focus:outline-hidden cursor-pointer"
          >
            <option value="potential">Sort: Highest Potential</option>
            <option value="risk">Sort: Highest Risk</option>
            <option value="gainers">Sort: Top Gainers (24h)</option>
            <option value="losers">Sort: Top Losers (24h)</option>
            <option value="volume">Sort: Highest Volume</option>
          </select>
        </div>
      </div>

      {/* Coins Cards Grid */}
      {displayedCoins.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedCoins.map((coin) => (
            <CoinCard
              key={coin.id}
              coin={coin}
              onSelect={(c) => setSelectedCoin(c)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <div className="text-3xl">🔍</div>
          <h3 className="mt-3 text-sm font-bold text-zinc-900">
            <T>{"No coins matched your search"}</T>
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            <T>{"Try adjusting your filter or search keywords."}</T>
          </p>
          <button
            onClick={() => {
              setSelectedTab("all");
              setSearchQuery("");
            }}
            className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition-colors"
          >
            <T>{"Reset Filters"}</T>
          </button>
        </div>
      )}

      {/* Selected Coin Modal */}
      <CoinDetailModal
        coin={selectedCoin}
        onClose={() => setSelectedCoin(null)}
      />
    </div>
  );
}
