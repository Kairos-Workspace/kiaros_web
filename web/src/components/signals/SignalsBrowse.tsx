import { SignalsGrid } from "@/components/dashboard/SignalsGrid";
import { AiStrategyRail } from "@/components/signals/AiStrategyRail";
import { Pagination } from "@/components/shared/Pagination";
import { SignalsBrowseFilter } from "@/components/signals/SignalsBrowseFilter";
import { SignalsSessionRail } from "@/components/signals/SignalsSessionRail";
import {
  getSignals,
  getSignalsPaginated,
  type SignalLane,
} from "@/lib/signals";
import {
  comingSoonFilterOption,
  type AiSignalStrategy,
  type SignalsBrowseTab,
} from "@/lib/signals-browse-tabs";

const ALL_PAGE_SIZE = 20;

export type { AiSignalStrategy, SignalsBrowseTab };
export { parseAiSignalStrategy, parseSignalsBrowseTab } from "@/lib/signals-browse-tabs";

const AI_STRATEGY_META: Record<
  Exclude<AiSignalStrategy, "all">,
  { title: string; subtitle: string; emptyHint: string; timeframe?: string }
> = {
  "super-scalping": {
    title: "Super Scalping",
    subtitle: "5m ICT — sweep, CHoCH, FVG retest",
    emptyHint: "Setups appear after every 5m close.",
    timeframe: "5m",
  },
  scalping: {
    title: "Scalping",
    subtitle: "15m cloud rejection + CHoCH",
    emptyHint: "Setups appear after every 15m close.",
    timeframe: "15m",
  },
  swing: {
    title: "Swing",
    subtitle: "1h setups confirmed by AI",
    emptyHint: "Setups appear after every 1h close.",
    timeframe: "1h",
  },
};

const BBMA_SESSION = {
  title: "BBMA",
  subtitle: "XAU H1 — Direct MT5 EA, no AI filter",
  timeframe: "bbma",
  lane: "bbma" as SignalLane,
  emptyHint: "New setups print when H1 bar closes from EA.",
};

const SMC_SESSION = {
  title: "SMC",
  subtitle: "XAU H1 — Liquidity sweep + CHoCH, direct MT5 EA, no AI filter",
  timeframe: "smc",
  lane: "default" as SignalLane,
  emptyHint: "New setups print when H1 bar closes from EA.",
};

function ComingSoonStrategy({
  label,
  hint,
}: {
  label: string;
  hint: string;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-ink">{label}</h2>
        <p className="mt-1 text-sm text-slate">{hint}</p>
      </div>
      <div className="rounded-2xl border border-dashed border-line bg-card/60 p-12 text-center backdrop-blur-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-card text-ink mb-3">
          <span className="h-4 w-4 rounded-full border-2 border-line-highlight border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-bold text-ink">
          Strategy {label} Coming Soon
        </p>
        <p className="mx-auto mt-1.5 max-w-sm text-xs text-slate">
          Signals will appear here when this quantitative model is deployed.
        </p>
      </div>
    </section>
  );
}


async function SessionBlock({
  title,
  timeframe,
  lane,
  emptyHint,
  accessToken,
}: {
  title: string;
  timeframe: string;
  lane: SignalLane;
  emptyHint: string;
  accessToken: string | undefined;
}) {
  const signals = await getSignals(
    30,
    accessToken,
    timeframe === "bbma" ? undefined : timeframe,
    lane,
  );

  return (
    <section className="space-y-5">
      {signals.length > 0 ? (
        <SignalsGrid signals={signals} />
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-card px-6 py-14 text-center">
          <p className="text-sm font-semibold text-ink">No {title} signals yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate">{emptyHint}</p>
        </div>
      )}
    </section>
  );
}

export async function SignalsBrowse({
  tab,
  strategy = "all",
  page = 1,
  accessToken,
  basePath,
  hideFilter = false,
}: {
  tab: SignalsBrowseTab;
  strategy?: AiSignalStrategy;
  page?: number;
  accessToken?: string;
  basePath: string;
  hideFilter?: boolean;
}) {
  const comingSoon = comingSoonFilterOption(tab);
  const isAllTab = tab === "all";
  const isAiTab = tab === "ai";
  const isAiStrategy = isAiTab;
  // "all" strategies within AI Signal has no timeframe filter — only a
  // specific strategy (super-scalping/scalping/swing) narrows it.
  const aiStrategyTimeframe =
    isAiStrategy && strategy !== "all" ? AI_STRATEGY_META[strategy].timeframe : undefined;

  const [allPage, aiPage] = await Promise.all([
    isAllTab
      ? getSignalsPaginated(page, accessToken, undefined, ALL_PAGE_SIZE)
      : null,
    isAiStrategy
      ? getSignalsPaginated(page, accessToken, aiStrategyTimeframe, ALL_PAGE_SIZE, "ai")
      : null,
  ]);

  const aiPaginationParams: Record<string, string> =
    strategy === "all" ? { tab: "ai" } : { tab: "ai", strategy };

  return (
    <div className="w-full space-y-8">
      {hideFilter ? (
        <SignalsSessionRail tab={tab} basePath={basePath} />
      ) : (
        <SignalsBrowseFilter tab={tab} basePath={basePath} showLabel={false} compact />
      )}

      {isAiTab ? <AiStrategyRail strategy={strategy} basePath={basePath} /> : null}

      {comingSoon ? (
        <ComingSoonStrategy label={comingSoon.label} hint={comingSoon.hint} />
      ) : isAllTab && allPage ? (
        <section className="space-y-5">
          {allPage.signals.length > 0 ? (
            <>
              <SignalsGrid signals={allPage.signals} />
              <Pagination
                page={allPage.page}
                totalPages={allPage.totalPages}
                total={allPage.total}
                pageSize={allPage.pageSize}
                basePath={basePath}
              />
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-card px-6 py-14 text-center">
              <p className="text-sm font-semibold text-ink">No signals available yet</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate">
                New trade setups will appear here as sessions activate.
              </p>
            </div>
          )}
        </section>
      ) : isAiStrategy && aiPage ? (
        <section className="space-y-5">
          {aiPage.signals.length > 0 ? (
            <>
              <SignalsGrid signals={aiPage.signals} />
              <Pagination
                page={aiPage.page}
                totalPages={aiPage.totalPages}
                total={aiPage.total}
                pageSize={aiPage.pageSize}
                basePath={basePath}
                extraParams={aiPaginationParams}
              />
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-card px-6 py-14 text-center">
              <p className="text-sm font-semibold text-ink">No AI signals yet</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate">
                {strategy === "all"
                  ? "New setups will display here as SEA-LION confirms valid market conditions."
                  : AI_STRATEGY_META[strategy].emptyHint}
              </p>
            </div>
          )}
        </section>
      ) : tab === "smc" ? (
        <SessionBlock
          accessToken={accessToken}
          title={SMC_SESSION.title}
          timeframe={SMC_SESSION.timeframe}
          lane={SMC_SESSION.lane}
          emptyHint={SMC_SESSION.emptyHint}
        />
      ) : (
        <SessionBlock
          accessToken={accessToken}
          title={BBMA_SESSION.title}
          timeframe={BBMA_SESSION.timeframe}
          lane={BBMA_SESSION.lane}
          emptyHint={BBMA_SESSION.emptyHint}
        />
      )}
    </div>
  );
}
