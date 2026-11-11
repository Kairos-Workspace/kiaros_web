import { getTranslations } from "@/lib/i18n/server";
import { EconomicCalendarView } from "@/components/calendar/EconomicCalendarView";
import { getEnrichedEconomicEvents } from "@/lib/economic-calendar";

import { PageHeader } from "@/components/shared/PageHeader";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return {
    title: t("Economic Calendar · Kiaros Quant"),
    description: t("Real-time institutional economic calendar — tracking high-impact CPI, NFP, and FOMC catalysts with AI predictions and automated quant risk shields for prop firm accounts."),
  };
}

export const revalidate = 60;

export default async function EconomicCalendarPage() {
  const events = await getEnrichedEconomicEvents();

  return (
    <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-[#fafafa] relative text-zinc-900">
      <PageHeader
        theme="calendar"
        title="Economic Calendar"
        subtitle="High-impact macroeconomic releases, central bank rate decisions, and volatility catalysts monitored by Kiaros neural risk filters and AI macro projections to shield funded capital."
      />

      {/* Main Content Workspace */}
      <div className="page-container relative z-10 w-full flex-1 py-6 sm:py-8 lg:py-10">
        <EconomicCalendarView initialEvents={events} />
      </div>
    </main>
  );
}
