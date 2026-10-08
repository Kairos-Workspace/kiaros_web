"use client";

import Link from "next/link";
import { useState } from "react";

import {
  createTool,
  removeTool,
  toggleToolPublished,
} from "@/app/admin/actions";
import {
  formatToolFileSize,
  type Tool,
  TOOL_CATEGORIES,
  toolCategoryLabelKm,
  toolDownloadHref,
  toolIsExternal,
} from "@/lib/tools";

type Props = {
  tools: Tool[];
  defaultTab?: "list" | "add";
};

export function AdminToolsSections({ tools, defaultTab = "list" }: Props) {
  const [activeTab, setActiveTab] = useState<"list" | "add">(defaultTab);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const handleTabChange = (tab: "list" | "add") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const filteredTools = tools.filter((t) => {
    if (categoryFilter === "all") return true;
    return t.category === categoryFilter;
  });

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Navigation Tabs Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-4">
        <div className="inline-flex rounded-xl bg-zinc-100 p-1.5 border border-zinc-200/80 shadow-inner">
          <button
            type="button"
            onClick={() => handleTabChange("list")}
            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "list"
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
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Tool Repository</span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                activeTab === "list"
                  ? "bg-zinc-950 text-white"
                  : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {tools.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("add")}
            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "add"
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add New Tool</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.5 font-mono text-[9px] font-bold">
              + NEW
            </span>
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/tools"
            target="_blank"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors shadow-2xs"
          >
            Open Public Tools ↗
          </Link>

          {activeTab === "list" ? (
            <button
              type="button"
              onClick={() => handleTabChange("add")}
              className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add EA or Indicator</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTabChange("list")}
              className="btn-secondary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Back to Repository ({tools.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: TOOL REPOSITORY */}
      {activeTab === "list" && (
        <section className="flex flex-col gap-5 animate-in fade-in duration-200">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs">
            <span className="text-[11px] font-mono font-bold uppercase text-zinc-500 mr-1">
              Category:
            </span>
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-colors cursor-pointer ${
                categoryFilter === "all"
                  ? "bg-zinc-950 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              All Tools ({tools.length})
            </button>
            {TOOL_CATEGORIES.map((c) => {
              const count = tools.filter((t) => t.category === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryFilter(c.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-colors cursor-pointer ${
                    categoryFilter === c.id
                      ? "bg-zinc-950 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {c.labelEn} ({count})
                </button>
              );
            })}
          </div>

          {filteredTools.length === 0 ? (
            <div className="card-surface py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-zinc-900">No Trading Tools Found</h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                No tools match this category. Switch category filters or upload an EA/indicator above.
              </p>
              <button
                type="button"
                onClick={() => handleTabChange("add")}
                className="btn-primary mt-4 py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                + Add Trading Tool
              </button>
            </div>
          ) : (
            <div className="grid gap-3.5">
              {filteredTools.map((tool) => {
                const href = toolDownloadHref(tool);
                const size = formatToolFileSize(tool.fileSize);
                const isExternal = toolIsExternal(tool);

                return (
                  <article
                    key={tool.id}
                    className="card-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-zinc-300 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-zinc-950">
                          {tool.titleKm}
                        </h3>
                        <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-700 border border-zinc-200">
                          {toolCategoryLabelKm(tool.category)}
                        </span>
                        {!tool.published ? (
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800 border border-amber-200">
                            Draft (Hidden)
                          </span>
                        ) : (
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            Live Published
                          </span>
                        )}
                      </div>

                      {tool.descriptionKm ? (
                        <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                          {tool.descriptionKm}
                        </p>
                      ) : null}

                      <div className="mt-2.5 flex flex-wrap items-center gap-3 font-mono text-[11px] text-zinc-400">
                        {isExternal ? (
                          <span className="text-zinc-600 truncate max-w-md">
                            🔗 {tool.externalUrl}
                          </span>
                        ) : tool.fileName ? (
                          <span>
                            📦 {tool.fileName} {size ? `(${size})` : ""}
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                        <span>• Order: {tool.sortOrder}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 font-mono text-xs font-bold text-zinc-800 hover:bg-zinc-50 hover:text-zinc-950 transition-colors shadow-xs"
                        >
                          {isExternal ? "Open Link ↗" : "Download File ↓"}
                        </a>
                      ) : null}

                      <form action={toggleToolPublished}>
                        <input type="hidden" name="id" value={tool.id} />
                        <input
                          type="hidden"
                          name="published"
                          value={tool.published ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className={`rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold transition-colors cursor-pointer border ${
                            tool.published
                              ? "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {tool.published ? "Hide" : "Publish"}
                        </button>
                      </form>

                      <form
                        action={removeTool}
                        onSubmit={(e) => {
                          if (!confirm(`Are you sure you want to delete "${tool.titleKm}"?`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="id" value={tool.id} />
                        <button
                          type="submit"
                          className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: ADD NEW TOOL FORM */}
      {activeTab === "add" && (
        <section className="card-surface p-6 sm:p-8 animate-in fade-in duration-200">
          <div className="border-b border-zinc-100 pb-4 mb-6">
            <h2 className="text-xl font-black tracking-tight text-zinc-950">Add Trading Tool or EA</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Provide title, category, and either an uploadable MT5 binary/source file (.mq5, .ex5, .zip) or an external TradingView Pine Script URL.
            </p>
          </div>

          <form action={createTool} className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Tool Title *
                </label>
                <input
                  type="text"
                  name="title_km"
                  required
                  placeholder="Kiaros BBMA Execution EA"
                  className="input-field w-full font-medium"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Category *
                </label>
                <select name="category" defaultValue="mt5_ea" className="input-field w-full font-bold">
                  {TOOL_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Description & Strategy Rules
              </label>
              <textarea
                name="description_km"
                rows={3}
                placeholder="Institutional EA for automated entry based on London session liquidity sweeps..."
                className="input-field w-full resize-y font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-4">
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  File Upload (.mq5, .ex5, .zip, max 25MB)
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".mq5,.ex5,.zip,.pdf,.txt,.set,.tpl,.png,.jpg"
                  className="file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-zinc-800 input-field w-full py-2 cursor-pointer"
                />
                <span className="block mt-1 font-mono text-[10px] text-zinc-400">
                  Upload EA binary, source code, or preset templates.
                </span>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Or External URL (TradingView Script)
                </label>
                <input
                  type="url"
                  name="external_url"
                  placeholder="https://www.tradingview.com/script/..."
                  className="input-field w-full font-mono text-xs"
                />
                <span className="block mt-1 font-mono text-[10px] text-zinc-400">
                  Optional: Link direct TradingView community script instead.
                </span>
              </div>
            </div>

            <div className="w-36">
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Sort Order
              </label>
              <input
                type="number"
                name="sort_order"
                defaultValue={0}
                step={1}
                className="input-field w-full font-mono text-xs"
              />
              <span className="block mt-1 font-mono text-[10px] text-zinc-400">Lower = displayed first</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 pt-5">
              <button
                type="button"
                onClick={() => handleTabChange("list")}
                className="btn-secondary py-2.5 px-4 text-xs font-bold cursor-pointer"
              >
                Cancel & Return to Repository
              </button>

              <button
                type="submit"
                className="btn-primary py-3 px-6 text-sm font-bold tracking-tight shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Publish Trading Tool</span>
                <span className="font-mono">→</span>
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
