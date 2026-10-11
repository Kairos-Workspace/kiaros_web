import { describe, expect, it } from "vitest";
import { generateGeminiPrediction } from "@/lib/gemini";
import { buildEventId } from "@/lib/economic-calendar";

describe("economic-calendar utilities", () => {
  it("builds deterministic slugified event IDs with time", () => {
    const id = buildEventId("USD", "Core CPI (MoM)", "2026-10-14T12:30:00Z");
    expect(id).toBe("usd-core-cpi-mom-2026-10-14-1230");
  });

  it("handles empty or special character titles gracefully", () => {
    const id = buildEventId("EUR", "ECB Rate Decision & Statement!", "2026-10-15");
    expect(id).toBe("eur-ecb-rate-decision-statement-2026-10-15");
  });
});

describe("Gemini AI prediction engine", () => {
  it("generates structured macroeconomic prediction for inflation events", async () => {
    const event = {
      id: "usd-core-cpi-2026-10-14",
      title: "Core CPI (MoM)",
      currency: "USD",
      date: "2026-10-14T12:30:00Z",
      forecast: "0.3%",
      previous: "0.3%",
      impact: "HIGH",
    };

    const pred = await generateGeminiPrediction(event);

    expect(pred).toBeDefined();
    expect(["BULLISH", "BEARISH", "NEUTRAL"]).toContain(pred.bias);
    expect(["BULLISH", "BEARISH", "NEUTRAL"]).toContain(pred.goldImpact);
    expect(pred.confidence).toBeGreaterThanOrEqual(60);
    expect(pred.predictedOutcome.length).toBeGreaterThan(5);
    expect(pred.macroAnalysis.length).toBeGreaterThan(20);
    expect(pred.tradingPlaybook.length).toBeGreaterThan(20);
  });

  it("generates structured prediction for employment events", async () => {
    const event = {
      id: "usd-nfp-2026-10-16",
      title: "Non-Farm Employment Change (NFP)",
      currency: "USD",
      date: "2026-10-16T12:30:00Z",
      forecast: "140K",
      previous: "142K",
      impact: "HIGH",
    };

    const pred = await generateGeminiPrediction(event);

    expect(pred).toBeDefined();
    expect(pred.bias).toBe("BULLISH");
    expect(pred.goldImpact).toBe("BEARISH");
    expect(pred.confidence).toBeGreaterThanOrEqual(70);
  });
});
