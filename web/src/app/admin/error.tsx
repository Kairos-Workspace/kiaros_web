"use client";

import { useEffect } from "react";
import { T } from "@/components/i18n/T";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-xl border border-rose-200 bg-rose-50/50 p-6 shadow-sm">
        <span className="font-mono text-xs font-bold tracking-wider text-rose-700 uppercase">
          <T>{"Admin Console Exception"}</T>
        </span>
        <h2 className="mt-2 text-lg font-bold text-zinc-950 font-display">
          <T>{"Operation could not be completed"}</T>
        </h2>
        <p className="mt-2 text-xs text-zinc-600 leading-relaxed font-mono">
          {error.message || "Unknown administrative operation failure"}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary text-xs font-bold"
          >
            <T>{"Retry Action"}</T>
          </button>
          <button
            type="button"
            onClick={() => window.location.assign("/admin")}
            className="btn-secondary text-xs font-semibold"
          >
            <T>{"Admin Overview"}</T>
          </button>
        </div>
      </div>
    </div>
  );
}
