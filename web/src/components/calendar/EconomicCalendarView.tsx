"use client";

import { useMemo, useState } from "react";

export type EconomicEvent = {
  id: string;
  time: string;
  session: "London" | "New York" | "Tokyo" | "Sydney";
  currency: "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD";
  event: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  actual: string | null;
  forecast: string;
  previous: string;
  dateTag: "today" | "tomorrow" | "this-week";
  dateFormatted: string;
  algoAction: "Signal Shield Active (±15m)" | "Normal STP Execution" | "Volatility Expansion Warning";
};

const ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    id: "e1",
    time: "12:30 GMT",
    session: "New York",
    currency: "USD",
    event: "Core CPI (MoM)",
    impact: "HIGH",
    actual: null,
    forecast: "0.3%",
    previous: "0.3%",
    dateTag: "today",
    dateFormatted: "Wednesday, Oct 7",
    algoAction: "Signal Shield Active (±15m)",
  },
  {
    id: "e2",
    time: "12:30 GMT",
    session: "New York",
    currency: "USD",
    event: "CPI Inflation Rate (YoY)",
    impact: "HIGH",
    actual: null,
    forecast: "2.4%",
    previous: "2.5%",
    dateTag: "today",
    dateFormatted: "Wednesday, Oct 7",
    algoAction: "Signal Shield Active (±15m)",
  },
  {
    id: "e3",
    time: "14:00 GMT",
    session: "New York",
    currency: "USD",
    event: "FOMC Member Jefferson Speaks",
    impact: "MEDIUM",
    actual: null,
    forecast: "—",
    previous: "—",
    dateTag: "today",
    dateFormatted: "Wednesday, Oct 7",
    algoAction: "Volatility Expansion Warning",
  },
  {
    id: "e4",
    time: "18:00 GMT",
    session: "New York",
    currency: "USD",
    event: "FOMC Meeting Minutes",
    impact: "HIGH",
    actual: null,
    forecast: "—",
    previous: "—",
    dateTag: "today",
    dateFormatted: "Wednesday, Oct 7",
    algoAction: "Signal Shield Active (±15m)",
  },
  {
    id: "e5",
    time: "07:00 GMT",
    session: "London",
    currency: "GBP",
    event: "GDP (MoM)",
    impact: "HIGH",
    actual: "0.2%",
    forecast: "0.1%",
    previous: "0.0%",
    dateTag: "today",
    dateFormatted: "Wednesday, Oct 7",
    algoAction: "Normal STP Execution",
  },
  {
    id: "e6",
    time: "08:00 GMT",
    session: "London",
    currency: "EUR",
    event: "ECB Monetary Policy Statement",
    impact: "HIGH",
    actual: null,
    forecast: "3.25%",
    previous: "3.50%",
    dateTag: "tomorrow",
    dateFormatted: "Thursday, Oct 8",
    algoAction: "Signal Shield Active (±15m)",
  },
  {
    id: "e7",
    time: "12:30 GMT",
    session: "New York",
    currency: "USD",
    event: "Initial Jobless Claims",
    impact: "MEDIUM",
    actual: null,
    forecast: "220K",
    previous: "225K",
    dateTag: "tomorrow",
    dateFormatted: "Thursday, Oct 8",
    algoAction: "Normal STP Execution",
  },
  {
    id: "e8",
    time: "12:30 GMT",
    session: "New York",
    currency: "USD",
    event: "PPI Final Demand (MoM)",
    impact: "MEDIUM",
    actual: null,
    forecast: "0.2%",
    previous: "0.2%",
    dateTag: "tomorrow",
    dateFormatted: "Thursday, Oct 8",
    algoAction: "Normal STP Execution",
  },
  {
    id: "e9",
    time: "12:30 GMT",
    session: "New York",
    currency: "USD",
    event: "Non-Farm Employment Change (NFP)",
    impact: "HIGH",
    actual: null,
    forecast: "140K",
    previous: "142K",
    dateTag: "this-week",
    dateFormatted: "Friday, Oct 9",
    algoAction: "Signal Shield Active (±15m)",
  },
  {
    id: "e10",
    time: "12:30 GMT",
    session: "New York",
    currency: "USD",
    event: "Unemployment Rate",
    impact: "HIGH",
    actual: null,
    forecast: "4.2%",
    previous: "4.2%",
    dateTag: "this-week",
    dateFormatted: "Friday, Oct 9",
    algoAction: "Signal Shield Active (±15m)",
  },
  {
    id: "e11",
    time: "14:00 GMT",
    session: "New York",
    currency: "USD",
    event: "Michigan Consumer Sentiment",
    impact: "MEDIUM",
    actual: null,
    forecast: "70.1",
    previous: "70.1",
    dateTag: "this-week",
    dateFormatted: "Friday, Oct 9",
    algoAction: "Volatility Expansion Warning",
  },
  {
    id: "e12",
    time: "23:50 GMT",
    session: "Tokyo",
    currency: "JPY",
    event: "Bank of Japan (BOJ) Summary of Opinions",
    impact: "MEDIUM",
    actual: null,
    forecast: "—",
    previous: "—",
    dateTag: "this-week",
    dateFormatted: "Friday, Oct 9",
    algoAction: "Normal STP Execution",
  },
];

