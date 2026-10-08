import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export function AuthShell({
  headline,
  sub,
  children,
}: {
  headline: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-1 items-center justify-center bg-[#fafafa] px-4 py-8 sm:px-6 lg:px-8 relative">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-zinc-200/50 blur-[140px]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] grid lg:grid-cols-12">
        {/* Left Column: Institutional Terminal Brand & Live Telemetry Panel */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-8 sm:p-10 text-white lg:col-span-5 lg:flex">
          {/* Subtle ambient gradient mesh in background */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-zinc-800/40 blur-[100px]"
            aria-hidden
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <Logo className="text-white brightness-125" />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                STP-ECN LIVE
              </span>
            </div>

            {/* Live Terminal Telemetry Card */}
            <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-inner">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="font-black text-emerald-400 tracking-wider">
                  ▲ LONG · XAUUSD
                </span>
                <span className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.2 text-[10px] text-zinc-300">
                  M15
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Entry</span>
                  <span className="text-xs font-bold text-zinc-100">$2,648.80</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-400 uppercase tracking-wider block">Stop Loss</span>
                  <span className="text-xs font-bold text-rose-300">$2,638.20</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Target 1</span>
                  <span className="text-xs font-bold text-emerald-300">$2,662.50</span>
                </div>
              </div>

              <div className="mt-3 border-t border-zinc-800/80 pt-2.5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-400">Algo + LLM Confluence:</span>
                <span className="font-bold text-emerald-400">89% Confirmed</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10">
            <h2 className="text-xl font-black tracking-tight text-white">{headline}</h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">{sub}</p>

            <div className="mt-6 border-t border-zinc-800/80 pt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>🔒 256-Bit Encrypted</span>
              <span>Zero Repaint Logged</span>
            </div>
          </div>
        </aside>

        {/* Right Column: Clean Executive Sign In Form */}
        <main className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:col-span-7 lg:py-14">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <Logo />
              <Link href="/" className="font-mono text-xs text-zinc-500 hover:text-zinc-950">
                ← Back to home
              </Link>
            </div>
            <div>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
