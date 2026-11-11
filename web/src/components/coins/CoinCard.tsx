"use client";

import { T } from "@/components/i18n/T";
import { CoinAnalysis, formatCompactUsd, formatCryptoPrice } from "@/lib/coins";

interface CoinCardProps {
  coin: CoinAnalysis;
  onSelect: (coin: CoinAnalysis) => void;
}

export function CoinCard({ coin, onSelect }: CoinCardProps) {
  const isPotential = coin.category === "potential";
  const isRisky = coin.category === "risky";
  const isPositive = coin.change24h >= 0;

  return (
    <div
      onClick={() => onSelect(coin)}
      className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md cursor-pointer"
    >
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-black tracking-tight text-zinc-950">
              {coin.symbol}
            </span>
            <span className="text-xs font-medium text-zinc-500 line-clamp-1 max-w-[100px] sm:max-w-none">
              {coin.name}
            </span>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              isPotential
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : isRisky
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-zinc-100 text-zinc-700 border border-zinc-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isPotential ? "bg-emerald-500 animate-pulse" : isRisky ? "bg-rose-500" : "bg-zinc-400"
              }`}
            />
            <T>{coin.statusLabel}</T>
          </span>
        </div>

        {/* Price & 24h Change */}
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div className="font-mono text-xl sm:text-2xl font-black text-zinc-950">
            {formatCryptoPrice(coin.price)}
          </div>
          <span
            className={`inline-flex items-center gap-0.5 font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
              isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            <span>{isPositive ? "▲" : "▼"}</span>
            <span>{isPositive ? `+${coin.change24h}%` : `${coin.change24h}%`}</span>
          </span>
        </div>

        {/* Quant Scores: Potential vs Risk dual meters */}
        <div className="mt-4 space-y-2 rounded-xl bg-zinc-50/80 p-3 border border-zinc-100">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-800"><T>{"Potential Score"}</T></span>
              <span className="font-mono font-bold text-emerald-700">{coin.potentialScore}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/70">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${coin.potentialScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-rose-800"><T>{"Risk Score"}</T></span>
              <span className="font-mono font-bold text-rose-700">{coin.riskScore}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/70">
              <div
                className="h-full rounded-full bg-rose-500"
                style={{ width: `${coin.riskScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Technical Zones (Support vs Target) */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg border border-zinc-100 bg-white p-2">
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
              <T>{"Support"}</T>
            </span>
            <span className="font-mono text-xs font-bold text-emerald-700">
              {formatCryptoPrice(coin.support)}
            </span>
          </div>
          <div className="rounded-lg border border-zinc-100 bg-white p-2">
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
              <T>{"Target"}</T>
            </span>
            <span className="font-mono text-xs font-bold text-sky-700">
              {formatCryptoPrice(coin.target)}
            </span>
          </div>
        </div>

        {/* Primary Signal Pill & Snippet */}
        <div className="mt-3">
          <div className="text-[11px] font-bold text-zinc-800 line-clamp-1">
            <T>{coin.primarySignal}</T>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500 line-clamp-1">
            <T>{isPotential ? coin.potentialDrivers[0] : isRisky ? coin.riskWarnings[0] : coin.potentialDrivers[0]}</T>
          </div>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
        <div className="text-zinc-400 font-mono">
          <T>{"Vol:"}</T> {formatCompactUsd(coin.volumeUsd24h)}
        </div>
        <div className="flex items-center gap-1 font-semibold text-zinc-800 group-hover:text-zinc-950">
          <span><T>{"View Analysis"}</T></span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </div>
  );
}

