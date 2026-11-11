"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { DailyAnalysis } from "@/lib/analysis";
import type { MarketCandle } from "@/lib/markets/kraken";
import { parsePoiLevel, poiLineColor } from "@/lib/analysis-poi";
import { T } from "@/components/i18n/T";

type KeyLevel = NonNullable<DailyAnalysis["keyLevels"]>[number];

type Props = {
  candles: MarketCandle[];
  levels: KeyLevel[];
  symbol?: string;
  className?: string;
  frameless?: boolean;
};

function sanitizeCandles(candles: MarketCandle[]) {
  const byTime = new Map<number, MarketCandle>();
  for (const c of candles) {
    const time = Math.floor(Number(c.time));
    if (!Number.isFinite(time) || time <= 0) continue;
    if (![c.open, c.high, c.low, c.close].every((n) => Number.isFinite(n))) continue;
    byTime.set(time, {
      time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume || 0,
    });
  }
  return Array.from(byTime.values()).sort((a, b) => a.time - b.time);
}

export function PoiAnalysisChart({
  candles,
  levels,
  symbol = "XAUUSD",
  className = "",
  frameless = false,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanCandles = useMemo(() => sanitizeCandles(candles), [candles]);
  const levelKey = useMemo(
    () => levels.map((l) => `${l.type}:${l.level}:${l.label}`).join("|"),
    [levels],
  );

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    if (cleanCandles.length < 2) {
      setError("no-data");
      setReady(false);
      return;
    }

    let disposed = false;
    let ro: ResizeObserver | null = null;

    const paintLevels = (series: ISeriesApi<"Candlestick">) => {
      for (const lvl of levels.slice(0, 5)) {
        const parsed = parsePoiLevel(lvl.level);
        if (!parsed) continue;
        const color = poiLineColor(lvl.type);
        const shortLabel = String(lvl.label || "POI").slice(0, 26);

        if (parsed.isZone) {
          series.createPriceLine({
            price: parsed.high,
            color,
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: shortLabel,
          });
          series.createPriceLine({
            price: parsed.low,
            color,
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: "",
          });
        } else {
          series.createPriceLine({
            price: parsed.mid,
            color,
            lineWidth: 2,
            lineStyle:
              lvl.type === "equilibrium" ? LineStyle.Dashed : LineStyle.Solid,
            axisLabelVisible: true,
            title: shortLabel,
          });
        }
      }
    };

    const mount = () => {
      if (disposed || chartRef.current) return;
      const width = Math.max(el.clientWidth, el.parentElement?.clientWidth || 0, 1);
      const height = Math.max(el.clientHeight, 300);
      // Wait until layout is real — avoids blank charts in hidden Suspense slots
      if (width < 40) return;

      try {
        el.replaceChildren();
        const chart = createChart(el, {
          width,
          height,
          layout: {
            background: { type: ColorType.Solid, color: "#0c0c0e" },
            textColor: "#a1a1aa",
            fontFamily:
              'var(--font-kantumruy), "Kantumruy Pro", ui-sans-serif, system-ui, sans-serif',
            fontSize: 11,
          },
          grid: {
            vertLines: { color: "rgba(255,255,255,0.04)" },
            horzLines: { color: "rgba(255,255,255,0.05)" },
          },
          crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: {
              color: "rgba(245,158,11,0.35)",
              labelBackgroundColor: "#27272a",
            },
            horzLine: {
              color: "rgba(245,158,11,0.35)",
              labelBackgroundColor: "#27272a",
            },
          },
          rightPriceScale: {
            borderColor: "rgba(255,255,255,0.06)",
            scaleMargins: { top: 0.14, bottom: 0.1 },
          },
          timeScale: {
            borderColor: "rgba(255,255,255,0.06)",
            timeVisible: true,
            secondsVisible: false,
          },
        });

        const series = chart.addCandlestickSeries({
          upColor: "#10b981",
          downColor: "#f43f5e",
          borderUpColor: "#10b981",
          borderDownColor: "#f43f5e",
          wickUpColor: "#34d399",
          wickDownColor: "#fb7185",
        });

        series.setData(
          cleanCandles.map((c) => ({
            time: c.time as UTCTimestamp,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          })),
        );
        paintLevels(series);
        chart.timeScale().fitContent();

        chartRef.current = chart;
        seriesRef.current = series;
        if (!disposed) {
          setReady(true);
          setError(null);
        }
      } catch (err) {
        console.warn("POI chart failed:", err);
        if (!disposed) {
          setError(err instanceof Error ? err.message : "chart-error");
          setReady(false);
        }
      }
    };

    mount();

    ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || disposed) return;
      const { width: w, height: h } = entry.contentRect;
      if (!chartRef.current) {
        mount();
        return;
      }
      if (w > 0 && h > 0) {
        chartRef.current.applyOptions({ width: w, height: h });
      }
    });
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);

    return () => {
      disposed = true;
      ro?.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [cleanCandles, levels, levelKey]);

  if (error === "no-data" || cleanCandles.length < 2) {
    return (
      <div
        className={`flex h-full min-h-[320px] w-full items-center justify-center bg-[#0c0c0e] px-6 text-center ${
          frameless ? "" : "rounded-2xl border border-zinc-800"
        } ${className}`}
      >
        <p className="text-xs text-zinc-500">
          <T>{"Chart data unavailable right now."}</T>
        </p>
      </div>
    );
  }

  if (frameless) {
    return (
      <div className={`relative h-full w-full min-h-[360px] bg-[#0c0c0e] ${className}`}>
        {!ready && !error ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-500" />
          </div>
        ) : null}
        {error && error !== "no-data" ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
            <p className="text-xs text-zinc-500">
              <T>{"Chart data unavailable right now."}</T>
            </p>
          </div>
        ) : null}
        <div ref={hostRef} className="absolute inset-0 h-full w-full" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#0c0c0e] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.55)] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            <T>{"Live Structure"}</T>
          </p>
          <p className="mt-0.5 text-sm font-semibold text-zinc-100">
            {symbol}
            <span className="font-normal text-zinc-500"> · 1H · POI overlay</span>
          </p>
        </div>
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {(
            [
              ["support", "Support"],
              ["resistance", "Resistance"],
              ["equilibrium", "Equilibrium"],
              ["invalidation", "Invalidation"],
            ] as const
          ).map(([key, label]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-semibold text-zinc-400 ring-1 ring-zinc-800"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: poiLineColor(key) }}
              />
              <T>{label}</T>
            </span>
          ))}
        </div>
      </div>

      <div className="relative h-[300px] w-full min-h-[300px] sm:h-[380px] lg:h-[440px]">
        {!ready && !error ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-800" />
          </div>
        ) : null}
        {error && error !== "no-data" ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
            <p className="text-sm text-zinc-500">
              <T>{"Chart data unavailable right now."}</T>
            </p>
          </div>
        ) : null}
        {/* Explicit min size so absolute host isn't 0×0 before layout */}
        <div ref={hostRef} className="absolute inset-0 min-h-[300px] w-full" />
      </div>
    </div>
  );
}
