"use client";

import { useMemo, useState } from "react";
import { T } from "@/components/i18n/T";
import { CoinAnalysis } from "@/lib/coins";
import { CoinCard } from "./CoinCard";
import { CoinDetailModal } from "./CoinDetailModal";
import { CoinIcon } from "./CoinIcon";

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

  // Compute category counts for filter tabs
  const categoryCounts = useMemo(() => {
    const potentialCount = initialCoins.filter((c) => c.category === "potential").length;
    const riskyCount = initialCoins.filter((c) => c.category === "risky").length;
    const neutralCount = initialCoins.length - potentialCount - riskyCount;

    return {
      potentialCount,
      riskyCount,
      neutralCount,
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
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTab === "potential"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-emerald-700 border border-emerald-200/80 hover:bg-emerald-50"
            }`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <span><T>{"High Potential"}</T></span>
            <span className="opacity-80">({categoryCounts.potentialCount})</span>
          </button>

          <button
            onClick={() => setSelectedTab("risky")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTab === "risky"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-rose-700 border border-rose-200/80 hover:bg-rose-50"
            }`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span><T>{"High Risk"}</T></span>
            <span className="opacity-80">({categoryCounts.riskyCount})</span>
          </button>

          <button
            onClick={() => setSelectedTab("neutral")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTab === "neutral"
                ? "bg-zinc-800 text-white shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span><T>{"Watchlist"}</T></span>
            <span className="opacity-80">({categoryCounts.neutralCount})</span>
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
          <svg className="h-10 w-10 text-zinc-300 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
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

