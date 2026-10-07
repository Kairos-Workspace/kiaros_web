import { Footer } from "@/components/shared/Footer";
import { ToolsGrid } from "@/components/tools/ToolsGrid";
import { getPublishedTools } from "@/lib/tools";

export const revalidate = 60;

export const metadata = {
  title: "Trading Tools & MT5 EAs (Free Repository)",
  description:
    "Free MT5 Expert Advisors, TradingView indicators, and quantitative risk calculators from Kiaros.",
};

export default async function ToolsPage() {
  const tools = await getPublishedTools();

  return (
    <>
      <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-[#fafafa] relative text-zinc-900">
        <div className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 xl:px-12 page-container relative z-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
              Trading Tools & MT5 EAs
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 mx-auto">
              Free institutional MT5 Expert Advisors, custom TradingView indicators, and quantitative risk calculators — download directly or link via TradingView.
            </p>
          </div>
          <ToolsGrid tools={tools} />
        </div>
      </main>
      <Footer />
    </>
  );
}
