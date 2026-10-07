import { Footer } from "@/components/shared/Footer";
import { TrackRecordTabs } from "@/components/track-record/TrackRecordTabs";
import { getDailyPnLStats } from "@/lib/signals";
import { serviceRoleToken } from "@/lib/supabase/admin";
import { getTrackRecord } from "@/lib/track-record";

export const revalidate = 60;

export const metadata = {
  title: "Audited Performance · Kiaros Quant",
  description: "Complete log of every signal outcome — wins and losses. Real STP/ECN execution data updated automatically.",
};

export default async function TrackRecordPage() {
  const token = serviceRoleToken();
  const [tr, dailyPnL] = await Promise.all([
    getTrackRecord(),
    getDailyPnLStats(token, 365),
  ]);
  const empty = tr.summary.total === 0;

  return (
    <>
      <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-[#fafafa] relative text-zinc-900">
        <div className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 xl:px-12 page-container relative z-10">
          {/* Institutional Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
              Audited Performance
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 mx-auto">
              Complete verifiable log of every signal outcome — full wins, partials, and stop-loss hits. 
              Zero cherry-picking, 100% transparent algorithmic execution.
            </p>
          </div>

          {empty ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-800 mb-3">
                <span className="h-5 w-5 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
              </div>
              <p className="font-mono text-base font-bold text-zinc-900">No closed trades yet</p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500">
                The audited performance log populates automatically as trade outcomes are finalized (TP or SL). Please check back soon.
              </p>
            </div>
          ) : (
            <TrackRecordTabs
              byStrategy={tr.byStrategy}
              bySymbol={tr.bySymbol}
              dailyPnL={dailyPnL}
              recent={tr.recent}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
