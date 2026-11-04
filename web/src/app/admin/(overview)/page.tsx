import { getTranslations } from "@/lib/i18n/server";

import { T } from "@/components/i18n/T";
import type { Metadata } from "next";
import Link from "next/link";

import { requireAdminPage } from "@/lib/admin-guard";
import { getStats } from "@/lib/signals";
import {
  getEngineStatus,
  getXauScanStatus,
  listUsers,
  serviceRoleToken,
} from "@/lib/supabase/admin";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Admin Overview · Kiaros Quant Desk"),
  };
}

export const revalidate = 30;

export default async function AdminOverview() {
  await requireAdminPage();
  const { t } = await getTranslations();

  const token = serviceRoleToken();
  const [users, stats, engineStatus, xauScanStatus] = await Promise.all([
    listUsers(),
    getStats(token),
    getEngineStatus(),
    getXauScanStatus(),
  ]);

  const engine = engineStatus
    ? {
        isHealthy: engineStatus.isHealthy,
        label: engineStatus.isHealthy ? "Engine Active" : "Engine Stale",
        detail: t("Last run {minutes} min ago.", { minutes: engineStatus.ageMinutes ?? "—" }),
      }
    : { isHealthy: false, label: "Unknown", detail: "No heartbeat logged yet." };

  const xauScalper = xauScanStatus
    ? {
        isHealthy: xauScanStatus.isHealthy,
        label: xauScanStatus.isHealthy ? "XAU Radar Active" : "XAU Radar Stale",
        detail: t("Last scan {minutes} min ago.", { minutes: xauScanStatus.ageMinutes ?? "—" }),
      }
    : { isHealthy: false, label: "Unknown", detail: "No heartbeat logged yet." };

  return (
    <div className="space-y-8">
      {/* 1. Page Header & Quick Execution Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
            <T>{"System & Operations Overview"}</T> </h1>
          <p className="mt-1 text-xs text-zinc-500 max-w-2xl leading-relaxed">
            <T>{"Real-time pipeline health telemetry, execution statistics, and algorithmic verification status across active sessions."}</T> </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/analysis"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 font-mono text-xs font-bold text-white shadow-xs hover:bg-zinc-800 transition-colors"
          >
            <span><T>{"+ Daily Analysis"}</T></span>
          </Link>
          <Link
            href="/admin/signals"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 font-mono text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs"
          >
            <span><T>{"Audit Signals"}</T></span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* 2. System Health Telemetry Banner */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 font-mono">
        {/* Core Engine Status */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <T>{"Quant Execution Engine"}</T> </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                engine.isHealthy
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  engine.isHealthy ? "bg-emerald-600 animate-pulse" : "bg-rose-600"
                }`}
              />
              <T>{engine.label}</T>
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-600"><T>{engine.detail}</T></p>
        </div>

        {/* XAU Scalper Radar */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <T>{"XAU Scalper Scanner"}</T> </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                xauScalper.isHealthy
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  xauScalper.isHealthy ? "bg-emerald-600 animate-pulse" : "bg-rose-600"
                }`}
              />
              <T>{xauScalper.label}</T>
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-600"><T>{xauScalper.detail}</T></p>
        </div>

        {/* Database & Cloudflare R2 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <T>{"Remote Database"}</T> </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <T>{"Connected"}</T> </span>
          </div>
          <p className="mt-2 text-xs text-zinc-600"><T>{"Supabase linked & migrations synchronized."}</T></p>
        </div>
      </div>

      {/* 3. Operational Performance Stat Grid */}
      <div>
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
          <T>{"Trading Operations & Metrics"}</T> </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Total Signals */}
          <div className="stat-tile">
            <p className="stat-tile-label"><T>{"Signals Logged"}</T></p>
            <p className="stat-tile-value">{stats.total}</p>
            <p className="mt-2 text-xs text-zinc-500"><T>{"Permanent audited log"}</T></p>
          </div>

          {/* Win Rate */}
          <div className="stat-tile">
            <p className="stat-tile-label"><T>{"Win Rate"}</T></p>
            <p className="stat-tile-value text-emerald-700">
              {stats.winRate !== null ? `${stats.winRate}%` : "—"}
            </p>
            <p className="mt-2 text-xs text-zinc-500 truncate" title={t("{full} full / {partial} partial / {sl} SL", { full: stats.tpHits, partial: stats.partialWins, sl: stats.slHits })}>
              <T>{stats.winRate !== null
                ? t("{full} full • {partial} partial", { full: stats.tpHits, partial: stats.partialWins })
                : "No closed setups"}</T>
            </p>
          </div>

          {/* Average Confidence */}
          <div className="stat-tile">
            <p className="stat-tile-label"><T>{"Avg AI Confidence"}</T></p>
            <p className="stat-tile-value">
              {stats.total > 0 ? `${stats.avgConfidence}%` : "—"}
            </p>
            <p className="mt-2 text-xs text-zinc-500"><T>{"Algo + LLM Confluence"}</T></p>
          </div>

          {/* Long / Short Ratio */}
          <div className="stat-tile">
            <p className="stat-tile-label"><T>{"Long / Short"}</T></p>
            <p className="stat-tile-value font-mono">
              {stats.longs}<T>{"L /"}</T> {stats.shorts}<T>{"S"}</T> </p>
            <p className="mt-2 text-xs text-zinc-500"><T>{"Market bias distribution"}</T></p>
          </div>

          {/* User Accounts */}
          <div className="stat-tile">
            <p className="stat-tile-label"><T>{"Registered Users"}</T></p>
            <p className="stat-tile-value">{users ? String(users.length) : "—"}</p>
            <p className="mt-2 text-xs text-zinc-500"><T>{"Authorized traders"}</T></p>
          </div>
        </div>
      </div>

      {/* 4. Quick Operational Modules Navigation */}
      <div>
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
          <T>{"Quick Management Modules"}</T> </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/analysis"
            className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-zinc-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-zinc-950 uppercase">
                  <T>{"📊 Daily Technical Analysis"}</T> </span>
                <span className="text-zinc-400 group-hover:text-zinc-950 transition-colors">→</span>
              </div>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                <T>{"Upload charts, graphs, multi-timeframe blueprints, and session plans for the public daily analysis hub."}</T> </p>
            </div>
            <span className="mt-4 font-mono text-[11px] font-bold text-emerald-700">
              <T>{"Manage Blueprints →"}</T> </span>
          </Link>

          <Link
            href="/admin/signals"
            className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-zinc-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-zinc-950 uppercase">
                  <T>{"⚡ Live Signal Feed & Outcomes"}</T> </span>
                <span className="text-zinc-400 group-hover:text-zinc-950 transition-colors">→</span>
              </div>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                <T>{"Audit every trade signal, mark TP1/TP2 outcomes, upload verification charts, and export CSV reports."}</T> </p>
            </div>
            <span className="mt-4 font-mono text-[11px] font-bold text-emerald-700">
              <T>{"Audit Signals →"}</T> </span>
          </Link>

          <Link
            href="/admin/tools"
            className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-zinc-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-zinc-950 uppercase">
                  <T>{"🛠 MetaTrader 5 Tools & EAs"}</T> </span>
                <span className="text-zinc-400 group-hover:text-zinc-950 transition-colors">→</span>
              </div>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                <T>{"Manage Expert Advisors (`.mq5`), EA download links, installation guides, and documentation."}</T> </p>
            </div>
            <span className="mt-4 font-mono text-[11px] font-bold text-emerald-700">
              <T>{"Manage EAs →"}</T> </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
