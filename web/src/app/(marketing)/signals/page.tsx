import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { SignalsBrowse } from "@/components/signals/SignalsBrowse";
import { getSessionToken } from "@/lib/auth-session";
import {
  parseAiSignalStrategy,
  parseSignalsBrowseTab,
} from "@/lib/signals-browse-tabs";

export const metadata: Metadata = {
  title: "Live Signals Terminal",
  description:
    "Live real-time trade signals across sessions (SMC, ICT, BBMA) — entry, stop loss, profit targets, and audited outcomes.",
};

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
        title="Live Signals Terminal"
        subtitle="Real-time systematic setups across active trading sessions — precise entry levels, stop loss (SL), multi-target profit ladders (TP), and quantitative Algo + LLM neural validation."
      />

      <div className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 xl:px-12 page-container relative z-10">

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
