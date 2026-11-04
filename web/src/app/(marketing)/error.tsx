"use client";

import { useEffect } from "react";
import { T } from "@/components/i18n/T";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Marketing route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <span className="font-mono text-xs font-bold tracking-wider text-amber-600 uppercase">
          <T>{"Sync Error"}</T>
        </span>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-zinc-950 font-display">
          <T>{"Failed to load terminal data"}</T>
        </h2>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
          <T>{"A temporary network or data synchronization issue occurred. Please retry."}</T>
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary text-xs font-bold"
          >
            <T>{"Try again"}</T>
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-secondary text-xs font-semibold"
          >
            <T>{"Refresh Page"}</T>
          </button>
        </div>
      </div>
    </main>
  );
}
