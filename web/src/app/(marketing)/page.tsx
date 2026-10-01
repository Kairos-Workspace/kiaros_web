import { Certificates } from "@/components/landing/Certificates";
import { Hero } from "@/components/landing/Hero";
import { SignalsPreview } from "@/components/landing/SignalsPreview";
import { StrategyTesting } from "@/components/landing/StrategyTesting";
import { Footer } from "@/components/shared/Footer";
import { getSignals } from "@/lib/signals";

export const revalidate = 30;

export default async function Home() {
  const signals = await getSignals(3);
  return (
    <>
      <main className="flex-1">
        <Hero />
        <Certificates />
        <StrategyTesting />
        <SignalsPreview signals={signals} />
      </main>
      <Footer />
    </>
  );
}
