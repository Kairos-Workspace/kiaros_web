import Image from "next/image";
import Link from "next/link";

export function Logo({
  suffix,
  className = "",
}: {
  suffix?: string;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 text-lg font-bold tracking-tight transition-all hover:opacity-90 ${className}`}
    >
      {/* Icon Badge: Sleek black rounded box with the white Kiaros logo */}
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800 p-1.5 shadow-sm transition-all group-hover:scale-105">
        <Image
          src="/logo/kiaros-logo.png"
          alt="Kiaros logo"
          width={36}
          height={36}
          priority
          className="h-6 w-6 object-contain"
        />
      </div>

      <div className="flex items-center gap-1.5 leading-none">
        <span className="font-sans text-[1.15rem] font-black tracking-tight text-zinc-900">
          Kiar<span className="text-zinc-500">os</span>
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
