import type { Metadata } from "next";
import Link from "next/link";

import { AdminEconomicCalendar } from "@/components/admin/AdminEconomicCalendar";
import { DailyPnLCalendar } from "@/components/admin/DailyPnLCalendar";
import { requireAdminPage } from "@/lib/admin-guard";
import { getEnrichedEconomicEvents } from "@/lib/economic-calendar";
import { getDailyPnLStats } from "@/lib/signals";
import { serviceRoleToken } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin · Economic Calendar & Gemini AI",
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
    <div className="space-y-6">
      {/* Sub-Tabs: Economic Calendar (Gemini AI) vs PnL Calendar */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
        <Link
          href="/admin/calendar"
          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold transition-all ${
            !isPnlTab
              ? "bg-zinc-950 text-white shadow-2xs"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950"
          }`}
        >
          <span>✨ Economic News & Gemini AI</span>
          {!isPnlTab ? (
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] text-emerald-300 font-mono">
              ACTIVE
            </span>
          ) : null}
        </Link>

        <Link
          href="/admin/calendar?tab=pnl"
          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold transition-all ${
            isPnlTab
              ? "bg-zinc-950 text-white shadow-2xs"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950"
          }`}
        >
          <span>Signals PnL Calendar</span>
        </Link>
      </div>

      {/* Render View */}
      {isPnlTab ? (
        <DailyPnLCalendar data={pnlData} />
      ) : (
        <AdminEconomicCalendar events={enrichedEvents} />
      )}
    </div>
  );
}
