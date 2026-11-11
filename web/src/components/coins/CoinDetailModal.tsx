"use client";

import { useEffect } from "react";
import { T } from "@/components/i18n/T";
import { CoinAnalysis, formatCompactUsd, formatCryptoPrice } from "@/lib/coins";

interface CoinDetailModalProps {
  coin: CoinAnalysis | null;
  onClose: () => void;
}

export function CoinDetailModal({ coin, onClose }: CoinDetailModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (coin) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [coin, onClose]);

  if (!coin) return null;

  const isPotential = coin.category === "potential";
  const isRisky = coin.category === "risky";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="coin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 pr-8 pb-4 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-zinc-950">
                {coin.symbol}
              </span>
              <span className="text-sm font-medium text-zinc-500">{coin.name}</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
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

            <div className="mt-2 flex flex-wrap gap-1.5">
              {coin.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-medium text-zinc-600"
                >
                  <T>{tag}</T>
                </span>
              ))}
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-xl sm:text-2xl font-black text-zinc-950">
              {formatCryptoPrice(coin.price)}
            </div>
            <div
              className={`font-mono text-xs font-bold ${
                coin.change24h >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {coin.change24h >= 0 ? `+${coin.change24h}%` : `${coin.change24h}%`} (24h)
            </div>
          </div>
        </div>

        {/* Quant Scores Overview */}
        <div className="my-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                <T>{"Potential Score"}</T>
              </span>
              <span className="font-mono text-xl font-black text-emerald-700">
                {coin.potentialScore}<span className="text-xs text-emerald-500">/100</span>
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-200/60">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${coin.potentialScore}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-emerald-800/80 leading-relaxed">
              <T>{"Algorithmic rating based on VWAP support, volume accumulation, and trend continuation."}</T>
            </p>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                <T>{"Risk Score"}</T>
              </span>
              <span className="font-mono text-xl font-black text-rose-700">
                {coin.riskScore}<span className="text-xs text-rose-500">/100</span>
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-rose-200/60">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-500"
                style={{ width: `${coin.riskScore}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-rose-800/80 leading-relaxed">
              <T>{"Risk meter evaluating volatility spikes, overbought chase risk, and downside deviation."}</T>
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="mb-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
          <div>
            <div className="text-[11px] font-medium text-zinc-500"><T>{"24h High"}</T></div>
            <div className="font-mono text-xs font-bold text-zinc-900 mt-0.5">
              {formatCryptoPrice(coin.high24h)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-zinc-500"><T>{"24h Low"}</T></div>
            <div className="font-mono text-xs font-bold text-zinc-900 mt-0.5">
              {formatCryptoPrice(coin.low24h)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-zinc-500"><T>{"24h VWAP"}</T></div>
            <div className="font-mono text-xs font-bold text-zinc-900 mt-0.5">
              {formatCryptoPrice(coin.vwap24h)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-zinc-500"><T>{"24h Volume (Est.)"}</T></div>
            <div className="font-mono text-xs font-bold text-zinc-900 mt-0.5">
              {formatCompactUsd(coin.volumeUsd24h)}
            </div>
          </div>
        </div>

        {/* Execution Zones / Order Levels */}
        <div className="mb-5 rounded-xl border border-zinc-200 bg-white p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3">
            <T>{"Algorithmic Key Levels & Execution Plan"}</T>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-zinc-50 p-2.5 border border-zinc-100">
              <div className="text-[10px] font-bold uppercase text-zinc-500"><T>{"Key Support Zone"}</T></div>
              <div className="mt-1 font-mono text-sm font-black text-emerald-700">
                {formatCryptoPrice(coin.support)}
              </div>
            </div>
            <div className="rounded-lg bg-zinc-50 p-2.5 border border-zinc-100">
              <div className="text-[10px] font-bold uppercase text-zinc-500"><T>{"Expansion Target"}</T></div>
              <div className="mt-1 font-mono text-sm font-black text-sky-700">
                {formatCryptoPrice(coin.target)}
              </div>
            </div>
            <div className="rounded-lg bg-zinc-50 p-2.5 border border-zinc-100">
              <div className="text-[10px] font-bold uppercase text-zinc-500"><T>{"Invalidation (SL)"}</T></div>
              <div className="mt-1 font-mono text-sm font-black text-rose-700">
                {formatCryptoPrice(coin.invalidation)}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-600 px-1">
            <span><T>{"Model Risk-to-Reward Ratio:"}</T></span>
            <span className="font-mono font-bold text-zinc-900">{coin.riskRewardRatio} : 1</span>
          </div>
        </div>

        {/* Technical Drivers & Risk Flags */}
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-100/80 bg-emerald-50/30 p-3.5">
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
              <span className="text-emerald-600">✓</span>
              <T>{"Potential Catalysts & Drivers"}</T>
            </h5>
            <ul className="space-y-1.5">
              {coin.potentialDrivers.map((driver, i) => (
                <li key={i} className="text-xs text-zinc-700 flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span><T>{driver}</T></span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-rose-100/80 bg-rose-50/30 p-3.5">
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-rose-900 mb-2">
              <span className="text-rose-600">⚠</span>
              <T>{"Risk Warnings & Caution Flags"}</T>
            </h5>
            <ul className="space-y-1.5">
              {coin.riskWarnings.map((warning, i) => (
                <li key={i} className="text-xs text-zinc-700 flex items-start gap-1.5">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span><T>{warning}</T></span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Playbook */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
            <T>{"Trader Playbook Strategy"}</T>
          </div>
          <p className="text-xs text-zinc-800 leading-relaxed font-sans">
            <T>{coin.actionPlaybook}</T>
          </p>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-4 text-[10px] text-zinc-400 text-center">
          <T>{"Analysis is derived from real-time algorithmic market metrics. Educational & quantitative research only."}</T>
        </div>
      </div>
    </div>
  );
}
