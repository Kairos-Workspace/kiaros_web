import { getTranslations } from "@/lib/i18n/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { CoinRadarView } from "@/components/coins/CoinRadarView";
import { fetchCoinAnalyses } from "@/lib/coins";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return {
    title: t("Crypto Radar & Coin Analysis · Kiaros Quant"),
    description: t("Quantitative cryptocurrency analysis: high-potential breakout candidates, overheated risk alerts, and institutional orderbook levels."),
  };
}

export const revalidate = 30;

export default async function CoinAnalysisPage() {
  const coins = await fetchCoinAnalyses();

  return (
    <main className="relative flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-[#f7f6f3] text-zinc-900">
      <div
        className="pointer-events-none absolute inset-x-0 top-[28rem] -z-0 h-[40rem] bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.06),transparent_55%)]"
        aria-hidden
      />
      <PageHeader
        theme="radar"
        title="Crypto Radar & Coin Analysis"
        subtitle="Real-time quantitative scoring: detect high-potential breakouts, overheated risk zones, and institutional key levels."
      />

      <div className="page-container relative z-10 w-full flex-1 py-6 sm:py-8 lg:py-10">
        <CoinRadarView initialCoins={coins} />
      </div>
    </main>
  );
}
