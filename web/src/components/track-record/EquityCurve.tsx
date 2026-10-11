"use client";

import { useId, useMemo, useState } from "react";
import type { EquityPoint } from "@/lib/track-record";

export function EquityCurve({ points = [] }: { points?: EquityPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gradId = useId();

  // If points are empty or fewer than 2, generate realistic baseline curve if needed or show clean empty state
  const data = useMemo(() => {
    if (points && points.length >= 2) return points;
    return [];
  }, [points]);

  const stats = useMemo(() => {
    if (data.length === 0) return { maxR: 0, minR: 0, currentR: 0, total: 0 };
    const rs = data.map((p) => p.r);
    const maxR = Math.max(...rs);
    const minR = Math.min(...rs);
    const currentR = rs[rs.length - 1];
    return { maxR, minR, currentR, total: data.length };
  }, [data]);

  if (data.length < 2) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 mb-3">
          📈
        </div>
        <p className="font-mono text-sm font-bold text-zinc-950">Generating Equity Curve</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500">
          Cumulative R trajectory requires at least 2 finalized trade settlements to plot the slope.
        </p>
      </div>
    );
  }

  const W = 900;
  const H = 260;
  const padTop = 25;
  const padBottom = 35;
  const padLeft = 45;
  const padRight = 25;

  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  const rs = data.map((p) => p.r);
  const maxVal = Math.max(...rs, 5);
  const minVal = Math.min(...rs, -2);
  const span = maxVal - minVal || 1;

  const getX = (i: number) => padLeft + (i / (data.length - 1)) * plotW;
  const getY = (r: number) => padTop + plotH - ((r - minVal) / span) * plotH;

  const linePath = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(p.r).toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${getX(data.length - 1).toFixed(1)} ${padTop + plotH} L ${getX(0).toFixed(1)} ${padTop + plotH} Z`;

  const zeroY = getY(0);

  // Y-axis grid markers
  const step = Math.max(5, Math.ceil((maxVal - minVal) / 4));
  const yTicks: number[] = [];
  for (let val = Math.ceil(minVal / step) * step; val <= maxVal; val += step) {
    yTicks.push(val);
  }

  const activePoint = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];
  const activeX = hoverIndex !== null ? getX(hoverIndex) : getX(data.length - 1);
  const activeY = hoverIndex !== null ? getY(activePoint.r) : getY(activePoint.r);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
      {/* Chart Header & Live Inspection readout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
              Cumulative Growth Curve
            </span>
            <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
              AUDITED R-MULTIPLE
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Realized cumulative risk-reward yield across {data.length} audited trade executions
          </p>
        </div>

        {/* Hover inspector HUD */}
        <div className="flex items-center gap-4 bg-zinc-50 rounded-xl p-2.5 border border-zinc-200 font-mono">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Inspected R</span>
            <span className={`text-base font-black ${activePoint.r >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {activePoint.r >= 0 ? "+" : ""}
              {activePoint.r.toFixed(2)}R
            </span>
          </div>
          <div className="border-l border-zinc-200 pl-4">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Trade #</span>
            <span className="text-base font-black text-zinc-950">
              {hoverIndex !== null ? `#${hoverIndex + 1}` : `#${data.length}`}
            </span>
          </div>
          {activePoint.t && (
            <div className="border-l border-zinc-200 pl-4 hidden md:block">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Date</span>
              <span className="text-xs font-bold text-zinc-600">
                {activePoint.t.split("T")[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const normX = (clientX / rect.width) * W;
            if (normX >= padLeft && normX <= padLeft + plotW) {
              const ratio = (normX - padLeft) / plotW;
              const idx = Math.round(ratio * (data.length - 1));
              setHoverIndex(Math.max(0, Math.min(data.length - 1, idx)));
            }
          }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines & Y-axis labels */}
          {yTicks.map((tick) => {
            const yPos = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={W - padRight}
                  y2={yPos}
                  stroke="#e4e4e7"
                  strokeWidth="1"
                  strokeDasharray={tick === 0 ? "0" : "4 4"}
                />
                <text
                  x={padLeft - 8}
                  y={yPos + 3.5}
                  textAnchor="end"
                  className="font-mono text-[10px] fill-zinc-400 font-bold"
                >
                  {tick > 0 ? `+${tick}R` : `${tick}R`}
                </text>
              </g>
            );
          })}

          {/* Zero baseline */}
          {zeroY >= padTop && zeroY <= padTop + plotH && (
            <line
              x1={padLeft}
              y1={zeroY}
              x2={W - padRight}
              y2={zeroY}
              stroke="#a1a1aa"
              strokeWidth="1.5"
            />
          )}

          {/* Shaded Area fill */}
          <path d={areaPath} fill={`url(#${gradId})`} />

          {/* Smooth Equity Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Crosshair Vertical Line */}
          {hoverIndex !== null && (
            <line
              x1={activeX}
              y1={padTop}
              x2={activeX}
              y2={padTop + plotH}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Active / Current Point Glowing Dot */}
          <circle
            cx={activeX}
            cy={activeY}
            r="6"
            className="fill-emerald-500 stroke-white stroke-2 shadow-md"
          />
        </svg>
      </div>

      {/* Footer Metrics */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-zinc-100 pt-4 font-mono text-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Peak Return</span>
          <span className="text-sm font-black text-emerald-700">+{stats.maxR.toFixed(1)}R</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Max Drawdown</span>
          <span className="text-sm font-black text-zinc-700">
            {stats.minR < 0 ? `${stats.minR.toFixed(1)}R` : "0.0R"}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Current Multiple</span>
          <span className="text-sm font-black text-emerald-800">+{stats.currentR.toFixed(1)}R</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Plotted</span>
          <span className="text-sm font-black text-zinc-950">{stats.total} Executions</span>
        </div>
      </div>
    </div>
  );
}
