import { T } from "@/components/i18n/T";
import { type PageHeaderTheme } from "@/components/shared/page-header-themes";

interface PageHeaderProps {
  theme?: PageHeaderTheme;
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="relative border-b border-zinc-200/80 bg-white/70 backdrop-blur-md py-6 sm:py-8">
      <div className="page-container mx-auto">
        <div className="flex flex-col items-center text-center mx-auto max-w-2xl">
          <h1 className="font-mono text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-zinc-950">
            <T>{title}</T>
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed font-sans text-pretty">
            <T>{subtitle}</T>
          </p>
        </div>
      </div>
    </section>
  );
}
