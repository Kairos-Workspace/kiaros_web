import { getTranslations } from "@/lib/i18n/server";

import { PageHeader } from "@/components/shared/PageHeader";
import { SignalsBrowse } from "@/components/signals/SignalsBrowse";
import { getSessionToken } from "@/lib/auth-session";
import {
  parseAiSignalStrategy,
  parseSignalsBrowseTab,
} from "@/lib/signals-browse-tabs";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return {
    title: t("Live Signals Terminal"),
    description: t("Live real-time trade signals across sessions (SMC, ICT, BBMA) — entry, stop loss, profit targets, and audited outcomes."),
  };
}

export const revalidate = 30;

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; strategy?: string; page?: string }>;
}) {
  const [{ tab, strategy, page: pageParam }, accessToken] = await Promise.all([
    searchParams,
    getSessionToken(),
  ]);
  const currentTab = parseSignalsBrowseTab(tab);
  const currentStrategy = parseAiSignalStrategy(strategy);
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  return (
    <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-[#fafafa] relative text-zinc-900">
      <PageHeader
        theme="signals"
        title="Live Signals Terminal"
        subtitle="Real-time systematic setups across active trading sessions — precise entry levels, stop loss (SL), multi-target profit ladders (TP), and quantitative Algo + LLM neural validation."
      />

      <div className="page-container relative z-10 w-full flex-1 py-6 sm:py-8 lg:py-10">

        <SignalsBrowse
          tab={currentTab}
          strategy={currentStrategy}
          page={page}
          basePath="/signals"
          accessToken={accessToken}
          hideFilter
        />
      </div>
    </main>
  );
}
