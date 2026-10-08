import type { Metadata } from "next";

import { DeleteSignalButton } from "@/components/admin/DeleteSignalButton";
import { ExportSignalsMenu } from "@/components/admin/ExportSignalsMenu";
import { SignalCard } from "@/components/dashboard/SignalsGrid";
import { Pagination } from "@/components/shared/Pagination";
import {
  SignalsBrowseFilter,
} from "@/components/signals/SignalsBrowseFilter";
import { requireAdminPage } from "@/lib/admin-guard";
import {
  getSignalsPaginated,
  getStats,
} from "@/lib/signals";
import { ADMIN_SIGNAL_FILTER_OPTIONS } from "@/lib/signals-browse-tabs";
import { serviceRoleToken } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin · Signals",
};

export const revalidate = 30;

type SignalsTab =
  | "all"
  | "llm"
  | "super-scalping"
  | "scalping"
  | "swing"
  | "bbma"
  | "smc";

function parseTab(tab: string | undefined): SignalsTab {
  if (tab === "llm") return "llm";
  if (tab === "swing") return "swing";
  if (tab === "scalping") return "scalping";
  if (tab === "super-scalping") return "super-scalping";
  if (tab === "bbma") return "bbma";
  if (tab === "smc") return "smc";
  return "all";
}

export default async function AdminSignals({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  await requireAdminPage();
  const { tab, page: pageParam } = await searchParams;

  const currentTab = parseTab(tab);
  const isBbmaTab = currentTab === "bbma";
  const timeframe =
    currentTab === "swing"
      ? "1h"
      : currentTab === "scalping"
        ? "15m"
        : currentTab === "super-scalping"
          ? "5m"
          : currentTab === "bbma"
            ? "bbma"
            : currentTab === "smc"
              ? "smc"
              : undefined;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const isLlmTab = currentTab === "llm";

  const token = serviceRoleToken();
  const [pageData, stats] = await Promise.all([
    getSignalsPaginated(
      page,
      token,
      isBbmaTab ? undefined : timeframe,
      undefined,
      isBbmaTab ? "bbma" : "default",
    ),
    getStats(
      token,
      isBbmaTab ? "bbma" : timeframe,
      isBbmaTab ? "bbma" : "default",
    ),
  ]);
  const { signals, total, totalPages, pageSize } = pageData;
  const exportableCount = stats.tpHits + stats.partialWins + stats.slHits;

  const extraParams: Record<string, string> =
    currentTab !== "all" ? { tab: currentTab } : {};

  const exportTab =
    currentTab === "super-scalping" ||
    currentTab === "scalping" ||
    currentTab === "swing" ||
    currentTab === "smc"
      ? currentTab
      : "all";

  const title = isLlmTab ? "LLM Signals" : "Signals";
  const subtitle = isLlmTab
    ? "Every signal SEA-LION confirmed and stored. Same cards as the main list, scoped to LLM-approved setups."
    : "Manage and view all stored signals. Export includes TP/SL hits only.";

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950">{title} ({total})</h1>
          <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
        </div>
        <ExportSignalsMenu tab={exportTab} disabled={exportableCount === 0} />
      </div>

      <div>
        <SignalsBrowseFilter
          tab={currentTab}
          basePath="/admin/signals"
          options={ADMIN_SIGNAL_FILTER_OPTIONS}
          label="Filter"
        />
      </div>

      {isLlmTab ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
              NEURAL CONFLUENCE VALIDATION ACTIVE
            </p>
          </div>
          <p className="mt-1.5 font-mono text-xs text-zinc-300">
            {`Showing ${total} SEA-LION confirmed signal${total === 1 ? "" : "s"} across institutional timeframes.`}
          </p>
        </div>
      ) : null}

      {signals.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {signals.map((s) => (
              <SignalCard
                key={s.id}
                signal={s}
                showLlmBadge={isLlmTab}
                adminSlot={
                  <DeleteSignalButton
                    id={s.id}
                    triggerClassName="text-[10px] font-bold uppercase tracking-wider text-short hover:underline bg-short/10 px-2 py-1 rounded z-10 relative"
                  />
                }
              />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            basePath="/admin/signals"
            extraParams={extraParams}
          />
        </>
      ) : (
        <p className="mt-8 text-sm text-slate">
          {isLlmTab
            ? "No LLM-confirmed signals yet."
            : "No signals found for this category."}
        </p>
      )}
    </div>
  );
}
