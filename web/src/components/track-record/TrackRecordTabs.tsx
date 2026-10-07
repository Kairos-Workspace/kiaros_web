"use client";

import { useState } from "react";

import { DailyPnLCalendar } from "@/components/shared/DailyPnLCalendar";
import { Breakdown } from "@/components/track-record/Breakdown";
import { RecentTrades } from "@/components/track-record/RecentTrades";
import type { DailyPnL } from "@/lib/signals";
import type { BreakdownRow, ClosedTrade } from "@/lib/track-record";

type TabId = "calendar" | "breakdown" | "trades";

const TABS: { id: TabId; label: string }[] = [
  { id: "calendar", label: "Calendar" },
  { id: "breakdown", label: "Breakdown" },
  { id: "trades", label: "Trades" },
];

type Props = {
  byStrategy: BreakdownRow[];
  bySymbol: BreakdownRow[];
  dailyPnL: DailyPnL[];
  recent: ClosedTrade[];
};

export function TrackRecordTabs({
  byStrategy,
  bySymbol,
  dailyPnL,
  recent,
}: Props) {
  const [tab, setTab] = useState<TabId>("calendar");

  return (
    <div className="space-y-8">
      <ul
        role="tablist"
        aria-label="Performance sections"
        className="flex flex-wrap text-sm font-medium text-center text-zinc-600 border-b border-zinc-200"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <li key={t.id} className="me-2">
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`inline-block p-4 rounded-t-lg transition-colors cursor-pointer ${
                  active
                    ? "text-white bg-zinc-950 font-bold shadow-xs active"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>

      {tab === "calendar" ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink text-center">
              TP/SL Calendar
            </h2>
          </div>
          <DailyPnLCalendar data={dailyPnL} description={null} />
        </section>
      ) : null}

      {tab === "breakdown" ? (
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">Breakdown</h2>
            <p className="mt-1 text-sm text-slate">
              Win rate and net R by strategy and asset pair
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Breakdown title="By Strategy" rows={byStrategy} />
            <Breakdown title="By Symbol" rows={bySymbol} />
          </div>
        </section>
      ) : null}

      {tab === "trades" ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">
                Recent Trades
              </h2>
              <p className="mt-1 text-sm text-slate">Latest verified outcomes</p>
            </div>
            {recent.length > 0 ? (
              <p className="text-sm text-slate">
                {recent.length} trades
              </p>
            ) : null}
          </div>
          <RecentTrades trades={recent} />
        </section>
      ) : null}
    </div>
  );
}
