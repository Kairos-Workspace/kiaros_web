"use client";

import { DailyPnLCalendar } from "@/components/shared/DailyPnLCalendar";
import type { DailyPnL } from "@/lib/signals";
import type { BreakdownRow, ClosedTrade } from "@/lib/track-record";

type Props = {
  byStrategy?: BreakdownRow[];
  bySymbol?: BreakdownRow[];
  dailyPnL: DailyPnL[];
  recent?: ClosedTrade[];
};

export function TrackRecordTabs({ dailyPnL }: Props) {
  return (
    <div className="w-full">
      <DailyPnLCalendar data={dailyPnL} description={null} />
    </div>
  );
}
