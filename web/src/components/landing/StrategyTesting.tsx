"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

const PROOF_SRC = "/proof_strategy_testing/strategy_testing.png";
const PROOF_ALT =
  "Monthly strategy performance heatmap from 2020 to 2026 showing returns, losses, and trade frequency per month";

export function StrategyTesting() {
  const titleId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <section id="strategy-testing" className="relative border-b border-zinc-200/80 bg-[#fafafa] py-16 md:py-24">
      <div className="page-container">
        {/* Section Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
              6-Year Monthly Performance Heatmap
            </h2>
            <p className="mt-2 text-sm text-zinc-600 max-w-2xl leading-relaxed sm:text-base">
              Monthly net return distribution from 2020 through 2026 across 72+ months.
              Validated tick data confirms edge durability, risk containment, and zero curve fitting.
            </p>
          </div>
        </div>

        {/* Terminal Heatmap Frame */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-400 hover:shadow-md text-left cursor-pointer"
          aria-label="Enlarge strategy testing heatmap"
        >
          {/* Terminal Window Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span className="font-mono text-xs font-bold text-zinc-900 tracking-wider">
                AUDIT ARCHIVE // MONTHLY_HEATMAP_2020_2026.RAW
              </span>
            </div>
            <span className="font-mono text-xs text-zinc-600 group-hover:text-zinc-950 transition-colors">
              + Fullscreen Inspect
            </span>
          </div>

          <div className="relative aspect-[2814/1372] w-full overflow-hidden bg-zinc-50 p-2">
            <Image
              src={PROOF_SRC}
              alt={PROOF_ALT}
              fill
              sizes="(max-width: 768px) 100vw, 82rem"
              className="object-contain transition-transform duration-500 group-hover:scale-[1.01]"
              priority={false}
            />
          </div>
        </button>
      </div>

      {/* Fullscreen Inspector Modal */}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex max-h-[96vh] w-full max-w-[98vw] flex-col overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-zinc-100 px-5 py-4">
              <div>
                <p id={titleId} className="font-mono text-base font-bold text-zinc-900">
                  Strategy Audit Report
                </p>
                <p className="text-xs text-zinc-600 font-mono">
                  Monthly Performance Heatmap 2020–2026 // Tick Data 99.9%
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Close
              </button>
            </div>
            <div className="relative min-h-0 flex-1 overflow-auto bg-zinc-50 p-3 sm:p-4">
              <Image
                src={PROOF_SRC}
                alt={PROOF_ALT}
                width={2814}
                height={1372}
                sizes="98vw"
                className="mx-auto h-auto w-full max-w-none"
                priority
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
