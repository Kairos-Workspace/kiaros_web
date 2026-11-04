import { getTranslations } from "@/lib/i18n/server";

import { T } from "@/components/i18n/T";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  aiResponsesHrefForRun,
  countOutcomesByStatus,
  parseEngineOutcomes,
} from "@/lib/admin-scans";
import { requireAdminPage } from "@/lib/admin-guard";
import { formatDateTime } from "@/lib/format";
import { listEngineRunsPage } from "@/lib/supabase/admin";
import { Pagination } from "@/components/shared/Pagination";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("Admin · Scans"),
  };
}

export const revalidate = 30;

function statusClass(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "text-accent";
    case "REJECTED":
      return "text-rose-700";
    case "NO SIGNAL":
      return "text-slate";
    case "ERROR":
      return "text-rose-700";
    case "SKIPPED":
      return "text-slate/70";
    default:
      return "text-ink";
  }
}

export default async function AdminScansPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdminPage();
  const { t, locale } = await getTranslations();
  const { page: rawPage } = await searchParams;
  const requestedPage = Number(rawPage ?? "1");
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const result = await listEngineRunsPage(page);
  if (!result) {
    return (
      <p className="text-sm text-slate">
        <T>{"Could not load engine runs. Check Supabase configuration and that"}</T>{" "}
        <code className="font-mono text-xs">engine_runs</code>  <T>{"exists."}</T> </p>
    );
  }

  if (page > result.totalPages && result.total > 0) {
    redirect(
      result.totalPages <= 1
        ? "/admin/scans"
        : `/admin/scans?page=${result.totalPages}`,
    );
  }

  const { runs, pageSize, total, totalPages } = result;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950"><T>{"Engine Runs & Outcomes"}</T></h1>
          <p className="mt-1 text-xs text-zinc-500">
            <T>{"Audit candidate setups and individual symbol verdicts (confirmed, rejected, no signal, skipped) recorded during execution passes."}</T> </p>
        </div>
        {total > 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-1 font-mono text-xs font-bold text-zinc-600 shadow-xs">
            <T>{"Page"}</T> {result.page}  <T>{"of"}</T> {totalPages} ({total}  <T>{"total)"}</T> </div>
        ) : null}
      </div>

      {runs.length > 0 ? (
        <>
          <div className="space-y-3">
            {runs.map((run) => {
              const outcomes = parseEngineOutcomes(run.outcomes);
              const counts = countOutcomesByStatus(outcomes);
              const summary = Object.entries(counts)
                .map(([status, n]) => `${n} ${t(status)}`)
                .join(" · ");
              return (
                <div key={run.id} className="card-surface">
                  <div className="flex flex-wrap items-start justify-between gap-3 p-5">
                    <div>
                      <p className="font-mono text-xs text-slate">
                        {formatDateTime(run.finishedAt, locale)}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        <T>{"Run"}</T> {run.runId.slice(0, 8)} · {run.timeframe}
                      </p>
                      <p className="mt-1 text-sm text-slate">
                        <T values={{ count: run.storedCount }}>{run.storedCount === 1 ? "Stored {count} signal" : "Stored {count} signals"}</T>
                        {summary ? ` · ${summary}` : ""}
                      </p>
                    </div>
                    <Link
                      href={aiResponsesHrefForRun(run.finishedAt)}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-slate hover:border-accent/40 hover:text-accent"
                    >
                      <T>{"AI responses"}</T> </Link>
                  </div>

                  <details className="group border-t border-line">
                    <summary className="cursor-pointer list-none px-5 py-3 text-xs font-semibold text-slate marker:content-none hover:text-ink [&::-webkit-details-marker]:hidden">
                      <span className="group-open:hidden">
                        <T values={{ count: outcomes.length }}>{outcomes.length === 1 ? "Show {count} outcome" : "Show {count} outcomes"}</T>
                      </span>
                      <span className="hidden group-open:inline">
                        <T>{"Hide outcomes"}</T> </span>
                    </summary>
                    <div className="px-5 pb-5">
                      {outcomes.length === 0 ? (
                        <p className="text-sm text-slate">
                          <T>{"No per-symbol outcomes recorded for this run."}</T> </p>
                      ) : (
                        <ul className="divide-y divide-line">
                          {outcomes.map((o, idx) => (
                            <li
                              key={`${run.id}-${o.symbol}-${o.timeframe ?? ""}-${o.status}-${idx}`}
                              className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-mono text-sm font-semibold">
                                  {o.symbol}
                                  {o.timeframe ? (
                                    <span className="ml-2 text-xs font-normal text-slate">
                                      {o.timeframe}
                                    </span>
                                  ) : null}
                                </p>
                                <p
                                  className={`mt-0.5 text-xs font-semibold uppercase tracking-wide ${statusClass(o.status)}`}
                                >
                                  <T>{o.status}</T>
                                </p>
                                {o.extra ? (
                                  <p className="mt-1 text-sm leading-relaxed text-slate">
                                    {o.extra}
                                  </p>
                                ) : null}
                              </div>
                              <Link
                                href={aiResponsesHrefForRun(run.finishedAt, {
                                  symbol: o.symbol,
                                  timeframe: o.timeframe ?? undefined,
                                })}
                                className="shrink-0 text-xs font-semibold text-accent hover:underline"
                              >
                                <T>{"View AI"}</T> </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>

          <Pagination
            page={result.page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            basePath="/admin/scans"
            itemLabel="runs"
          />
        </>
      ) : (
        <p className="mt-6 text-sm text-slate">
          <T>{"No engine runs logged yet. After the next cron or manual scan, runs will appear here."}</T> </p>
      )}
    </div>
  );
}
