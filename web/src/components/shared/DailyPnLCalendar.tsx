"use client";

import { useMemo, useState } from "react";

import type { DailyPnL } from "@/lib/signals";

const DAYS_OF_WEEK = [
  { label: "Mon", full: "Monday", weekend: false },
  { label: "Tue", full: "Tuesday", weekend: false },
  { label: "Wed", full: "Wednesday", weekend: false },
  { label: "Thu", full: "Thursday", weekend: false },
  { label: "Fri", full: "Friday", weekend: false },
  { label: "Sat", full: "Saturday", weekend: true },
  { label: "Sun", full: "Sunday", weekend: true },
];

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const DEFAULT_DESCRIPTION =
  "Audited STP/ECN daily settlements — including full TP hits and partial profit scale-outs. Bar-close verified.";

type Props = {
  data: DailyPnL[];
  /** Optional blurb above the year tabs. Pass null to hide. */
  description?: string | null;
  /** When false, locks to the current month — no year tabs, no prev/next nav. */
  interactive?: boolean;
  /** Smaller day cells and tighter padding for compact placements. */
  compact?: boolean;
};

export function DailyPnLCalendar({
  data,
  description = DEFAULT_DESCRIPTION,
  interactive = true,
  compact = false,
}: Props) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    data.forEach((d) => {
      years.add(new Date(d.date).getFullYear());
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [data]);

  const setYear = (year: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setFullYear(year);
      return next;
    });
  };

  const prevMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const nextMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = MONTHS_EN[month];

  // Today formatted as YYYY-MM-DD
  const todayStr = useMemo(() => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: { dateObj: Date; isCurrentMonth: boolean }[] = [];

    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDate - i);
      days.push({ dateObj: d, isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ dateObj: new Date(year, month, i), isCurrentMonth: true });
    }

    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ dateObj: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days.map((day) => {
      const yyyy = day.dateObj.getFullYear();
      const mm = String(day.dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(day.dateObj.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const match = data.find((x) => x.date === dateStr);

      const wins = match?.wins ?? 0;
      const losses = match?.losses ?? 0;
      const totalTrades = wins + losses;
      const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

      return {
        ...day,
        dateStr,
        dayNum: day.dateObj.getDate(),
        isToday: dateStr === todayStr,
        net: match?.net ?? 0,
        wins,
        losses,
        totalTrades,
        winRate,
      };
    });
  }, [year, month, data, todayStr]);

  // Monthly aggregated KPIs
  const monthlyStats = useMemo(() => {
    let totalWins = 0;
    let totalLosses = 0;
    let greenDays = 0;
    let redDays = 0;
    let totalTradingDays = 0;

    for (const day of calendarGrid) {
      if (!day.isCurrentMonth || day.totalTrades === 0) continue;
      totalWins += day.wins;
      totalLosses += day.losses;
      totalTradingDays += 1;
      if (day.net > 0) greenDays += 1;
      else if (day.net < 0) redDays += 1;
    }

    const totalTrades = totalWins + totalLosses;
    const winRate = totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100) : 0;
    const netPnL = totalWins - totalLosses;
    const consistencyRate =
      totalTradingDays > 0 ? Math.round((greenDays / totalTradingDays) * 100) : 0;

    return {
      totalWins,
      totalLosses,
      totalTrades,
      winRate,
      netPnL,
      greenDays,
      redDays,
      totalTradingDays,
      consistencyRate,
    };
  }, [calendarGrid]);

  // Group into weekly rows of 7 days
  const weekRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < calendarGrid.length; i += 7) {
      const chunk = calendarGrid.slice(i, i + 7);
      let weekWins = 0;
      let weekLosses = 0;
      let hasCurrentMonthDay = false;

      chunk.forEach((d) => {
        if (d.isCurrentMonth) {
          hasCurrentMonthDay = true;
          weekWins += d.wins;
          weekLosses += d.losses;
        }
      });

      const totalWeekTrades = weekWins + weekLosses;
      const weekNet = weekWins - weekLosses;
      const weekWinRate =
        totalWeekTrades > 0 ? Math.round((weekWins / totalWeekTrades) * 100) : 0;

      rows.push({
        days: chunk,
        weekNumber: Math.floor(i / 7) + 1,
        weekWins,
        weekLosses,
        totalWeekTrades,
        weekNet,
        weekWinRate,
        hasCurrentMonthDay,
      });
    }
    return rows;
  }, [calendarGrid]);

  return (
    <div className={`overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-950 text-white shadow-2xl ${compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}`}>
      {/* 1. Header & Description */}
      {description ? (
        <div className="mb-6 flex flex-col items-center text-center">
          <p className="max-w-2xl text-xs sm:text-sm text-zinc-400 leading-relaxed">{description}</p>
        </div>
      ) : null}

      {/* 2. Interactive Navigation Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-5">
        {/* Year Selector Pills */}
        {interactive ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {availableYears.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                  year === y
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        ) : <div />}

        {/* Month Selector Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {interactive ? (
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 shadow-sm hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          ) : null}

          <div className="flex items-center gap-2 px-1">
            <span className="min-w-[130px] text-center font-bold text-base text-white tracking-tight">
              {monthName} {year}
            </span>
            {interactive ? (
              <button
                type="button"
                onClick={goToToday}
                className="rounded-md border border-zinc-700 bg-zinc-800/90 px-2 py-1 font-mono text-[10px] font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                title="Jump to today"
              >
                TODAY
              </button>
            ) : null}
          </div>

          {interactive ? (
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 shadow-sm hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* 3. Monthly Metrics HUD Strip */}
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 font-mono">
        {/* Win Rate */}
        <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/80 p-3 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Monthly Win Rate</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-xl font-black ${monthlyStats.winRate >= 60 ? "text-emerald-400" : monthlyStats.winRate > 0 ? "text-zinc-200" : "text-zinc-600"}`}>
              {monthlyStats.totalTrades > 0 ? `${monthlyStats.winRate}%` : "—"}
            </span>
            {monthlyStats.totalTrades > 0 && (
              <span className="text-[10px] font-semibold text-zinc-400">
                ({monthlyStats.totalWins}W / {monthlyStats.totalLosses}L)
              </span>
            )}
          </div>
        </div>

        {/* Settlements */}
        <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/80 p-3 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Settlements</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-xl font-black ${monthlyStats.netPnL > 0 ? "text-emerald-400" : monthlyStats.netPnL < 0 ? "text-rose-400" : "text-zinc-500"}`}>
              {monthlyStats.netPnL > 0 ? `+${monthlyStats.netPnL}TP` : monthlyStats.netPnL < 0 ? `${monthlyStats.netPnL}SL` : "0TP"}
            </span>
            <span className="text-[10px] font-semibold text-zinc-500">monthly balance</span>
          </div>
        </div>

        {/* Green vs Red Days */}
        <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/80 p-3 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Session Consistency</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-400">{monthlyStats.greenDays}G</span>
            <span className="text-sm font-bold text-zinc-600">/</span>
            <span className="text-xl font-black text-rose-400">{monthlyStats.redDays}R</span>
            <span className="text-[10px] font-semibold text-zinc-500">days</span>
          </div>
        </div>

        {/* Total Setups */}
        <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/80 p-3 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Closed Trades</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white">{monthlyStats.totalTrades}</span>
            <span className="text-[10px] font-semibold text-zinc-500">signals settled</span>
          </div>
        </div>
      </div>

      {/* 4. Calendar Matrix (7 Days + Weekly Summary Column) */}
      <div className="custom-scrollbar w-full overflow-x-auto pb-2">
        <div className={compact ? "min-w-[640px]" : "min-w-[820px]"}>
          {/* Weekday Column Headers */}
          <div className="mb-2 grid grid-cols-8 gap-2 font-mono text-[11px] font-bold tracking-wider">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day.label}
                className={`py-1.5 text-center uppercase rounded-md border ${
                  day.weekend
                    ? "bg-zinc-900/40 border-zinc-900 text-zinc-500"
                    : "bg-zinc-900 border-zinc-800/70 text-zinc-300"
                }`}
              >
                {day.label}
              </div>
            ))}
            <div className="py-1.5 text-center uppercase rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              WEEK
            </div>
          </div>

          {/* Week Rows */}
          <div className="space-y-2">
            {weekRows.map((row) => (
              <div key={row.weekNumber} className="grid grid-cols-8 gap-2">
                {/* 7 Days of the Week */}
                {row.days.map((day, dIdx) => {
                  const hasTrades = day.totalTrades > 0;
                  const isPositive = day.net > 0;
                  const isNegative = day.net < 0;

                  // Dynamic modern dark card styling
                  let cellStyle = "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700";
                  if (!day.isCurrentMonth) {
                    cellStyle = "bg-zinc-950/40 border-zinc-900/40 opacity-25";
                  } else if (hasTrades) {
                    if (isPositive) {
                      cellStyle =
                        "bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-400 shadow-[inset_0_1px_0_rgba(16,185,129,0.2)]";
                    } else if (isNegative) {
                      cellStyle =
                        "bg-rose-950/30 border-rose-500/40 hover:border-rose-400 shadow-[inset_0_1px_0_rgba(244,63,94,0.2)]";
                    } else {
                      cellStyle = "bg-zinc-900/90 border-zinc-700";
                    }
                  }

                  return (
                    <div
                      key={`${day.dateStr}-${dIdx}`}
                      className={`group relative flex flex-col justify-between rounded-xl border p-2 transition-all ${compact ? "h-20" : "h-26"} ${cellStyle}`}
                    >
                      {/* Top Bar: Date number + Status indicator */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-5 w-5 items-center justify-center font-mono text-xs font-bold ${
                            day.isToday
                              ? "rounded-full bg-white text-zinc-950 font-black shadow-sm"
                              : day.isCurrentMonth
                              ? isPositive
                                ? "text-emerald-300"
                                : isNegative
                                ? "text-rose-300"
                                : "text-zinc-300"
                              : "text-zinc-600"
                          }`}
                        >
                          {day.dayNum}
                        </span>

                        {hasTrades && (
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isPositive
                                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                                : isNegative
                                ? "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]"
                                : "bg-zinc-500"
                            }`}
                          />
                        )}
                      </div>

                      {/* Middle & Bottom: Outcome Data */}
                      <div className="flex flex-1 flex-col items-center justify-center font-mono">
                        {hasTrades ? (
                          <div className="flex flex-col items-center gap-1 text-center">
                            {/* TP & SL Stats only */}
                            <div className="flex items-center gap-1 text-[11px] font-black">
                              <span
                                className={`rounded px-1.5 py-0.5 border ${
                                  day.wins > 0
                                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                    : "bg-zinc-900/80 border-zinc-800 text-zinc-500"
                                }`}
                              >
                                {day.wins} TP
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 border ${
                                  day.losses > 0
                                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                                    : "bg-zinc-900/80 border-zinc-800 text-zinc-500"
                                }`}
                              >
                                {day.losses} SL
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span className="text-zinc-700 select-none text-xs">·</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 8th Column: Weekly Summary Box */}
                <div
                  className={`flex flex-col justify-between rounded-xl border p-2 font-mono transition-all ${
                    compact ? "h-20" : "h-26"
                  } ${
                    row.totalWeekTrades > 0
                      ? row.weekNet > 0
                        ? "border-emerald-500/40 bg-emerald-950/25 text-emerald-300 shadow-sm"
                        : row.weekNet < 0
                        ? "border-rose-500/40 bg-rose-950/25 text-rose-300 shadow-sm"
                        : "border-zinc-700 bg-zinc-900/80 text-zinc-300"
                      : "border-zinc-900 bg-zinc-900/20 text-zinc-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400">
                      W{row.weekNumber}
                    </span>
                    {row.totalWeekTrades > 0 && (
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {row.totalWeekTrades} trades
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    {row.totalWeekTrades > 0 ? (
                      <>
                        <span
                          className={`text-xs font-black ${
                            row.weekNet > 0
                              ? "text-emerald-400"
                              : row.weekNet < 0
                              ? "text-rose-400"
                              : "text-zinc-300"
                          }`}
                        >
                          {row.weekNet > 0 ? `+${row.weekNet}TP` : row.weekNet < 0 ? `${row.weekNet}SL` : "0TP"}
                        </span>
                        <span className="text-[10px] font-semibold text-zinc-400">
                          {row.weekWins} TP / {row.weekLosses} SL
                        </span>
                      </>
                    ) : (
                      <span className="text-zinc-700 text-xs">—</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Institutional Legend Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-4 font-mono text-[11px] text-zinc-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Profitable Day (+TP)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
            <span>Drawdown Day (-SL)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
            <span>No Trades / Flat</span>
          </div>
        </div>

        <div className="text-[10px] text-zinc-500">
          * Multi-tier TP wins (TP1/TP2/TP3) recorded at bar close settlement.
        </div>
      </div>
    </div>
  );
}
