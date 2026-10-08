"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/format";
import type { CronWorkflowStatus, WorkflowRunSummary } from "@/lib/github-engine";

type Props = {
  statuses: CronWorkflowStatus[];
  xau: {
    isHealthy: boolean;
    ageMinutes: number | null;
    finishedAt: string | null;
  } | null;
  alertsConfigured: boolean;
  defaultTab?: "workflows" | "watchdog";
};

function runTone(run: WorkflowRunSummary): string {
  if (run.status === "in_progress" || run.status === "queued") {
    return "text-amber-700 bg-amber-50 border-amber-200";
  }
  switch (run.conclusion) {
    case "success":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "failure":
    case "timed_out":
    case "startup_failure":
      return "text-rose-700 bg-rose-50 border-rose-200";
    case "cancelled":
      return "text-zinc-600 bg-zinc-100 border-zinc-200";
    default:
      return "text-zinc-800 bg-zinc-100 border-zinc-200";
  }
}

function runLabel(run: WorkflowRunSummary): string {
  if (run.status === "in_progress") return "RUNNING";
  if (run.status === "queued") return "QUEUED";
  return (run.conclusion ?? run.status ?? "UNKNOWN").toUpperCase();
}

export function AdminCronSections({
  statuses,
  xau,
  alertsConfigured,
  defaultTab = "workflows",
}: Props) {
  const [activeTab, setActiveTab] = useState<"workflows" | "watchdog">(defaultTab);

  const healthyPipelines = statuses.filter(
    (s) => s.runs[0]?.conclusion === "success",
  ).length;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Navigation Tabs Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-4">
        <div className="inline-flex rounded-xl bg-zinc-100 p-1.5 border border-zinc-200/80 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("workflows")}
            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "workflows"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>Workflow Pipelines</span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                activeTab === "workflows"
                  ? "bg-zinc-950 text-white"
                  : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {statuses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("watchdog")}
            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "watchdog"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Watchdog & Telemetry</span>
            <span
              className={`rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                xau?.isHealthy
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {xau?.isHealthy ? "HEALTHY" : "STALE"}
            </span>
          </button>
        </div>

        {/* Telemetry Summary Pill */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-zinc-500">
            Pipeline Health:{" "}
            <strong className="text-zinc-950">
              {healthyPipelines}/{statuses.length} Active
            </strong>
          </span>
        </div>
      </div>

      {/* TAB 1: WORKFLOW PIPELINES */}
      {activeTab === "workflows" && (
        <section className="flex w-full flex-col gap-5 animate-in fade-in duration-200">
          <div className="grid gap-5 md:grid-cols-2">
            {statuses.map((wf) => {
              const latest = wf.runs[0];
              return (
                <div
                  key={wf.key}
                  className="card-surface p-5 hover:border-zinc-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-950">
                          {wf.label}
                        </h3>
                        <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
                          {wf.trigger} · {wf.file}
                        </p>
                      </div>

                      {latest ? (
                        <span
                          className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold border ${runTone(
                            latest,
                          )}`}
                        >
                          {runLabel(latest)}
                        </span>
                      ) : null}
                    </div>

                    {wf.error ? (
                      <p className="mt-3 text-xs text-rose-600 font-mono">
                        {wf.error}
                      </p>
                    ) : wf.runs.length === 0 ? (
                      <p className="mt-4 text-xs text-zinc-400 font-mono">
                        No workflow runs recorded yet.
                      </p>
                    ) : (
                      <ul className="mt-3 divide-y divide-zinc-100">
                        {wf.runs.map((run) => (
                          <li
                            key={run.id}
                            className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <a
                                href={run.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono font-bold text-zinc-950 hover:underline"
                              >
                                #{run.run_number}
                              </a>
                              <span className="font-mono text-[10px] text-zinc-400 uppercase">
                                {run.event}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span
                                className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold border ${runTone(
                                  run,
                                )}`}
                              >
                                {runLabel(run)}
                              </span>
                              <time
                                className="font-mono text-[10px] text-zinc-500"
                                dateTime={run.created_at}
                              >
                                {formatDateTime(run.created_at)}
                              </time>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: WATCHDOG & TELEMETRY */}
      {activeTab === "watchdog" && (
        <section className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* XAU Watchdog Card */}
          <div className="card-surface p-6 sm:p-7">
            <div className="border-b border-zinc-100 pb-4 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="mb-1 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-700 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>CRITICAL HEARTBEAT MONITOR</span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-zinc-950">
                  XAUUSD 1M Scalper Watchdog
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Monitors active bar dispatch from the MT5 tick listener. If scans become stale,{" "}
                  <code className="font-mono text-zinc-800">/api/cron/xau-watchdog</code> automatically restarts the workflow.
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold border ${
                  xau?.isHealthy
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-rose-50 text-rose-800 border-rose-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    xau?.isHealthy ? "bg-emerald-600 animate-pulse" : "bg-rose-600"
                  }`}
                />
                {xau?.isHealthy ? "SYSTEM HEALTHY" : "CRITICAL STALE"}
              </span>
            </div>

            {xau ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                  <span className="font-mono text-[10px] uppercase font-bold text-zinc-500">
                    Execution State
                  </span>
                  <div
                    className={`mt-1 font-mono text-base font-black ${
                      xau.isHealthy ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {xau.isHealthy ? "● Synchronized" : "▼ Delayed / Stale"}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                  <span className="font-mono text-[10px] uppercase font-bold text-zinc-500">
                    Heartbeat Latency Age
                  </span>
                  <div className="mt-1 font-mono text-base font-black text-zinc-950">
                    {xau.ageMinutes != null ? `${xau.ageMinutes.toFixed(1)} min ago` : "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                  <span className="font-mono text-[10px] uppercase font-bold text-zinc-500">
                    Last Finished Scan
                  </span>
                  <div className="mt-1 font-mono text-xs font-bold text-zinc-800">
                    {xau.finishedAt ? formatDateTime(xau.finishedAt) : "—"}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 font-mono">No XAU scan status recorded.</p>
            )}
          </div>

          {/* Telegram Ops Alert Channel */}
          <div className="card-surface p-6">
            <h4 className="text-sm font-bold text-zinc-950">
              Ops Channel Failover Alerting
            </h4>
            <p className="mt-1 text-xs text-zinc-500">
              Automated notifications sent directly to the Telegram operations channel whenever any cron job experiences errors or times out.
            </p>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
              <div>
                <span className="font-mono text-xs font-bold text-zinc-800">
                  Telegram Dispatch Bot
                </span>
                <p className="font-mono text-[11px] text-zinc-400">
                  TELEGRAM_ALERTS_CHAT_ID
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold border ${
                  alertsConfigured
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-rose-50 text-rose-800 border-rose-300"
                }`}
              >
                {alertsConfigured ? "● DISPATCH ACTIVE" : "○ NOT CONFIGURED"}
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
