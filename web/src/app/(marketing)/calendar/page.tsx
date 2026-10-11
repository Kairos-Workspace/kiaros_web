import type { Metadata } from "next";
import { EconomicCalendarView } from "@/components/calendar/EconomicCalendarView";
import { getEnrichedEconomicEvents } from "@/lib/economic-calendar";

import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Economic Calendar · Kiaros Quant",
  description:
    "Real-time institutional economic calendar — tracking high-impact CPI, NFP, and FOMC catalysts with Gemini AI predictions and automated quant risk shields for prop firm accounts.",
};

export const revalidate = 60;

export default async function EconomicCalendarPage() {
  const events = await getEnrichedEconomicEvents();

  return (
    <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-[#fafafa] relative text-zinc-900">
      <PageHeader
        title="Economic Calendar"
        subtitle="High-impact macroeconomic releases, central bank rate decisions, and volatility catalysts monitored by Kiaros neural risk filters and Gemini AI macro projections to shield funded capital."
      />

      {/* Main Content Workspace */}
      <div className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 xl:px-12 page-container relative z-10">
        <EconomicCalendarView initialEvents={events} />
      </div>
    </main>
  );
}
