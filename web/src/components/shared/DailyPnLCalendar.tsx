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

type Props = {
  data: DailyPnL[];
  description?: string | null;
  interactive?: boolean;
  compact?: boolean;
};

interface DayCellData {
  dateObj: Date;
  isCurrentMonth: boolean;
  dateStr: string;
  dayNum: number;
  isToday: boolean;
  net: number;
  wins: number;
  losses: number;
  totalTrades: number;
  winRate: number;
}

export function DailyPnLCalendar({
  data = [],
  description,
  interactive = true,
  compact = false,
}: Props) {
  // Determine smart default month: if data exists, default to the month with the most recent trade data
  const defaultDate = useMemo(() => {
    if (data.length > 0) {
      const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
      const parts = sorted[0].date.split("-");
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      }
    }
    return new Date();
  }, [data]);

  const [currentDate, setCurrentDate] = useState<Date>(() => defaultDate);
  const [selectedDay, setSelectedDay] = useState<DayCellData | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    data.forEach((d) => {
      const y = parseInt(d.date.split("-")[0], 10);
      if (!isNaN(y)) years.add(y);
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
    <div className="w-full space-y-6">
      {/* Main Studio Calendar Card */}
      <div className={`overflow-hidden rounded-3xl border border-zinc-200 bg-white text-zinc-950 shadow-sm ${compact ? "p-4 sm:p-5" : "p-6 sm:p-8"}`}>
        
        {/* 1. Header & Navigation Controls */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-6">
          {/* Month & Direction Chevrons */}
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              {monthName} {year}
            </h2>

            {interactive && (
              <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1 border border-zinc-200/80">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors cursor-pointer"
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors cursor-pointer"
                  aria-label="Next month"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={goToToday}
                  className="rounded-lg bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-zinc-900 shadow-2xs hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  TODAY
                </button>
              </div>
            )}
          </div>

          {/* Year Selector Pills */}
          {interactive && availableYears.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {availableYears.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={`rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                    year === y
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Monthly Performance HUD Tiles */}
        <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
          {/* Win Rate */}
          <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-4 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
              Monthly Win Rate
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className={`text-2xl font-black ${monthlyStats.winRate >= 60 ? "text-emerald-700" : monthlyStats.winRate > 0 ? "text-zinc-900" : "text-zinc-400"}`}>
                {monthlyStats.totalTrades > 0 ? `${monthlyStats.winRate}%` : "—"}
              </span>
              {monthlyStats.totalTrades > 0 && (
                <span className="text-xs font-semibold text-zinc-500">
                  ({monthlyStats.totalWins}W / {monthlyStats.totalLosses}L)
                </span>
              )}
            </div>
          </div>

          {/* Net Settlements */}
          <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-4 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
              Net Settlements
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className={`text-2xl font-black ${monthlyStats.netPnL > 0 ? "text-emerald-700" : monthlyStats.netPnL < 0 ? "text-rose-700" : "text-zinc-400"}`}>
                {monthlyStats.netPnL > 0 ? `+${monthlyStats.netPnL}TP` : monthlyStats.netPnL < 0 ? `${monthlyStats.netPnL}SL` : "0TP"}
              </span>
              <span className="text-xs font-semibold text-zinc-400">balance</span>
            </div>
          </div>

          {/* Session Consistency */}
          <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-4 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
              Session Consistency
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">{monthlyStats.greenDays}G</span>
              <span className="text-sm font-bold text-zinc-400">/</span>
              <span className="text-2xl font-black text-rose-700">{monthlyStats.redDays}R</span>
              <span className="text-xs font-semibold text-zinc-400">sessions</span>
            </div>
          </div>

          {/* Total Settlements */}
          <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-4 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
              Total Executions
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-950">{monthlyStats.totalTrades}</span>
              <span className="text-xs font-semibold text-zinc-400">trades settled</span>
            </div>
          </div>
        </div>

        {/* 3. Calendar Day Matrix Grid */}
        <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
          <div className={compact ? "min-w-[680px]" : "min-w-[860px]"}>
            {/* Weekday Column Headers */}
            <div className="mb-2.5 grid grid-cols-8 gap-2 font-mono text-[11px] font-bold tracking-wider">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day.label}
                  className={`py-2 text-center uppercase rounded-xl border ${
                    day.weekend
                      ? "bg-zinc-100/60 border-zinc-200/60 text-zinc-400"
                      : "bg-zinc-50 border-zinc-200/80 text-zinc-600"
                  }`}
                >
                  {day.label}
                </div>
              ))}
              <div className="py-2 text-center uppercase rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black">
                WEEK PNL
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

                    // Clean modern card styling
                    let cellBg = "bg-white border-zinc-200/80 hover:border-zinc-300";
                    if (!day.isCurrentMonth) {
                      cellBg = "bg-zinc-50/30 border-zinc-100 opacity-30 pointer-events-none";
                    } else if (hasTrades) {
                      if (isPositive) {
                        cellBg = "bg-emerald-50/70 border-emerald-200 hover:border-emerald-400 hover:shadow-xs";
                      } else if (isNegative) {
                        cellBg = "bg-rose-50/70 border-rose-200 hover:border-rose-400 hover:shadow-xs";
                      } else {
                        cellBg = "bg-zinc-50 border-zinc-200 hover:border-zinc-300";
                      }
                    }

                    return (
                      <button
                        key={`${day.dateStr}-${dIdx}`}
                        type="button"
                        onClick={() => hasTrades && setSelectedDay(day)}
                        disabled={!hasTrades}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-2.5 transition-all text-left ${compact ? "h-22" : "h-26"} ${cellBg} ${hasTrades ? "cursor-pointer" : "cursor-default"}`}
                      >
                        {/* Day number & Today Pill */}
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`flex h-6 w-6 items-center justify-center font-mono text-xs font-bold rounded-full ${
                              day.isToday
                                ? "bg-zinc-950 text-white font-black shadow-xs"
                                : day.isCurrentMonth
                                ? "text-zinc-700"
                                : "text-zinc-300"
                            }`}
                          >
                            {day.dayNum}
                          </span>

                          {hasTrades && (
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isPositive
                                  ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                                  : isNegative
                                  ? "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                                  : "bg-zinc-400"
                              }`}
                            />
                          )}
                        </div>

                        {/* Middle & Bottom: Outcome Data */}
                        <div className="flex flex-1 flex-col items-center justify-center font-mono w-full">
                          {hasTrades ? (
                            <div className="flex flex-col items-center gap-1 text-center w-full">
                              {/* Hero Net Pill */}
                              <span
                                className={`px-2 py-0.5 rounded-lg text-xs font-black shadow-2xs ${
                                  isPositive
                                    ? "bg-emerald-100/90 text-emerald-900 border border-emerald-300"
                                    : isNegative
                                    ? "bg-rose-100/90 text-rose-900 border border-rose-300"
                                    : "bg-zinc-100 text-zinc-800 border border-zinc-200"
                                }`}
                              >
                                {isPositive ? `+${day.net} TP` : isNegative ? `${day.net} SL` : "FLAT"}
                              </span>

                              {/* TP & SL Stats for detailed breakout and test assertions */}
                              <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                                <span className={day.wins > 0 ? "text-emerald-800 font-extrabold" : "text-zinc-400"}>
                                  {day.wins} TP
                                </span>
                                <span>·</span>
                                <span className={day.losses > 0 ? "text-rose-800 font-extrabold" : "text-zinc-400"}>
                                  {day.losses} SL
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-300 select-none text-xs">·</span>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {/* 8th Column: Weekly Summary Box */}
                  <div
                    className={`flex flex-col justify-between rounded-2xl border p-2.5 font-mono transition-all ${
                      compact ? "h-22" : "h-26"
                    } ${
                      row.totalWeekTrades > 0
                        ? row.weekNet > 0
                          ? "border-emerald-200 bg-emerald-50/80 text-emerald-900 shadow-2xs"
                          : row.weekNet < 0
                          ? "border-rose-200 bg-rose-50/80 text-rose-900 shadow-2xs"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700"
                        : "border-zinc-100 bg-zinc-50/40 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-zinc-500">W{row.weekNumber}</span>
                      {row.totalWeekTrades > 0 && (
                        <span className="text-zinc-400">{row.totalWeekTrades} trades</span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      {row.totalWeekTrades > 0 ? (
                        <>
                          <span
                            className={`text-sm font-black ${
                              row.weekNet > 0
                                ? "text-emerald-800"
                                : row.weekNet < 0
                                ? "text-rose-800"
                                : "text-zinc-700"
                            }`}
                          >
                            {row.weekNet > 0 ? `+${row.weekNet} TP` : row.weekNet < 0 ? `${row.weekNet} SL` : "0 TP"}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-500 mt-0.5">
                            {row.weekWins} TP · {row.weekLosses} SL
                          </span>
                        </>
                      ) : (
                        <span className="text-zinc-300 text-xs">—</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Institutional Legend Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-5 font-mono text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
              <span className="font-semibold text-zinc-700">Profitable Session (+TP)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
              <span className="font-semibold text-zinc-700">Drawdown Session (-SL)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
              <span>Flat / Market Closed</span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400">
            * Multi-tier TP wins (TP1/TP2/TP3) settled at bar close via STP/ECN audited execution.
          </div>
        </div>
      </div>

      {/* 5. Day Inspection Detail Modal */}
      {selectedDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Trading Session Breakdown
                </span>
                <h3 className="font-mono text-lg font-black text-zinc-950 mt-1">
                  {selectedDay.dateStr}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="rounded-lg bg-zinc-100 p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-950 transition-colors cursor-pointer"
                aria-label="Close session details"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Session Net</span>
                  <span className={`text-xl font-black ${selectedDay.net > 0 ? "text-emerald-700" : selectedDay.net < 0 ? "text-rose-700" : "text-zinc-600"}`}>
                    {selectedDay.net > 0 ? `+${selectedDay.net} TP` : selectedDay.net < 0 ? `${selectedDay.net} SL` : "0 TP"}
                  </span>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Win Rate</span>
                  <span className="text-xl font-black text-zinc-950">
                    {selectedDay.winRate}%
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Take Profit Targets (TP):</span>
                  <span className="font-bold text-emerald-800 font-mono">{selectedDay.wins} Wins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Stop Loss Hits (SL):</span>
                  <span className="font-bold text-rose-800 font-mono">{selectedDay.losses} Losses</span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-200 pt-2">
                  <span className="text-zinc-600 font-bold">Total Signals Executed:</span>
                  <span className="font-black text-zinc-950 font-mono">{selectedDay.totalTrades}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="rounded-xl bg-zinc-950 px-4 py-2 font-mono text-xs font-bold text-white shadow-xs hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
