"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useState } from "react";

import type { Signal } from "@/lib/signals";
import { formatDateTime, formatPrice, formatRelativeTime, formatTimeframe } from "@/lib/format";

function riskReward(signal: Signal): string {
  const risk = Math.abs(signal.entry - signal.stopLoss);
  if (risk === 0) return "—";
  const target = signal.takeProfit3 ?? signal.takeProfit;
  const reward = Math.abs(target - signal.entry);
  return `${(reward / risk).toFixed(1)}R`;
}

function fmtNum(value: number | undefined, digits: number): string | null {
  if (value === undefined) return null;
  return value.toFixed(digits);
}

function indicatorRows(signal: Signal): { label: string; value: string }[] {
  const ind = signal.indicators;
  const rows: { label: string; value: string }[] = [];
  if (ind.strategy === "ce_lwma" || ind.ceTrail !== undefined || ind.lwma200 !== undefined) {
    const trail = fmtNum(ind.ceTrail, 4);
    if (trail) rows.push({ label: "CE trail", value: trail });
    if (ind.ceDirection) rows.push({ label: "CE dir", value: ind.ceDirection });
    const lwma = fmtNum(ind.lwma200, 4);
    if (lwma) rows.push({ label: "LWMA 200", value: lwma });
    if (ind.zone) rows.push({ label: "Zone", value: ind.zone });
    return rows.length > 0 ? rows : [{ label: "Strategy", value: "CE + LWMA" }];
  }
  if (ind.strategy === "ict_smc" || ind.structure) {
    if (ind.structure) rows.push({ label: "Structure", value: ind.structure });
    const sweep = fmtNum(ind.sweepLevel, 2);
    if (sweep) rows.push({ label: "Sweep", value: sweep });
    const choch = fmtNum(ind.chochLevel, 2);
    if (choch) rows.push({ label: "CHoCH", value: choch });
    const atr = fmtNum(ind.atr, 4);
    if (atr) rows.push({ label: "ATR", value: atr });
    const adx = fmtNum(ind.adx, 1);
    if (adx) rows.push({ label: "ADX", value: adx });
    if (ind.htfTrend) rows.push({ label: "HTF Trend", value: ind.htfTrend });
    return rows.length > 0 ? rows : [{ label: "Strategy", value: "ICT / SMC" }];
  }
  if (ind.strategy === "sr_zone" || ind.zoneLow !== undefined) {
    if (ind.side) rows.push({ label: "Side", value: ind.side });
    const lo = fmtNum(ind.zoneLow, 2);
    const hi = fmtNum(ind.zoneHigh, 2);
    if (lo && hi) rows.push({ label: "Zone", value: `${lo}–${hi}` });
    if (ind.touches !== undefined) {
      rows.push({ label: "Touches", value: String(ind.touches) });
    }
    const atr = fmtNum(ind.atr, 4);
    if (atr) rows.push({ label: "ATR", value: atr });
    const adx = fmtNum(ind.adx, 1);
    if (adx) rows.push({ label: "ADX", value: adx });
    if (ind.htfTrend) rows.push({ label: "HTF Trend", value: ind.htfTrend });
    return rows.length > 0 ? rows : [{ label: "Strategy", value: "S/R bounce" }];
  }
  if (ind.strategy === "cloud_mss" || ind.cloudLow !== undefined) {
    if (ind.side) rows.push({ label: "Side", value: ind.side });
    if (ind.ceTrend) rows.push({ label: "CE trend", value: ind.ceTrend });
    const lo = fmtNum(ind.cloudLow, 2);
    const hi = fmtNum(ind.cloudHigh, 2);
    if (lo && hi) rows.push({ label: "Cloud", value: `${lo}–${hi}` });
    const ma200 = fmtNum(ind.ma200, 2);
    if (ma200) rows.push({ label: "MA200", value: ma200 });
    const choch = fmtNum(ind.chochLevel, 2);
    if (choch) rows.push({ label: "CHoCH", value: choch });
    const atr = fmtNum(ind.atr, 4);
    if (atr) rows.push({ label: "ATR", value: atr });
    const adx = fmtNum(ind.adx, 1);
    if (adx) rows.push({ label: "ADX", value: adx });
    if (ind.htfTrend) rows.push({ label: "HTF Trend", value: ind.htfTrend });
    return rows.length > 0 ? rows : [{ label: "Strategy", value: "Cloud + MSS" }];
  }
  if (ind.strategy === "bbma_extreme" || ind.strategy === "bbma_reentry" || ind.bbUpper !== undefined) {
    if (ind.side) rows.push({ label: "Side", value: ind.side });
    if (ind.trigger) rows.push({ label: "Trigger", value: ind.trigger });
    const upper = fmtNum(ind.bbUpper, 2);
    const lower = fmtNum(ind.bbLower, 2);
    if (upper && lower) rows.push({ label: "BB band", value: `${lower}–${upper}` });
    const ma5h = fmtNum(ind.ma5h, 2);
    const ma5l = fmtNum(ind.ma5l, 2);
    if (ma5h && ma5l) rows.push({ label: "MA5 band", value: `${ma5l}–${ma5h}` });
    const atr = fmtNum(ind.atr, 4);
    if (atr) rows.push({ label: "ATR", value: atr });
    const adx = fmtNum(ind.adx, 1);
    if (adx) rows.push({ label: "ADX", value: adx });
    if (ind.htfTrend) rows.push({ label: "HTF Trend", value: ind.htfTrend });
    return rows.length > 0 ? rows : [{ label: "Strategy", value: "BBMA" }];
  }
  const ema9 = fmtNum(ind.ema9, 2);
  const ema21 = fmtNum(ind.ema21, 2);
  const rsi = fmtNum(ind.rsi, 1);
  const macd = fmtNum(ind.macdHist, 4);
  if (ema9) rows.push({ label: "EMA 9", value: ema9 });
  if (ema21) rows.push({ label: "EMA 21", value: ema21 });
  if (rsi) rows.push({ label: "RSI", value: rsi });
  if (macd) rows.push({ label: "MACD hist", value: macd });
  const adx = fmtNum(ind.adx, 1);
  if (adx) rows.push({ label: "ADX", value: adx });
  if (ind.htfTrend) rows.push({ label: "HTF Trend", value: ind.htfTrend });
  return rows.length > 0 ? rows : [{ label: "Indicators", value: "—" }];
}

