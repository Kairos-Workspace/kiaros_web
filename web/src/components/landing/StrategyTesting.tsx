import Image from "next/image";

const PROOF_SRC = "/proof_strategy_testing/strategy_testing.png";
const PROOF_ALT =
  "Monthly strategy performance heatmap from 2020 to 2026 showing returns, losses, and trade frequency per month";

export function StrategyTesting() {
  return (
    <section id="strategy-testing" className="relative border-b border-zinc-200/80 bg-[#fafafa] py-16 md:py-24">
      <div className="page-container">
        {/* Section Header */}
        <div className="mb-10 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
            6-Year Monthly Performance Heatmap
          </h2>
          <p className="mt-3 text-sm text-zinc-600 max-w-2xl mx-auto leading-relaxed sm:text-base">
            Monthly net return distribution from 2020 through 2026 across 72+ months.
            Validated tick data confirms edge durability, risk containment, and zero curve fitting.
          </p>
        </div>

        {/* Terminal Heatmap Frame */}
        <div className="relative w-full overflow-hidden bg-white shadow-sm border border-zinc-200/80">
          <div className="relative aspect-[2814/1372] w-full overflow-hidden bg-zinc-50 p-2">
            <Image
              src={PROOF_SRC}
              alt={PROOF_ALT}
              fill
              sizes="(max-width: 768px) 100vw, 82rem"
              className="object-contain"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
