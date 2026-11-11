import { describe, expect, it } from "vitest";
import {
  analyzeCoin,
  formatCompactUsd,
  formatCryptoPrice,
  RawKrakenTicker,
  TRACKED_COINS,
  fetchCoinAnalyses,
  FALLBACK_COINS,
} from "@/lib/coins";

describe("coins library", () => {
  describe("formatCryptoPrice", () => {
    it("formats zero", () => {
      expect(formatCryptoPrice(0)).toBe("$0.00");
    });

    it("formats high value crypto (>= 1000) with thousands commas and 2 decimals", () => {
      expect(formatCryptoPrice(73540.1)).toBe("$73,540.10");
    });

    it("formats mid value crypto (>= 1)", () => {
      expect(formatCryptoPrice(82.51)).toBe("$82.51");
    });

    it("formats small decimals (< 1 and >= 0.001)", () => {
      expect(formatCryptoPrice(0.1738)).toBe("$0.1738");
    });

    it("formats micro prices (< 0.001)", () => {
      expect(formatCryptoPrice(0.000005238)).toBe("$0.00000524");
    });
  });

  describe("formatCompactUsd", () => {
    it("formats billions", () => {
      expect(formatCompactUsd(2_500_000_000)).toBe("$2.50B");
    });

    it("formats millions", () => {
      expect(formatCompactUsd(27_600_000)).toBe("$27.60M");
    });

    it("formats thousands", () => {
      expect(formatCompactUsd(45_200)).toBe("$45.2K");
    });

    it("formats small amounts", () => {
      expect(formatCompactUsd(850)).toBe("$850");
    });
  });

  describe("analyzeCoin", () => {
    const btcConfig = TRACKED_COINS.find((c) => c.symbol === "BTC")!;

    it("evaluates a steady bullish momentum ticker as potential", () => {
      const mockRaw: RawKrakenTicker = {
        a: ["73550.00", "1", "1.000"],
        b: ["73545.00", "1", "1.000"],
        c: ["73548.00", "0.5"],
        v: ["500", "3000"],
        p: ["73100.00", "73150.00"],
        t: [1000, 5000],
        l: ["72000.00", "71800.00"],
        h: ["74000.00", "74200.00"],
        o: "71200.00", // +3.29% change
      };

      const result = analyzeCoin(btcConfig, mockRaw);

      expect(result.symbol).toBe("BTC");
      expect(result.category).toBe("potential");
      expect(result.potentialScore).toBeGreaterThanOrEqual(65);
      expect(result.riskScore).toBeLessThan(60);
      expect(result.support).toBeGreaterThan(0);
      expect(result.target).toBeGreaterThan(result.price);
      expect(result.riskRewardRatio).toBeGreaterThan(0);
      expect(result.potentialDrivers.length).toBeGreaterThan(0);
      expect(result.actionPlaybook).toContain("Favor pullback longs");
    });

    it("evaluates an overextended pump as high risk", () => {
      const pepeConfig = TRACKED_COINS.find((c) => c.symbol === "PEPE")!;
      const mockRaw: RawKrakenTicker = {
        a: ["0.0000062", "100", "100.000"],
        b: ["0.0000060", "100", "100.000"],
        c: ["0.0000061", "1000000"],
        v: ["1000", "5000"],
        p: ["0.0000052", "0.0000053"],
        t: [500, 2000],
        l: ["0.0000048", "0.0000048"],
        h: ["0.0000062", "0.0000062"],
        o: "0.0000049", // +24.4% change, overheated
      };

      const result = analyzeCoin(pepeConfig, mockRaw);

      expect(result.symbol).toBe("PEPE");
      expect(result.category).toBe("risky");
      expect(result.riskScore).toBeGreaterThanOrEqual(65);
      expect(result.riskWarnings.length).toBeGreaterThan(0);
      expect(result.actionPlaybook).toContain("Avoid FOMO");
    });
  });

  describe("fetchCoinAnalyses", () => {
    it("returns array of analyzed coins with all tracked assets", async () => {
      const result = await fetchCoinAnalyses();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(FALLBACK_COINS.length);

      const btc = result.find((c) => c.symbol === "BTC");
      expect(btc).toBeDefined();
      expect(btc?.price).toBeGreaterThan(0);
      expect(btc?.potentialScore).toBeGreaterThanOrEqual(0);
      expect(btc?.riskScore).toBeGreaterThanOrEqual(0);
    });
  });
});

