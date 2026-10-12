import { InteractiveHeroBackground } from "@/components/landing/InteractiveHeroBackground";
import { DualPhoneMockup } from "@/components/landing/PhoneMockup";
import { TelegramIcon } from "@/components/shared/TelegramIcon";
import { TELEGRAM_GROUP_URL } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200/80 bg-[#fafafa] min-h-[calc(100dvh-5.75rem)] flex items-center justify-center py-12 sm:py-16 lg:py-20">
      {/* Interactive Quantitative Canvas Background */}
      <InteractiveHeroBackground />

      {/* Subtle ambient lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-zinc-200/50 blur-[140px]"
        aria-hidden
      />

      <div className="page-container relative z-10 w-full">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          
          {/* Left Column: Master Headline, Value Proposition & Primary CTA */}
          <div className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left">
            {/* Master Headline */}
            <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl xl:text-7xl lg:leading-[1.08]">
              Quant Algo Precision. <br />
              <span className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-transparent">
                LLM Neural Edge.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              Kiaros fuses quantitative algorithmic execution (Algo) with real-time 
              Large Language Model (LLM) validation. We capture high-probability set up and volatility expansions across Gold (XAUUSD), Crypto, 
              and Forex — verified by AI before reaching your terminal and Telegram.
            </p>

            {/* Primary CTA */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              <a
                href={TELEGRAM_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-telegram group flex items-center gap-2.5 px-7 py-3.5 text-base shadow-lg"
                title="Join Telegram Community"
              >
                <TelegramIcon size={18} />
                <span>Join Telegram Free</span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs font-bold text-zinc-200">
                  1,250+
                </span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>

          {/* Right Column: High-Fidelity Dual Phone Screen Mockup */}
          <div className="flex items-center justify-center lg:col-span-6 lg:justify-end">
            <DualPhoneMockup />
          </div>

        </div>
      </div>
    </section>
  );
}
