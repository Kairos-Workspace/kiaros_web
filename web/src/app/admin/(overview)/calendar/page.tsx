import type { Metadata } from "next";
import Link from "next/link";

import { AdminEconomicCalendar } from "@/components/admin/AdminEconomicCalendar";
import { DailyPnLCalendar } from "@/components/admin/DailyPnLCalendar";
import { requireAdminPage } from "@/lib/admin-guard";
import { getEnrichedEconomicEvents } from "@/lib/economic-calendar";
import { getDailyPnLStats } from "@/lib/signals";
import { serviceRoleToken } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin · Economic Calendar & Macro AI",
  description: "Monitor scheduled economic news and generate Gemini AI predictions on demand.",
};

export const revalidate = 0;

export default async function AdminCalendar({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdminPage();
  const { tab } = await searchParams;
  const isPnlTab = tab === "pnl";

  // Fetch data in parallel based on active view
  const [enrichedEvents, pnlData] = await Promise.all([
    !isPnlTab ? getEnrichedEconomicEvents() : Promise.resolve([]),
    isPnlTab
      ? getDailyPnLStats(serviceRoleToken(), 365)
      : Promise.resolve([]),
  ]);

  return (
    <div className="w-full space-y-6">
      {/* 1. Header with View Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 font-mono">
            {isPnlTab ? "Signals PnL Performance" : "Macro Catalysts & AI Shield"}
          </h1>
          <p className="mt-1 text-xs text-zinc-500 max-w-2xl leading-relaxed">
            {isPnlTab
              ? "Verified STP/ECN algorithmic signal settlements, daily net R breakdown, and session streaks."
              : "Institutional economic schedule, central bank rate catalysts, and automated Gemini AI projections."}
          </p>
        </div>

        {/* Segmented Sub-Tabs */}
        <div className="inline-flex items-center rounded-xl bg-zinc-100 p-1 border border-zinc-200/80 font-mono text-xs shrink-0">
          <Link
            href="/admin/calendar"
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-bold transition-all ${
              !isPnlTab
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <span>Macro Catalysts & AI</span>
            {!isPnlTab && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </Link>

          <Link
            href="/admin/calendar?tab=pnl"
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-bold transition-all ${
              isPnlTab
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <span>Performance Calendar</span>
            {isPnlTab && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </Link>
        </div>
      </div>

      {/* 2. Main Calendar Workspace */}
      <div className="w-full">
        {isPnlTab ? (
          <DailyPnLCalendar data={pnlData} />
        ) : (
          <AdminEconomicCalendar events={enrichedEvents} />
        )}
      </div>
    </div>
  );
}
