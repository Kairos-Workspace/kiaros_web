import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { AnalysisView } from "@/components/analysis/AnalysisView";
import { listPublishedAnalyses } from "@/lib/analysis";

export const metadata: Metadata = {
  title: "Gold (XAUUSD) Technical Analysis · Kiaros Quant",
  description:
    "Institutional multi-timeframe orderflow blueprints, liquidity maps, and daily session execution playbooks for Gold (XAUUSD).",
};

export const revalidate = 60;

export default async function TechnicalAnalysisPage() {
  const analyses = await listPublishedAnalyses();

  return (
    <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-[#fafafa] relative text-zinc-900">
      <PageHeader        
        badge="GOLD (XAUUSD) ORDERFLOW"
        badgeDotColor="bg-amber-400"
        title="Gold (XAUUSD) Technical Analysis"
        subtitle="Institutional multi-timeframe orderflow blueprints, liquidity maps, and daily session execution playbooks exclusively for Gold (XAUUSD)."
      />

      <div className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 xl:px-12 page-container relative z-10">

        {/* Interactive Asset Analysis Workspace */}
        <AnalysisView analyses={analyses} />
      </div>
    </main>
  );
}
