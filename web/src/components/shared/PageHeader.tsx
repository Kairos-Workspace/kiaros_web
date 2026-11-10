import { T } from "@/components/i18n/T";
import { AnimatedHeaderBackground } from "@/components/shared/AnimatedHeaderBackground";
import { HeaderIllustration } from "@/components/shared/HeaderIllustration";
import {
  PAGE_HEADER_THEMES,
  type PageHeaderTheme,
} from "@/components/shared/page-header-themes";

interface PageHeaderProps {
  theme: PageHeaderTheme;
  title: string;
  subtitle: string;
}

export function PageHeader({ theme, title, subtitle }: PageHeaderProps) {
  const config = PAGE_HEADER_THEMES[theme];
  const isGold = theme === "gold";

  return (
    <section className="relative overflow-hidden border-b border-zinc-800 bg-[#09090b] text-white py-10 sm:py-14 lg:py-16">
      <AnimatedHeaderBackground theme={theme} />

      <div className="page-container relative z-10 mx-auto">
        <div className="grid items-center gap-6 sm:gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-10 lg:gap-12">
          <div className="flex min-w-0 flex-col items-center text-center md:items-start md:text-left">
            <h1
              className={`max-w-xl text-balance font-bold tracking-tight text-white ${
                isGold
                  ? "text-[1.65rem] leading-[1.25] sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]"
                  : "font-mono text-[1.55rem] leading-[1.2] sm:text-4xl lg:text-5xl"
              }`}
            >
              <T>{title}</T>
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-pretty text-[13px] leading-relaxed text-zinc-400 sm:mt-4 sm:text-[15px] md:mx-0">
              <T>{subtitle}</T>
            </p>

            <div
              className={`mt-5 h-px w-20 bg-gradient-to-r sm:mt-7 sm:w-28 ${config.glowRing}`}
              aria-hidden
            />
          </div>

          <div className="relative mx-auto w-full max-w-[240px] sm:max-w-[300px] md:max-w-none md:justify-self-end">
            <div
              className={`pointer-events-none absolute inset-2 rounded-full bg-gradient-to-br blur-2xl sm:inset-4 ${config.glowRing}`}
              aria-hidden
            />
            <HeaderIllustration theme={theme} />
          </div>
        </div>
      </div>
    </section>
  );
}
