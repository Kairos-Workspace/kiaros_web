import { Hero } from "@/components/landing/Hero";
import { StrategyArchitecture } from "@/components/landing/StrategyArchitecture";
import { StrategyTesting } from "@/components/landing/StrategyTesting";
import { Certificates } from "@/components/landing/Certificates";
import { SyndicateCta } from "@/components/landing/SyndicateCta";
import { Footer } from "@/components/shared/Footer";

export const revalidate = 60;

export default function Home() {
  return (
    <>
      <main className="flex-1 bg-[#fafafa] text-zinc-900 selection:bg-zinc-950 selection:text-white">
        {/* 1. Institutional Hero & Interactive Signal Cockpit */}
        <Hero />

        {/* 2. Quantitative Strategy Pipeline & Architecture (SMC, ICT, BBMA) */}
        <StrategyArchitecture />

        {/* 4. 6-Year Audited Performance Heatmap (2020-2026) */}
        <StrategyTesting />

        {/* 5. Funded Certificates & Prop Passes */}
        <Certificates />

        {/* 6. VIP Quant Syndicate Community Hub */}
        <SyndicateCta />
      </main>

      {/* Institutional Terminal Footer */}
      <Footer />
    </>
  );
}
