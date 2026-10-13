"use client";

import { DailyPnLCalendar } from "@/components/shared/DailyPnLCalendar";
import type { DailyPnL } from "@/lib/signals";
import type { BreakdownRow, ClosedTrade, EquityPoint, Summary } from "@/lib/track-record";

export type TrackRecordTabsProps = {
  summary?: Summary;
  equity?: EquityPoint[];
  byStrategy?: BreakdownRow[];
  bySymbol?: BreakdownRow[];
  byTimeframe?: BreakdownRow[];
  dailyPnL: DailyPnL[];
  recent?: ClosedTrade[];
};

export function TrackRecordTabs({
  dailyPnL = [],
  summary,
  bySymbol,
}: TrackRecordTabsProps) {
  return (
    <div className="w-full">
      <DailyPnLCalendar
        data={dailyPnL}
        summary={summary}
        bySymbol={bySymbol}
        description={null}
      />
    </div>
  );
}
