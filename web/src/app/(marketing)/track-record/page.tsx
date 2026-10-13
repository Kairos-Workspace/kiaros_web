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
    getTrackRecord(token),
    getDailyPnLStats(token, 365),
  ]);

  return (
    <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-[#fafafa] relative text-zinc-900 w-full p-3 sm:p-6 lg:p-8">
      <div className="w-full flex-1 relative z-10">
        <TrackRecordTabs
          summary={tr.summary}
          equity={tr.equity}
          byStrategy={tr.byStrategy}
          bySymbol={tr.bySymbol}
          byTimeframe={tr.byTimeframe}
          dailyPnL={dailyPnL}
          recent={tr.recent}
        />
      </div>
    </main>
  );
}
