"use client";

import { useMemo, useRef, useState } from "react";
import { T } from "@/components/i18n/T";
import { CoinAnalysis } from "@/lib/coins";
import { CoinCard } from "./CoinCard";
import { CoinDetailModal } from "./CoinDetailModal";

interface CoinRadarViewProps {
  initialCoins: CoinAnalysis[];
}

type FilterTab = "all" | "potential" | "risky" | "neutral";
type SortOption = "potential" | "risk" | "gainers" | "losers" | "volume";

const PAGE_SIZE = 12;

function getPaginationRange(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export function CoinRadarView({ initialCoins }: CoinRadarViewProps) {
  const [selectedTab, setSelectedTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("potential");
  const [selectedCoin, setSelectedCoin] = useState<CoinAnalysis | null>(null);
  const [page, setPage] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

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

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(displayedCoins.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedCoins = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return displayedCoins.slice(startIndex, startIndex + PAGE_SIZE);
  }, [displayedCoins, safeCurrentPage]);

  const rangeStart = displayedCoins.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safeCurrentPage * PAGE_SIZE, displayedCoins.length);

  const handlePageChange = (newPage: number) => {
    const targetPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(targetPage);
    if (containerRef.current && typeof containerRef.current.scrollIntoView === "function") {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleTabChange = (tab: FilterTab) => {
    setSelectedTab(tab);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setPage(1);
  };

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8 scroll-mt-6">
      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-zinc-200 pb-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => handleTabChange("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTab === "all"
                ? "bg-zinc-950 text-white shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            <T>{"All Coins"}</T> ({initialCoins.length})
          </button>

          <button
            onClick={() => handleTabChange("potential")}
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
            onClick={() => handleTabChange("risky")}
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
            onClick={() => handleTabChange("neutral")}
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
              onChange={(e) => handleSearchChange(e.target.value)}
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
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-2 text-xs text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
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
          {paginatedCoins.map((coin) => (
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
              setPage(1);
            }}
            className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <T>{"Reset Filters"}</T>
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-zinc-200 pt-6">
          <div className="text-xs text-zinc-500 font-medium">
            <T>{"Showing"}</T>{" "}
            <span className="font-semibold text-zinc-900">{rangeStart}–{rangeEnd}</span>{" "}
            <T>{"of"}</T>{" "}
            <span className="font-semibold text-zinc-900">{displayedCoins.length}</span>{" "}
            <T>{"coins"}</T>
          </div>

          <nav
            aria-label="Coins pagination"
            className="flex items-center gap-1.5 flex-wrap"
          >
            {/* Previous Page Button */}
            <button
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                safeCurrentPage <= 1
                  ? "border-zinc-200 bg-zinc-50 text-zinc-300 cursor-not-allowed"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 shadow-2xs cursor-pointer"
              }`}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span><T>{"Previous"}</T></span>
            </button>

            {/* Numbered Page Buttons */}
            {getPaginationRange(safeCurrentPage, totalPages).map((item, idx) => {
              if (item === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-xs font-semibold text-zinc-400 select-none"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = item === safeCurrentPage;
              return (
                <button
                  key={item}
                  onClick={() => handlePageChange(item)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`h-8 min-w-[2rem] px-2.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 shadow-2xs cursor-pointer"
                  }`}
                >
                  {item}
                </button>
              );
            })}

            {/* Next Page Button */}
            <button
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                safeCurrentPage >= totalPages
                  ? "border-zinc-200 bg-zinc-50 text-zinc-300 cursor-not-allowed"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 shadow-2xs cursor-pointer"
              }`}
            >
              <span><T>{"Next"}</T></span>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </nav>
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

