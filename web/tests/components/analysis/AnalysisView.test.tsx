import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnalysisView } from "@/components/analysis/AnalysisView";
import type { DailyAnalysis } from "@/lib/analysis";
import type { MarketCandle } from "@/lib/markets/kraken";

// Mock PoiAnalysisChart since lightweight-charts requires full DOM canvas
vi.mock("@/components/analysis/PoiAnalysisChart", () => ({
  PoiAnalysisChart: () => <div data-testid="mock-poi-chart">Interactive Chart Mock</div>,
}));

const mockAnalysis: DailyAnalysis = {
  id: "gold-analysis-1",
  title: "Gold (XAUUSD) London Liquidity Sweep & M15 Fair Value Gap Retest",
  symbol: "XAUUSD",
  timeframe: "H4 / H1 / M15",
  bias: "BULLISH",
  imageUrl: "/assets/signal_screen.png",
  description: `Gold maintains a strong institutional bullish posture after sweeping Asian session sell-side liquidity at $2,638.20.

### Trade Setup & Execution Plan:
- **Primary Trigger:** Pullback into M15 Discount FVG with 5m bar-close confirmation.
- **Entry Zone:** $2,644.00 – $2,646.50
- **Stop Loss:** $2,637.80 (below Asian low sweep)
- **Target 1:** $2,658.00 (+120 Pips)
- **Target 2:** $2,668.50 (+225 Pips)

### Orderflow Confluence:
- Institutional Cumulative Volume Delta (CVD) shows aggressive passive absorption.
- DXY (US Dollar Index) facing key resistance at 104.20.`,
  session: "London Killzone",
  keyLevels: [
    { label: "Major BSL Target", level: "$2,688.00", type: "resistance", description: "Buy-side liquidity above high" },
    { label: "Daily Equilibrium", level: "$2,652.00", type: "equilibrium", description: "Median 50% retest" },
    { label: "Discount Order Block", level: "$2,642.50", type: "support", description: "Long entry zone" },
  ],
  author: "Kiaros Quant Team",
  published: true,
  createdAt: "2026-11-11T08:00:00Z",
  updatedAt: "2026-11-11T08:00:00Z",
};

const mockCandles: MarketCandle[] = [
  { time: 1731312000, open: 2640, high: 2645, low: 2639, close: 2644, volume: 100 },
  { time: 1731315600, open: 2644, high: 2650, low: 2642, close: 2648.5, volume: 150 },
];

describe("AnalysisView", () => {
  it("renders empty state when no active analyses are available", () => {
    render(<AnalysisView analyses={[]} candles={[]} />);
    expect(screen.getByText("No Analysis Published Yet")).toBeDefined();
  });

  it("renders article header, title, badges, and timeframe", () => {
    render(<AnalysisView analyses={[mockAnalysis]} candles={mockCandles} />);

    expect(screen.getAllByText("XAUUSD").length).toBeGreaterThan(0);
    expect(screen.getAllByText("H4 / H1 / M15").length).toBeGreaterThan(0);
    expect(screen.getAllByText("London Killzone").length).toBeGreaterThan(0);
    expect(screen.getAllByText("BULLISH").length).toBeGreaterThan(0);
    expect(screen.getByText(mockAnalysis.title)).toBeDefined();
  });

  it("renders clean market context, trade setup parameters, and confluence", () => {
    render(<AnalysisView analyses={[mockAnalysis]} candles={mockCandles} />);

    expect(screen.getByText("Market Context & Analysis")).toBeDefined();
    expect(screen.getByText(/Gold maintains a strong institutional bullish posture/i)).toBeDefined();
    expect(screen.getByText("Trade Setup & Execution Plan")).toBeDefined();
    expect(screen.getByText("Primary Trigger")).toBeDefined();
    expect(screen.getByText("Entry Zone")).toBeDefined();
    expect(screen.getByText("$2,644.00 – $2,646.50")).toBeDefined();
    expect(screen.getByText("Target 1")).toBeDefined();
    expect(screen.getByText("Orderflow Confluence")).toBeDefined();
    expect(screen.getByText(/Institutional Cumulative Volume Delta/i)).toBeDefined();
  });

  it("renders POI zones in a clean table", () => {
    render(<AnalysisView analyses={[mockAnalysis]} candles={mockCandles} />);

    expect(screen.getByText("Important POI Zones")).toBeDefined();
    expect(screen.getByText("3 zones")).toBeDefined();
    expect(screen.getByText("Major BSL Target")).toBeDefined();
    expect(screen.getByText("$2,688.00")).toBeDefined();
    expect(screen.getByText("Discount Order Block")).toBeDefined();
  });

  it("toggles between interactive chart and annotated blueprint image, and opens lightbox", () => {
    render(<AnalysisView analyses={[mockAnalysis]} candles={mockCandles} />);

    // Initially on interactive chart
    expect(screen.getByTestId("mock-poi-chart")).toBeDefined();

    // Click Blueprint tab
    const blueprintBtn = screen.getByRole("button", { name: /Annotated Blueprint/i });
    fireEvent.click(blueprintBtn);

    // Image container should now be visible with alt text
    const blueprintImg = screen.getByAltText(mockAnalysis.title);
    expect(blueprintImg).toBeDefined();

    // Click the blueprint image container to open lightbox
    const blueprintContainer = blueprintImg.closest("div[class*='cursor-pointer']");
    expect(blueprintContainer).toBeDefined();
    if (blueprintContainer) {
      fireEvent.click(blueprintContainer);

      // Lightbox modal is open
      expect(screen.getByRole("dialog")).toBeDefined();

      // Click Close
      const closeBtn = screen.getByRole("button", { name: /Close/i });
      fireEvent.click(closeBtn);
      expect(screen.queryByRole("dialog")).toBeNull();
    }
  });

  it("switches sessions when multiple analyses are available", () => {
    const secondAnalysis: DailyAnalysis = {
      ...mockAnalysis,
      id: "gold-analysis-2",
      title: "Gold NY Session Displacement",
      session: "NY Overlap",
      createdAt: "2026-11-10T14:00:00Z",
    };

    render(<AnalysisView analyses={[mockAnalysis, secondAnalysis]} candles={mockCandles} />);

    // Click on the second session button
    const sessionBtns = screen.getAllByRole("button", { name: /NY Overlap/i });
    fireEvent.click(sessionBtns[0]);

    // Active title changes
    expect(screen.getByText("Gold NY Session Displacement")).toBeDefined();
  });
});
