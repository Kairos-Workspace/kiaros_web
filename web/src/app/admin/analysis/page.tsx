import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  createDailyAnalysisAction,
  deleteDailyAnalysisAction,
  toggleDailyAnalysisPublishedAction,
} from "@/app/admin/actions";
import { Notice } from "@/components/shared/Notice";
import { requireAdminPage } from "@/lib/admin-guard";
import { listAllAnalysesForAdmin } from "@/lib/analysis";
import { isR2Configured } from "@/lib/r2";

export const metadata: Metadata = {
  title: "Admin · Daily Analysis",
};

export const revalidate = 0;

export default async function AdminAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; deleted?: string }>;
}) {
  await requireAdminPage();
  const { error, saved, deleted } = await searchParams;
  const analyses = await listAllAnalysesForAdmin();
  const r2Active = isR2Configured();

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Daily Analysis</h1>
          <p className="mt-1 text-sm text-slate">
            Upload institutional chart breakdowns, trade blueprints, and graphs for the public Daily Analysis page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ${
              r2Active
                ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                : "bg-amber-50 text-amber-800 border border-amber-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                r2Active ? "bg-emerald-600 animate-pulse" : "bg-amber-600"
              }`}
            />
            {r2Active ? "Cloudflare R2 Active" : "R2 Pending API Key (Local Fallback)"}
          </span>
          <Link
            href="/analysis"
            target="_blank"
            className="btn-secondary text-xs"
          >
            View Live Page →
          </Link>
        </div>
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}
      {saved ? <Notice tone="success">Daily analysis published successfully.</Notice> : null}
      {deleted ? <Notice tone="success">Analysis deleted successfully.</Notice> : null}

      {/* Upload Form */}
      <section className="card-surface p-5 sm:p-6">
        <div className="border-b border-line pb-4">
          <h2 className="text-lg font-semibold text-ink">Publish New Analysis</h2>
          <p className="mt-1 text-xs text-slate">
            Upload your technical chart graph screenshot with institutional setup notes. Images are stored in Cloudflare R2.
          </p>
        </div>

        <form action={createDailyAnalysisAction} className="mt-5 flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Title / Blueprint Headline
              <input
                type="text"
                name="title"
                required
                placeholder="XAUUSD London Sweep & M15 Fair Value Gap Retest"
                className="input-field w-full"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Asset / Symbol
                <select name="symbol" defaultValue="XAUUSD" className="input-field w-full font-mono">
                  <option value="XAUUSD">XAUUSD (Gold)</option>
                  <option value="BTCUSD">BTCUSD (Bitcoin)</option>
                  <option value="ETHUSD">ETHUSD (Ethereum)</option>
                  <option value="EURUSD">EURUSD (Euro)</option>
                  <option value="GBPUSD">GBPUSD (Pound)</option>
                  <option value="USDJPY">USDJPY (Yen)</option>
                  <option value="SOLUSD">SOLUSD (Solana)</option>
                  <option value="US30">US30 (Dow Jones)</option>
                  <option value="NAS100">NAS100 (Nasdaq)</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Market Bias
                <select name="bias" defaultValue="BULLISH" className="input-field w-full font-bold">
                  <option value="BULLISH" className="text-emerald-700">▲ BULLISH</option>
                  <option value="BEARISH" className="text-rose-700">▼ BEARISH</option>
                  <option value="NEUTRAL" className="text-zinc-700">● NEUTRAL</option>
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Timeframe Focus
              <input
                type="text"
                name="timeframe"
                defaultValue="H4 / H1 / M15"
                placeholder="e.g. H4 / H1 / M15 or M15 Scalp"
                className="input-field w-full font-mono"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Trading Session Window
              <input
                type="text"
                name="session"
                defaultValue="London Killzone → NY Overlap"
                placeholder="e.g. London Session, NY Open, Asian Session"
                className="input-field w-full font-mono"
              />
            </label>
          </div>

          {/* Graph/Chart Image Upload */}
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Chart / Graph Image Screenshot
            <input
              type="file"
              name="image"
              required
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-zinc-800 input-field w-full py-2"
            />
            <span className="text-[11px] text-slate">
              Upload high-res TradingView or MT5 screenshot (.png, .jpeg, max 15MB). Automatically uploaded to Cloudflare R2 bucket.
            </span>
          </label>

          {/* Analysis Playbook Description */}
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Technical Analysis Breakdown & Execution Plan
            <textarea
              name="description"
              rows={6}
              required
              placeholder="Enter institutional orderflow observations, liquidity pools, entry trigger conditions, stop-loss invalidation, and profit target ladders..."
              className="input-field w-full font-mono text-xs leading-relaxed"
            />
          </label>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="btn-primary px-6 py-2.5 text-sm font-bold shadow-md"
            >
              Publish Daily Analysis
            </button>
          </div>
        </form>
      </section>

      {/* Published Analyses List */}
      <section className="card-surface p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Analysis Library</h2>
            <p className="mt-0.5 text-xs text-slate">
              {analyses.length} published or active technical analysis records.
            </p>
          </div>
        </div>

        {analyses.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate">
            No analyses found. Publish your first daily technical analysis above.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-line">
            {analyses.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  {/* Image Thumbnail */}
                  <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-line bg-zinc-100">
                    <Image
                      src={a.imageUrl}
                      alt={a.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ink">
                        {a.symbol}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                          a.bias === "BULLISH"
                            ? "bg-emerald-100 text-emerald-800"
                            : a.bias === "BEARISH"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-zinc-100 text-zinc-800"
                        }`}
                      >
                        {a.bias}
                      </span>
                      <span className="font-mono text-[11px] text-slate">
                        {a.timeframe}
                      </span>
                      <span className="text-[11px] text-slate">
                        • {new Date(a.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="mt-1 text-sm font-semibold text-ink line-clamp-1">
                      {a.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate">
                      {a.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <form action={toggleDailyAnalysisPublishedAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <input
                      type="hidden"
                      name="published"
                      value={a.published ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className={`btn-secondary text-xs py-1 px-2.5 ${
                        a.published ? "text-emerald-700" : "text-slate"
                      }`}
                    >
                      {a.published ? "Published" : "Draft (Hidden)"}
                    </button>
                  </form>

                  <form action={deleteDailyAnalysisAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button
                      type="submit"
                      className="btn-ghost text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
