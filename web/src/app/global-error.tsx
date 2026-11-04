"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global runtime error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-950 font-sans antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <span className="font-mono text-xs font-bold tracking-wider text-rose-600 uppercase">
              System Error
            </span>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-zinc-950">
              Application encountered an error
            </h1>
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
              A temporary issue occurred while loading the application shell. Please refresh or retry.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center justify-center rounded-lg bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-800"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => window.location.assign("/")}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Return to Home
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