export function EconomicCalendarView() {
  const [impactFilter, setImpactFilter] = useState<"ALL" | "HIGH" | "MEDIUM">("ALL");
  const [currencyFilter, setCurrencyFilter] = useState<string>("ALL");
  const [dayFilter, setDayFilter] = useState<"all" | "today" | "tomorrow" | "this-week">("all");

  const filteredEvents = useMemo(() => {
    return ECONOMIC_EVENTS.filter((e) => {
      if (impactFilter === "HIGH" && e.impact !== "HIGH") return false;
      if (impactFilter === "MEDIUM" && e.impact === "LOW") return false;
      if (currencyFilter !== "ALL" && e.currency !== currencyFilter) return false;
      if (dayFilter !== "all" && e.dateTag !== dayFilter) return false;
      return true;
    });
  }, [impactFilter, currencyFilter, dayFilter]);

  return (
    <div className="w-full space-y-8">
      {/* 1. Next Major Volatility Catalyst Spotlight */}
      <div className="border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded bg-rose-100 border border-rose-300 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-rose-800">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" />
                HIGH-IMPACT CATALYST PENDING
              </span>
              <span className="font-mono text-xs text-zinc-500">New York Session</span>
            </div>
            <h2 className="text-xl font-black text-zinc-950 sm:text-2xl font-mono">
              USD · Core Consumer Price Index (CPI MoM)
            </h2>
            <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">
              Consensus forecasts 0.3% MoM increase. High likelihood of liquidity sweeps across Gold (XAUUSD) 
              and USD pairs. Kiaros algorithmic engines automatically engage a ±15-minute protective execution lock.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="border border-zinc-200 bg-zinc-50 p-3 font-mono text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Forecast</span>
              <span className="text-base font-black text-zinc-950">0.3%</span>
            </div>
            <div className="border border-zinc-200 bg-zinc-50 p-3 font-mono text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Previous</span>
              <span className="text-base font-black text-zinc-600">0.3%</span>
            </div>
            <div className="border border-rose-200 bg-rose-50/70 p-3 font-mono text-center min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Engine Protection</span>
              <span className="text-xs font-black text-rose-800">SHIELD ENGAGED</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-5">
        {/* Day Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Upcoming" },
            { id: "today", label: "Today" },
            { id: "tomorrow", label: "Tomorrow" },
            { id: "this-week", label: "This Week" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDayFilter(tab.id as typeof dayFilter)}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
                dayFilter === tab.id
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Impact & Currency Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Impact Selector */}
          <div className="flex items-center gap-1 border border-zinc-200 bg-white p-1 text-xs font-mono">
            <span className="px-2 text-[10px] font-bold text-zinc-500 uppercase">Impact:</span>
            {(["ALL", "HIGH", "MEDIUM"] as const).map((imp) => (
              <button
                key={imp}
                type="button"
                onClick={() => setImpactFilter(imp)}
                className={`px-2 py-0.5 text-[11px] font-bold transition-colors cursor-pointer ${
                  impactFilter === imp
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                {imp === "HIGH" ? "🔴 High" : imp === "MEDIUM" ? "🟠 Med+" : "All"}
              </button>
            ))}
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-1 border border-zinc-200 bg-white p-1 text-xs font-mono">
            <span className="px-2 text-[10px] font-bold text-zinc-500 uppercase">Currency:</span>
            {["ALL", "USD", "EUR", "GBP", "JPY"].map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setCurrencyFilter(curr)}
                className={`px-2 py-0.5 text-[11px] font-bold transition-colors cursor-pointer ${
                  currencyFilter === curr
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Global Economic Schedule Table */}
      <div className="border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-mono text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Macroeconomic Event Matrix
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Showing {filteredEvents.length} scheduled institutional catalysts
            </p>
          </div>
          <div className="font-mono text-xs text-zinc-600 hidden sm:block">
            All times standardized to <span className="font-bold text-zinc-950">GMT / UTC</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-100/70 text-[11px] font-bold text-zinc-600 uppercase">
              <tr>
                <th className="px-6 py-3">Time & Date</th>
                <th className="px-6 py-3">Currency</th>
                <th className="px-6 py-3">Economic Catalyst</th>
                <th className="px-6 py-3">Impact</th>
                <th className="px-6 py-3">Actual</th>
                <th className="px-6 py-3">Forecast</th>
                <th className="px-6 py-3">Previous</th>
                <th className="px-6 py-3">Quant Shield Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span className="font-bold text-zinc-950 block">{evt.time}</span>
                    <span className="text-[10px] text-zinc-500 block">{evt.dateFormatted}</span>
                  </td>
                  <td className="px-6 py-3.5 font-black text-sm whitespace-nowrap">
                    <span className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-xs text-zinc-900">
                      {evt.currency}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-zinc-950">
                    <span>{evt.event}</span>
                    <span className="text-[10px] text-zinc-500 block font-normal mt-0.5">
                      Session: {evt.session}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                        evt.impact === "HIGH"
                          ? "bg-rose-50 text-rose-800 border border-rose-300"
                          : evt.impact === "MEDIUM"
                          ? "bg-amber-50 text-amber-800 border border-amber-300"
                          : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                      }`}
                    >
                      <span>{evt.impact === "HIGH" ? "🔴 HIGH" : evt.impact === "MEDIUM" ? "🟠 MED" : "⚪ LOW"}</span>
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-black whitespace-nowrap">
                    {evt.actual ? (
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {evt.actual}
                      </span>
                    ) : (
                      <span className="text-zinc-400">PENDING</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 font-bold text-zinc-700 whitespace-nowrap">
                    {evt.forecast}
                  </td>
                  <td className="px-6 py-3.5 text-zinc-500 whitespace-nowrap">
                    {evt.previous}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-semibold ${
                        evt.algoAction.includes("Active")
                          ? "text-rose-700 font-bold"
                          : "text-zinc-600"
                      }`}
                    >
                      {evt.algoAction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Prop Firm Risk Management Advisory */}
      <div className="border border-zinc-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-amber-50 border border-amber-300 p-2 text-amber-800 text-xl hidden sm:block">
            ⚠
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Institutional News Filter Policy & Funded Account Safety
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600">
              During high-impact red macroeconomic releases (CPI, Non-Farm Payrolls, FOMC Statements), 
              institutional spreads often widen exponentially, causing severe slippage and artificial liquidity vacuums. 
              To safeguard trader funded accounts and comply with strict prop firm evaluation rules (e.g. FTMO, Hola Prime, FundedNext), 
              Kiaros algorithmic models cease new signal creation 15 minutes prior to release and resume 15 minutes post-release 
              once the spread normalizes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
