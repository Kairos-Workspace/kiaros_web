import type { ReactNode } from "react";
import { AnimatedHeaderBackground } from "@/components/shared/AnimatedHeaderBackground";

interface PageHeaderProps {
  badge?: ReactNode;
  badgeDotColor?: string;
  title: string;
  subtitle: string;
}

export function PageHeader({
  badge,
  badgeDotColor = "bg-emerald-400",
  title,
  subtitle,
}: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-zinc-800 bg-[#09090b] text-white py-12 sm:py-16">
      {/* Floating Animated Particles & Glowing Orbs */}
      <AnimatedHeaderBackground />

      <div className="page-container relative z-10 mx-auto flex flex-col items-center text-center">
        {badge ? (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1 font-mono text-[11px] font-semibold text-zinc-300 shadow-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${badgeDotColor} animate-pulse`} />
            <span>{badge}</span>
          </div>
        ) : null}

        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl font-mono">
          {title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 mx-auto">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
