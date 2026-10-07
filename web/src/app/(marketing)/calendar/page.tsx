import type { Metadata } from "next";
import { EconomicCalendarView } from "@/components/calendar/EconomicCalendarView";

export const metadata: Metadata = {
  title: "Economic Calendar · Kiaros Quant",
  description:
    "Real-time institutional economic calendar — tracking high-impact CPI, NFP, and FOMC catalysts with automated quant risk shields for prop firm accounts.",
};

export const revalidate = 60;

export default function EconomicCalendarPage() {
  return (
    <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-[#fafafa] relative text-zinc-900">
      <div className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 xl:px-12 page-container relative z-10">
        {/* Page Header (Centered, no bottom border line) */}
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
            Economic Calendar
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 mx-auto">
            High-impact macroeconomic releases, central bank rate decisions, and volatility 
            catalysts monitored by Kiaros neural risk filters to shield funded capital.
          </p>
        </div>

        {/* Interactive Economic Calendar Workspace */}
        <EconomicCalendarView />
      </div>
    </main>
  );
}
