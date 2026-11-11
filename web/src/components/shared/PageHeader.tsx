import { T } from "@/components/i18n/T";
import { type PageHeaderTheme } from "@/components/shared/page-header-themes";

interface PageHeaderProps {
  theme: PageHeaderTheme;
  title: string;
  subtitle: string;
}

const THEME_ACCENTS: Record<
  PageHeaderTheme,
  { dot: string; badge: string; label: string }
> = {
  gold: {
    dot: "bg-amber-500",
    badge: "border-amber-200/90 bg-amber-50 text-amber-800",
    label: "ANALYSIS",
  },
  signals: {
    dot: "bg-emerald-500",
    badge: "border-emerald-200/90 bg-emerald-50 text-emerald-800",
    label: "LIVE SIGNALS",
  },
  calendar: {
    dot: "bg-sky-500",
    badge: "border-sky-200/90 bg-sky-50 text-sky-800",
    label: "MACRO CALENDAR",
  },
  tools: {
    dot: "bg-violet-500",
    badge: "border-violet-200/90 bg-violet-50 text-violet-800",
    label: "TOOLS & EAS",
  },
  radar: {
    dot: "bg-cyan-500",
    badge: "border-cyan-200/90 bg-cyan-50 text-cyan-800",
    label: "CRYPTO RADAR",
  },
};

export function PageHeader({ theme, title, subtitle }: PageHeaderProps) {
  const accent = THEME_ACCENTS[theme] || THEME_ACCENTS.signals;

  return (
    <section className="relative border-b border-zinc-200/80 bg-white/70 backdrop-blur-md pt-5 pb-5 sm:pt-6 sm:pb-6">
      <div className="page-container mx-auto">
        <div className="flex flex-col justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${accent.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${accent.dot} animate-pulse`} />
              <T>{accent.label}</T>
            </span>
          </div>

          <h1 className="font-mono text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-zinc-950">
            <T>{title}</T>
          </h1>

          <p className="max-w-3xl text-xs sm:text-sm text-zinc-500 leading-relaxed font-sans">
            <T>{subtitle}</T>
          </p>
        </div>
      </div>
    </section>
  );
}
