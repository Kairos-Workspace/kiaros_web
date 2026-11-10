import { getTranslations } from "@/lib/i18n/server";
import { Footer } from "@/components/shared/Footer";
import { PageHeader } from "@/components/shared/PageHeader";
import { ToolsGrid } from "@/components/tools/ToolsGrid";
import { getPublishedTools } from "@/lib/tools";

export const revalidate = 60;

export async function generateMetadata() {
  const { t } = await getTranslations();
  return {
    title: t("Trading Tools & MT5 EAs (Free Repository)"),
    description: t("Free MT5 Expert Advisors, TradingView indicators, and quantitative risk calculators from Kiaros."),
  };
}

export default async function ToolsPage() {
  const tools = await getPublishedTools();

  return (
    <>
      <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-[#fafafa] relative text-zinc-900">
        <PageHeader
          theme="tools"
          title="Trading Tools & MT5 EAs"
          subtitle="Free institutional MT5 Expert Advisors, custom TradingView indicators, and quantitative risk calculators — download directly or link via TradingView."
        />

        <div className="page-container relative z-10 w-full flex-1 py-6 sm:py-8 lg:py-10">
          <ToolsGrid tools={tools} />
        </div>
      </main>
      <Footer />
    </>
  );
}
