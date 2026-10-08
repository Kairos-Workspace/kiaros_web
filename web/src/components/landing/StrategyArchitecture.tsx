"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useRef } from "react";

interface StrategyItem {
  id: string;
  number: string;
  title: string;
  shortName: string;
  badge: string;
  description: string;
  features: string[];
  timeframe: string;
}

const STRATEGIES: StrategyItem[] = [
  {
    id: "smc",
    number: "01",
    title: "Smart Money Concepts (SMC)",
    shortName: "SMC",
    badge: "ORDER FLOW & LIQUIDITY",
    description:
      "Identifies institutional liquidity engineering, order block mitigations, and Change of Character (CHoCH). Capitalizes on retail stop-loss liquidity triggered by market makers.",
    features: [
      "Liquidity Sweep & CHoCH Confirmation",
      "Institutional Order Block Identification",
      "London & New York Killzone Windows",
      "Targeted 1:3.0+ Minimum Risk-to-Reward",
    ],
    timeframe: "M5 • M15 Timeframes",
  },
  {
    id: "ict",
    number: "02",
    title: "Inner Circle Trader (ICT)",
    shortName: "ICT",
    badge: "INEFFICIENCY ARBITRAGE",
    description:
      "Exploits Fair Value Gap (FVG) imbalances and market displacement legs. Enters systematically at deep institutional discount equilibrium and exits at premium objective targets.",
    features: [
      "Fair Value Gap (FVG) Sweep Detection",
      "Displacement & Market Equilibrium Logic",
      "Session Open High-Volume Injections",
      "Zero Repaint Execution Verification",
    ],
    timeframe: "M15 • H1 Timeframes",
  },
  {
    id: "bbma",
    number: "03",
    title: "BBMA Volatility & Momentum",
    shortName: "BBMA",
    badge: "DYNAMIC RE-ENTRY",
    description:
      "Algorithmic momentum system tracking Bollinger Band standard deviations and multi-layer moving average alignments for high-velocity exhaustion and re-entry moves.",
    features: [
      "Bollinger Band Extreme Deviation Tracking",
      "Multi-Layer Moving Average Alignment",
      "Momentum Re-entry & Profit Ladders",
      "Direct MT5 Expert Advisor Automation",
    ],
    timeframe: "H1 Swing Horizon",
  },
  {
    id: "supply-demand",
    number: "04",
    title: "Supply & Demand Imbalance",
    shortName: "S/D",
    badge: "WHOLESALE LIQUIDITY",
    description:
      "Maps fresh institutional accumulation and distribution zones (RBD/DBR) where banks absorb retail orders, targeting pristine wholesale pricing and mitigation retests.",
    features: [
      "Fresh Imbalance Zone Detection",
      "Institutional Accumulation & Distribution",
      "Wholesale Base-Breakout Validation",
      "High-Confluence Zone Retest Entries",
    ],
    timeframe: "M15 • H4 Timeframes",
  },
  {
    id: "crt",
    number: "05",
    title: "Candle Range Theory (CRT)",
    shortName: "CRT",
    badge: "RANGE EXPANSION",
    description:
      "Models candle opening price expansions and false breakout sweeps outside daily session boundaries to exploit mean-reversion with tight mathematical invalidation.",
    features: [
      "Session High/Low Sweep Mechanics",
      "Candle Open Expansion Detection",
      "Liquidity Pool Run Invalidation",
      "Ultra-Tight Stop Loss Optimization",
    ],
    timeframe: "M5 • M30 Timeframes",
  },
  {
    id: "msnr",
    number: "06",
    title: "Market Structure & S/R (MSNR)",
    shortName: "MSNR",
    badge: "KEY LEVEL BREAKOUT",
    description:
      "Multi-timeframe structural trend mapping across major swing pivots, verified Break of Structure (BOS), and validated institutional support/resistance levels.",
    features: [
      "Multi-Timeframe BOS & CHoCH Mapping",
      "Validated Structural S/R Confirmation",
      "Session Momentum Trend Continuity",
      "Asymmetric Risk-Reward Scaling",
    ],
    timeframe: "H1 • D1 Timeframes",
  },
];

const AUTO_SLIDE_INTERVAL = 3800; // 3.8 seconds

