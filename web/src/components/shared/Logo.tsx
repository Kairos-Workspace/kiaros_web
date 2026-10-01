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
      className={`inline-flex items-center gap-2.5 text-lg font-bold tracking-tight ${className}`}
    >
      <Image
        src="/logo/kiaros-logo.png"
        alt="Kiaros flower"
        width={60}
        height={40}
        priority
        className="h-10 w-[3.75rem] object-contain dark:invert"
      />
      <span className="text-ink">
        Kiar<span className="text-slate">os</span>
        {suffix ? (
          <span className="ml-1.5 text-xs font-medium text-slate">{suffix}</span>
        ) : null}
      </span>
    </Link>
  );
}
