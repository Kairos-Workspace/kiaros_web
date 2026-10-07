"use client";

import { useState } from "react";

import type { Stats } from "@/lib/signals";

const STEPS = [
  { id: "scan", label: "Scan", detail: "Screening active markets for structural imbalances and liquidity sweeps." },
  { id: "setup", label: "Setup", detail: "Defining strict systematic entry, stop-loss, and multi-tier profit targets." },
  { id: "news", label: "News", detail: "Filtering high-impact macro news headlines to prevent slippage traps." },
  { id: "ai", label: "AI Verify", detail: "SEA-LION quant neural model evaluates multi-timeframe confluence." },
  { id: "publish", label: "Dispatch", detail: "Instant verified dispatch to live terminal feeds and permanent audit log." },
] as const;

function StatBar({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: number;
  tone?: "ink" | "long";
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate">{label}</span>
        <span
          className={`font-mono font-bold ${
            tone === "long" ? "text-long" : "text-ink"
          }`}
        >
          {value}%
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            tone === "long" ? "bg-long" : "bg-ink"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function HowAiWorks({ stats }: { stats: Stats }) {
  const [selectedStep, setSelectedStep] = useState(0);
  const activeStep = STEPS[selectedStep];

  return (
    <div
      id="how-ai-works"
      className="hero-glass-panel overflow-hidden rounded-lg border border-line"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
          ENGINE PIPELINE
        </p>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-long">
          <span className="h-1.5 w-1.5 rounded-full bg-long" aria-hidden />
          LIVE
        </span>
      </div>

      <ol className="grid grid-cols-5 gap-px border-y border-line bg-line">
        {STEPS.map((s, index) => (
          <li
            key={s.id}
            className="bg-card"
          >
            <button
              type="button"
              className={`hero-step-button flex w-full flex-col items-center gap-1.5 px-1 py-3 text-center ${
                selectedStep === index ? "is-active" : ""
              }`}
              aria-controls="hero-step-detail"
              aria-pressed={selectedStep === index}
              onClick={() => setSelectedStep(index)}
            >
              <span className="hero-step-index flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                {index + 1}
              </span>
              <span className="text-[10px] font-semibold leading-tight text-ink">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="p-4">
        <div id="hero-step-detail" className="hero-step-detail mb-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-long">
            STEP {selectedStep + 1} / {STEPS.length}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">{activeStep.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate">{activeStep.detail}</p>
        </div>
        <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate">
          AUDITED SYSTEM PERFORMANCE
        </p>
        <div className="mb-4 flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold text-ink">
            {stats.total}
          </span>
          <span className="text-xs text-slate">signals logged</span>
        </div>
        <div className="flex flex-col gap-3">
          <StatBar label="Avg Confidence" value={stats.avgConfidence} />
          {stats.winRate !== null ? (
            <StatBar label="Win Rate" value={stats.winRate} tone="long" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
