import { InteractiveHeroBackground } from "@/components/landing/InteractiveHeroBackground";

const TELEGRAM_GROUP_URL = "https://t.me/kairoscommunity";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200/80 bg-[#fafafa] min-h-[calc(100dvh-5.75rem)] flex items-center justify-center py-16 sm:py-24">
      {/* Interactive Quantitative Canvas Background */}
      <InteractiveHeroBackground />

      {/* Subtle ambient lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-zinc-200/50 blur-[140px]"
        aria-hidden
      />

      <div className="page-container relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">
        {/* Master Headline */}
        <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl lg:leading-[1.1]">
          Systematic Signals. <br />
          <span className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-transparent">
            Institutional Edge.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
          Kiaros captures high-probability liquidity sweeps, Fair Value Gaps (FVG), 
          and volatility expansions across Gold (XAUUSD), Crypto, and Forex. 
          Delivered directly to your terminal and Telegram with exact entry, 
          stop loss, and 3-tier profit ladders. Zero repaint guaranteed.
        </p>

        {/* Primary CTA */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <a
            href={TELEGRAM_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-telegram group flex items-center gap-2.5 px-7 py-3.5 text-base shadow-lg"
            title="Join Telegram VIP Syndicate"
          >
            <TelegramHeroIcon />
            <span>Join Telegram VIP Free</span>
            <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs font-bold text-zinc-200">
              1,250+
            </span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function TelegramHeroIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="text-white">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}