function DirectionPill({ direction }: { direction: Signal["direction"] }) {
  const isLong = direction === "long";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider border ${
        isLong
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-800"
      }`}
    >
      <span>{isLong ? "BUY" : "SELL"}</span>
      <span className="text-[10px]">{isLong ? "↗" : "↘"}</span>
    </span>
  );
}

function StatusPill({
  status,
  closedAt,
}: {
  status: Signal["status"];
  closedAt?: string | null;
}) {
  if (status === "open") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide text-emerald-800">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
        Open
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-600">
        Expired
      </span>
    );
  }
  if ((status === "tp1_hit" || status === "tp2_hit") && !closedAt) {
    return (
      <span className="inline-flex items-center rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wide text-emerald-700">
        {status === "tp1_hit" ? "TP1 Hit" : "TP2 Hit"}
      </span>
    );
  }
  const label =
    status === "tp3_hit"
      ? "TP3 Hit"
      : status === "tp2_hit"
        ? "TP2 Hit"
        : status === "tp1_hit"
          ? "TP1 Hit"
          : status === "tp_hit"
            ? "TP Hit"
            : "SL Hit";
  const isWin = status !== "sl_hit";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wide border ${
        isWin
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {label}
    </span>
  );
}

function ConfidenceBar({ value, compact = false }: { value: number; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "w-full"}`}>
      <div className={`h-1.5 overflow-hidden rounded-full bg-zinc-200 ${compact ? "w-16" : "flex-1"}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="font-mono text-xs font-bold text-zinc-700">{value}%</span>
    </div>
  );
}

export const SignalCard = memo(function SignalCard({
  signal,
  onSelect,
  adminSlot,
  showLlmBadge = false,
}: {
  signal: Signal;
  onSelect?: (signal: Signal) => void;
  adminSlot?: React.ReactNode;
  showLlmBadge?: boolean;
}) {
  const isLong = signal.direction === "long";
  // Pure SL only — closed TP1/TP2 wins are not losses.
  const isSlHit = signal.status === "sl_hit";
  const Component = onSelect ? "button" : "div";
  const chartSrc = signal.outcomeChartUrl || signal.chartUrl;

  return (
    <Component
      type={onSelect ? "button" : undefined}
      onClick={onSelect ? () => onSelect(signal) : undefined}
      className={`group relative w-full overflow-hidden border border-zinc-200 bg-white text-left transition-all duration-200 hover:border-zinc-400 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 ${
        isSlHit ? "opacity-60 grayscale hover:opacity-80" : ""
      }`}
    >
      <div
        className={`absolute bottom-0 left-0 top-0 w-1 ${
          isLong
            ? "bg-emerald-600"
            : "bg-rose-600"
        }`}
      />

      {chartSrc ? (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-zinc-200 bg-zinc-950">
          <Image
            src={chartSrc}
            alt={`${signal.symbol} ${formatTimeframe(signal.timeframe)} ${signal.direction} chart`}
            loading="lazy"
            fill
            sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center border-b border-zinc-200 bg-zinc-100">
          <span className="font-mono text-xs text-zinc-500">No Chart Available</span>
        </div>
      )}

      <div className="relative flex items-start justify-between gap-3 p-4 pl-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-extrabold tracking-tight text-zinc-950">
              {signal.symbol}
            </span>
            <DirectionPill direction={signal.direction} />
            {showLlmBadge ? (
              <span className="rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-900">
                Algo + LLM
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-zinc-600">
              {formatTimeframe(signal.timeframe)}
            </span>
            <StatusPill status={signal.status} closedAt={signal.closedAt} />
          </div>
        </div>
        <div className="flex flex-col items-end justify-center pt-0.5">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
            Confidence
          </p>
          <ConfidenceBar value={signal.confidence} compact />
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-2 border-t border-zinc-200 bg-zinc-50/70 px-4 py-3 font-mono">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Entry</p>
          <p className="text-xs font-bold text-zinc-900">
            {formatPrice(signal.entry)}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Stop Loss</p>
          <p className="text-xs font-bold text-rose-600">
            {formatPrice(signal.stopLoss)}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">TP1 / TP2 / TP3</p>
          <p className="text-xs font-bold text-emerald-600">
            {formatPrice(signal.takeProfit)}
            {signal.takeProfit2 != null ? ` / ${formatPrice(signal.takeProfit2)}` : ""}
            {signal.takeProfit3 != null ? ` / ${formatPrice(signal.takeProfit3)}` : ""}
          </p>
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-zinc-200 bg-zinc-50/70 px-4 py-2.5 font-mono text-xs text-zinc-600">
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-500" suppressHydrationWarning>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {formatRelativeTime(signal.createdAt)}
        </span>
        {adminSlot ? (
          <div className="z-10">{adminSlot}</div>
        ) : onSelect ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-950 opacity-80 group-hover:opacity-100 transition-opacity">
            View Details →
          </span>
        ) : null}
      </div>
    </Component>
  );
});

function DetailRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "long" | "short" | "accent";
}) {
  const toneClass =
    tone === "long"
      ? "text-emerald-600 font-bold"
      : tone === "short"
        ? "text-rose-600 font-bold"
        : tone === "accent"
          ? "text-zinc-950 font-extrabold"
          : "text-zinc-900";

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3">
      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-1 font-mono text-sm font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function SignalDetailModal({
  signal,
  onClose,
}: {
  signal: Signal;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<"setup" | "outcome">(
    signal.outcomeChartUrl ? "outcome" : "setup"
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const copySignalParams = () => {
    const tpText = [
      signal.takeProfit ? `TP1: ${formatPrice(signal.takeProfit)}` : "",
      signal.takeProfit2 ? `TP2: ${formatPrice(signal.takeProfit2)}` : "",
      signal.takeProfit3 ? `TP3: ${formatPrice(signal.takeProfit3)}` : "",
    ].filter(Boolean).join(" | ");

    const text = `${signal.symbol} ${signal.direction.toUpperCase()} (${formatTimeframe(signal.timeframe)})\nEntry: ${formatPrice(signal.entry)}\nStop Loss: ${formatPrice(signal.stopLoss)}\n${tpText}\nRisk/Reward: ${riskReward(signal)}`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLong = signal.direction === "long";
  const hasBothCharts = Boolean(signal.chartUrl && signal.outcomeChartUrl);
  const currentChartUrl =
    activeChartTab === "outcome"
      ? signal.outcomeChartUrl || signal.chartUrl
      : signal.chartUrl || signal.outcomeChartUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signal-detail-title"
        className={`relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-2xl animate-in zoom-in-95 duration-200 ${
          isLong
            ? "border-t-4 border-t-emerald-600"
            : "border-t-4 border-t-rose-600"
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200/80 bg-zinc-50/70 px-5 sm:px-6 py-4">
          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            <div className="flex items-center gap-2">
              <h2 id="signal-detail-title" className="font-mono text-xl sm:text-2xl font-black tracking-tight text-zinc-950">
                {signal.symbol}
              </h2>
              <DirectionPill direction={signal.direction} />
            </div>
            <span className="rounded-md border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-zinc-700 uppercase">
              {formatTimeframe(signal.timeframe)}
            </span>
            <StatusPill status={signal.status} closedAt={signal.closedAt} />
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400">
              <span className="text-zinc-300">•</span>
              <span>Opened {formatDateTime(signal.createdAt)}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 transition-colors shadow-2xs cursor-pointer"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-6 scrollbar-thin">
          {/* 1. Dual-Engine Confidence Metric */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900">
                  Algo + LLM Dual-Engine Confidence
                </span>
              </div>
              <span className="text-xs text-zinc-500 mt-0.5 block">
                Quant model validation with real-time liquidity analysis
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-32 sm:w-40 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
              <span className="text-base font-black text-zinc-950">{signal.confidence}%</span>
            </div>
          </div>

          {/* 2. Order Execution Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2 font-mono">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Execution Parameters
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">
                STP Level
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 font-mono">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Entry</span>
                <span className="mt-1 text-base font-black text-zinc-950 block">{formatPrice(signal.entry)}</span>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Stop Loss</span>
                <span className="mt-1 text-base font-black text-rose-600 block">{formatPrice(signal.stopLoss)}</span>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Target 1</span>
                <span className="mt-1 text-base font-black text-emerald-600 block">{formatPrice(signal.takeProfit)}</span>
              </div>
              {signal.takeProfit2 != null && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Target 2</span>
                  <span className="mt-1 text-base font-black text-emerald-600 block">{formatPrice(signal.takeProfit2)}</span>
                </div>
              )}
              {signal.takeProfit3 != null && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Target 3</span>
                  <span className="mt-1 text-base font-black text-emerald-600 block">{formatPrice(signal.takeProfit3)}</span>
                </div>
              )}
              <div className="rounded-xl border border-zinc-300 bg-zinc-950 p-3 text-white shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Risk / Reward</span>
                <span className="mt-1 text-base font-black text-white block">{riskReward(signal)}</span>
              </div>
            </div>
          </div>

          {/* 3. Setup & Outcome Chart Telemetry */}
          {(signal.chartUrl || signal.outcomeChartUrl) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Chart Telemetry
                </span>

                {hasBothCharts && (
                  <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveChartTab("setup")}
                      className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        activeChartTab === "setup"
                          ? "bg-white text-zinc-950 shadow-2xs"
                          : "text-zinc-600 hover:text-zinc-950"
                      }`}
                    >
                      Setup Chart
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveChartTab("outcome")}
                      className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        activeChartTab === "outcome"
                          ? "bg-white text-zinc-950 shadow-2xs"
                          : "text-zinc-600 hover:text-zinc-950"
                      }`}
                    >
                      Outcome Chart
                    </button>
                  </div>
                )}
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 shadow-md">
                {currentChartUrl && (
                  <Image
                    src={currentChartUrl}
                    alt={`${signal.symbol} ${signal.timeframe} ${signal.direction} ${activeChartTab === "outcome" ? "outcome" : "setup"}`}
                    loading="lazy"
                    width={1280}
                    height={720}
                    className="w-full h-auto object-contain max-h-[460px] bg-zinc-950"
                  />
                )}
                <div className="absolute bottom-2.5 right-2.5 rounded-md bg-zinc-950/80 backdrop-blur-sm px-2 py-1 font-mono text-[10px] font-bold text-zinc-300 border border-zinc-800">
                  {activeChartTab === "outcome" ? "Realized Outcome" : "Initial Order Setup"}
                </div>
              </div>
            </div>
          )}

          {/* 4. AI Rationale */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-950 text-white text-[11px] font-bold">
                  ✨
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950">
                  AI Rationale
                </span>
              </div>
              <span className="rounded border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-zinc-600">
                Gemini Reasoning
              </span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-800 font-sans">
              {signal.rationale}
            </p>
          </div>

          {/* 5. Strategy Indicators */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                Strategy Indicators & Telemetry
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 font-mono">
              {indicatorRows(signal).map((row) => (
                <div
                  key={row.label}
                  className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-2.5"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    {row.label}
                  </span>
                  <span className="mt-0.5 text-xs font-bold text-zinc-950 block truncate">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. News Headlines */}
          {signal.newsHeadlines.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                Headlines Checked ({signal.newsHeadlines.length})
              </p>
              <ul className="space-y-1.5 font-mono">
                {signal.newsHeadlines.map((headline) => (
                  <li
                    key={headline}
                    className="flex items-start gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50/60 p-2.5 text-xs text-zinc-700"
                  >
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <span className="leading-snug text-zinc-800">{headline}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/80 px-5 sm:px-6 py-3.5">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>STP-ECN Execution Desk</span>
            <span className="text-zinc-300">•</span>
            <span>Zero Slippage Protocol</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={copySignalParams}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                copied
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 shadow-2xs"
              }`}
            >
              {copied ? (
                <span>✓ Copied</span>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Parameters</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 bg-zinc-950 px-4 py-1.5 font-mono text-xs font-bold text-white hover:bg-zinc-800 transition-colors cursor-pointer shadow-2xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function SignalsGrid({ signals }: { signals: Signal[] }) {
  const [selected, setSelected] = useState<Signal | null>(null);

  return (
    <>
      <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {signals.map((signal) => (
          <SignalCard
            key={signal.id}
            signal={signal}
            onSelect={setSelected}
          />
        ))}
      </div>
      {selected ? (
        <SignalDetailModal signal={selected} onClose={() => setSelected(null)} />
      ) : null}
    </>
  );
}
