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
      className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${
        isLong ? "bg-long-soft text-long" : "bg-short-soft text-short"
      }`}
    >
      {isLong ? "BUY" : "SELL"}
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
      <span className="inline-flex items-center rounded-md bg-line px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide text-slate">
        Open
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="inline-flex items-center rounded-md bg-line px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate">
        Expired
      </span>
    );
  }
  if ((status === "tp1_hit" || status === "tp2_hit") && !closedAt) {
    return (
      <span className="inline-flex items-center rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-accent">
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
      className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${
        isWin ? "bg-long-soft text-long" : "bg-short-soft text-short"
      }`}
    >
      {label}
    </span>
  );
}

function ConfidenceBar({ value, compact = false }: { value: number; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "w-full"}`}>
      <div className={`h-1.5 overflow-hidden rounded-full bg-line ${compact ? "w-16" : "flex-1"}`}>
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="font-mono text-xs font-medium text-slate">{value}%</span>
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

      <div className="relative flex items-center justify-between border-t border-line/60 bg-card/60 px-4 py-2.5 font-mono text-xs text-slate">
        <span className="flex items-center gap-1.5 text-[11px] text-slate/80" suppressHydrationWarning>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {formatRelativeTime(signal.createdAt)}
        </span>
        {adminSlot ? (
          <div className="z-10">{adminSlot}</div>
        ) : onSelect ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-ink opacity-80 group-hover:opacity-100 transition-opacity">
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

  const isLong = signal.direction === "long";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signal-detail-title"
        className={`relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-2xl ${
          isLong
            ? "border-t-4 border-t-emerald-600"
            : "border-t-4 border-t-rose-600"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 bg-zinc-50/60 px-6 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="signal-detail-title" className="font-mono text-xl font-extrabold text-zinc-950">
                {signal.symbol}
              </h2>
              <DirectionPill direction={signal.direction} />
              <span className="rounded border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-zinc-600">
                {formatTimeframe(signal.timeframe)}
              </span>
              <StatusPill status={signal.status} closedAt={signal.closedAt} />
            </div>
            <p className="mt-1 font-mono text-xs text-zinc-500">
              Opened {formatDateTime(signal.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition-colors shadow-2xs"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-5 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 font-mono">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              ALGO + LLM CONFIDENCE SCORE
            </p>
            <ConfidenceBar value={signal.confidence} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailRow label="Entry" value={formatPrice(signal.entry)} />
            <DetailRow label="Stop Loss" value={formatPrice(signal.stopLoss)} tone="short" />
            <DetailRow label="Target 1" value={formatPrice(signal.takeProfit)} tone="long" />
            {signal.takeProfit2 != null ? (
              <DetailRow label="Target 2" value={formatPrice(signal.takeProfit2)} tone="long" />
            ) : null}
            {signal.takeProfit3 != null ? (
              <DetailRow label="Target 3" value={formatPrice(signal.takeProfit3)} tone="long" />
            ) : null}
            <DetailRow label="Risk / Reward" value={riskReward(signal)} tone="accent" />
          </div>

          {signal.chartUrl && (
            <div className="mt-5">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate mb-1.5">
                Setup Chart
              </p>
              <Image
                src={signal.chartUrl}
                alt={`${signal.symbol} ${signal.timeframe} ${signal.direction} setup`}
                loading="lazy"
                width={1280}
                height={720}
                className="w-full h-auto rounded-xl border border-line shadow-lg"
              />
            </div>
          )}

          {signal.outcomeChartUrl && (
            <div className="mt-5">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate mb-1.5">
                Outcome Chart
              </p>
              <Image
                src={signal.outcomeChartUrl}
                alt={`${signal.symbol} ${signal.timeframe} ${signal.direction} outcome`}
                loading="lazy"
                width={1280}
                height={720}
                className="w-full h-auto rounded-xl border border-line shadow-lg"
              />
            </div>
          )}

          <div className="mt-5 rounded-xl border border-line bg-card/60 p-4.5 backdrop-blur-md">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
              AI Rationale
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink/90">{signal.rationale}</p>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate">
              Indicators
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {indicatorRows(signal).map((row) => (
                <DetailRow key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          </div>

          {signal.newsHeadlines.length > 0 ? (
            <div className="mt-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate">
                Headlines Checked ({signal.newsHeadlines.length})
              </p>
              <ul className="space-y-2">
                {signal.newsHeadlines.map((headline) => (
                  <li
                    key={headline}
                    className="rounded-lg border border-line bg-paper/50 px-4 py-2.5 text-sm text-slate"
                  >
                    {headline}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
