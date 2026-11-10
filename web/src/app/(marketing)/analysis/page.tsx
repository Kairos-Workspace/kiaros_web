import { getTranslations } from "@/lib/i18n/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { AnalysisView } from "@/components/analysis/AnalysisView";
import { listPublishedAnalyses } from "@/lib/analysis";
import { fetchMarketCandles } from "@/lib/markets/kraken";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return {
    title: t("Gold (XAUUSD) Technical Analysis · Kiaros Quant"),
    description: t("Daily Gold analysis focused on the important POI zones to watch — no trade calls."),
  };
}

export const revalidate = 60;

export default async function TechnicalAnalysisPage() {
  const [analyses, candles] = await Promise.all([
    listPublishedAnalyses(),
    fetchMarketCandles("XAUUSD", "1h", 72).catch(() => []),
  ]);

  return (
    <main className="relative flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-[#f7f6f3] text-zinc-900">
      <div
        className="pointer-events-none absolute inset-x-0 top-[28rem] -z-0 h-[40rem] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.06),transparent_55%)]"
        aria-hidden
      />
      <PageHeader
        theme="gold"
        title="Gold (XAUUSD) Technical Analysis"
        subtitle="Daily Gold analysis focused on the important POI zones to watch — no trade calls."
      />

      <div className="page-container relative z-10 w-full flex-1 py-6 sm:py-8 lg:py-10">
        <AnalysisView analyses={analyses} candles={candles} />
      </div>
    </main>
  );
}
