import Link from "next/link";

import {
  formatToolFileSize,
  toolCategoryLabelKm,
  toolDownloadHref,
  toolIsExternal,
  type Tool,
} from "@/lib/tools";

function ToolCard({ tool }: { tool: Tool }) {
  const href = toolDownloadHref(tool);
  const external = toolIsExternal(tool);
  const size = formatToolFileSize(tool.fileSize);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-zinc-400 hover:shadow-md hover:-translate-y-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-md border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-zinc-900">
          {toolCategoryLabelKm(tool.category)}
        </span>
        {tool.fileName && size ? (
          <span className="font-mono text-xs text-zinc-500">{size}</span>
        ) : null}
      </div>

      <h2 className="mt-4 text-xl font-extrabold tracking-tight text-zinc-950 transition-colors">
        {tool.titleKm}
      </h2>

      {tool.descriptionKm ? (
        <p className="mt-2.5 flex-1 text-xs leading-relaxed text-zinc-600">
          {tool.descriptionKm}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-6 border-t border-zinc-200 pt-4">
        {href ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            download={external ? undefined : tool.fileName ?? true}
            className="btn-primary inline-flex w-full justify-center sm:w-auto"
          >
            <span>{external ? "Open on TradingView ↗" : "Download Free"}</span>
          </a>
        ) : (
          <span className="text-xs text-zinc-400">No file available</span>
        )}
        {tool.fileName && !external ? (
          <p className="mt-2.5 font-mono text-[11px] text-zinc-500 truncate">
            📄 {tool.fileName}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function ToolsGrid({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-card/60 px-6 py-16 text-center backdrop-blur-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-card text-ink mb-3">
          <span className="h-4 w-4 rounded-full border-2 border-line-highlight border-t-transparent animate-spin" />
        </div>
        <p className="font-mono text-base font-bold text-ink">No tools available yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-slate">
          MT5 EAs, TradingView indicators, and quantitative tools will be published here shortly.
        </p>
        <Link href="/signals" className="btn-secondary mt-5 inline-flex text-xs">
          Explore Live Signals →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