export function StrategyArchitecture() {
  const [itemsPerPage, setItemsPerPage] = useState<number>(3);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Responsive items-per-page calculation
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, STRATEGIES.length - itemsPerPage);

  // Clamp current index when itemsPerPage changes on window resize
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  // Automatic slide interval (pauses on user hover or touch)
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;

    const timer = setInterval(() => {
      handleNext();
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const diff = touchStartXRef.current - touchEndXRef.current;
      const threshold = 40; // min swipe distance in px

      if (diff > threshold) {
        handleNext();
      } else if (diff < -threshold) {
        handlePrev();
      }
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
    setIsPaused(false);
  };

  return (
    <section id="architecture" className="relative border-b border-zinc-200/80 bg-white py-16 md:py-24">
      <div className="page-container relative z-10">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
            Algorithmic Trading Strategies
          </h2>
          <p className="mt-3 text-sm text-zinc-600 sm:text-base leading-relaxed">
            Systematic quantitative models engineered to exploit institutional order flow, 
            market imbalances, and volatility across all active market sessions.
          </p>
        </div>

        {/* Carousel: Multi-Card Slider with Elevated Center Focal Card */}
        <div
          className="relative mt-10 px-2 sm:px-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous strategy"
            className="absolute -left-2 sm:-left-5 top-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-950 text-white shadow-xl transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95"
          >
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next strategy"
            className="absolute -right-2 sm:-right-5 top-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-950 text-white shadow-xl transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95"
          >
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slider Overflow Mask (with generous vertical padding for popped card) */}
          <div
            className="overflow-hidden py-8 sm:py-12"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Sliding Track */}
            <div
              className="flex items-center transition-transform duration-500 ease-out will-change-transform"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {STRATEGIES.map((s, idx) => {
                // Determine whether this card is the middle/focal card
                const isMiddle =
                  itemsPerPage === 3
                    ? idx === currentIndex + 1
                    : itemsPerPage === 1
                      ? idx === currentIndex
                      : idx === currentIndex;

                return (
                  <div
                    key={s.id}
                    className={`shrink-0 px-2.5 sm:px-3.5 transition-all duration-500 ease-out ${
                      isMiddle
                        ? "z-20 relative"
                        : "z-10 relative opacity-85 sm:opacity-90 hover:opacity-100"
                    }`}
                    style={{ width: `${100 / itemsPerPage}%` }}
                  >
                    <div
                      className={`group relative flex h-full flex-col justify-between rounded-2xl border bg-white p-6 sm:p-7 transition-all duration-500 ease-out ${
                        isMiddle
                          ? "-translate-y-3 sm:-translate-y-4 scale-[1.03] sm:scale-[1.05] border-zinc-900/90 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.22)] ring-1 ring-zinc-900/10"
                          : "scale-[0.97] border-zinc-200 shadow-sm hover:border-zinc-400 hover:shadow-md"
                      }`}
                    >
                      <div>
                        {/* Top Badge & Number */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                              isMiddle
                                ? "border-zinc-900 bg-zinc-950 text-white"
                                : "border-zinc-200 bg-zinc-100 text-zinc-900"
                            }`}
                          >
                            {s.badge}
                          </span>
                          <span
                            className={`font-mono text-xs font-bold transition-colors duration-300 ${
                              isMiddle ? "text-zinc-950" : "text-zinc-400"
                            }`}
                          >
                            {s.number}
                          </span>
                        </div>

                        {/* Strategy Title */}
                        <h3 className="mt-4 text-lg font-bold tracking-tight text-zinc-950 transition-colors group-hover:text-black">
                          {s.title}
                        </h3>

                        {/* Description */}
                        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                          {s.description}
                        </p>

                        {/* Execution Details */}
                        <div className="mt-5 border-t border-zinc-100 pt-4">
                          <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-zinc-500">
                            <span className="font-semibold uppercase tracking-wider">HORIZON</span>
                            <span className="font-bold text-zinc-900">{s.timeframe}</span>
                          </div>

                          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            Execution Mechanics
                          </p>
                          <ul className="mt-2 space-y-2 text-xs text-zinc-700">
                            {s.features.map((f) => (
                              <li key={f} className="flex items-start gap-2">
                                <span className="shrink-0 font-bold text-zinc-950">✓</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Bottom CTA Link */}
                      <div className="mt-6 border-t border-zinc-100 pt-4">
                        <Link
                          href={`/signals?tab=${s.id}`}
                          className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold transition-colors ${
                            isMiddle
                              ? "text-zinc-950 hover:text-black font-extrabold"
                              : "text-zinc-700 hover:text-black"
                          }`}
                        >
                          <span>Explore {s.shortName} Feeds</span>
                          <span className="transition-transform group-hover:translate-x-1">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? "w-6 bg-zinc-950"
                    : "w-2 bg-zinc-300 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
