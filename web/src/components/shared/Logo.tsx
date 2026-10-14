import Link from "next/link";

export function Logo({
  suffix,
  className = "",
  tone = "light",
}: {
  suffix?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 text-lg font-bold tracking-tight transition-all hover:opacity-90 ${className}`}
    >
      {/* Keep the name visible while the logo artwork is being finalized. */}
      <div className="flex items-center gap-1.5 leading-none">
        <span className={`font-sans text-[1.15rem] font-black tracking-tight ${tone === "dark" ? "text-white" : "text-zinc-900"}`}>
          Kiar<span className={tone === "dark" ? "text-zinc-400" : "text-zinc-500"}>os</span>
        </span>
        <span className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] font-black tracking-wider text-zinc-900 uppercase">
          QUANT
        </span>
        {suffix ? (
          <span className="rounded bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-zinc-600 uppercase">
            {suffix}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
