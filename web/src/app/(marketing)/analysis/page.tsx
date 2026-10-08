import type { Metadata } from "next";
import { AnalysisView } from "@/components/analysis/AnalysisView";
import { listPublishedAnalyses } from "@/lib/analysis";

export const metadata: Metadata = {
  title: "Daily Technical Analysis · Kiaros Quant",
  description:
    "Institutional multi-timeframe orderflow blueprints, liquidity maps, and daily session execution playbooks across Gold (XAUUSD), Crypto, and Forex.",
};

export const revalidate = 60;

export default async function TechnicalAnalysisPage() {
  const analyses = await listPublishedAnalyses();

  return (
    <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-[#fafafa] relative text-zinc-900">
      <div className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 xl:px-12 page-container relative z-10">
        {/* Page Header (Centered, no bottom border line) */}
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
            Daily Technical Analysis
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 mx-auto">
            Institutional multi-timeframe orderflow blueprints, liquidity map targets, and 
            daily session execution playbooks across Gold (XAUUSD), Forex, and Crypto.
          </p>
        </div>

        {/* Interactive Asset Analysis Workspace */}
        <AnalysisView analyses={analyses} />
      </div>
    </main>
  );
}
