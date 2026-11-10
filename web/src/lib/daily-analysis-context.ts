import { fetchMarketCandles, type MarketCandle } from "@/lib/markets/kraken";
import {
  fetchMyfxbookOutlook,
  type MyfxbookSymbolOutlook,
} from "@/lib/myfxbook";

export type AnalysisSessionKey = "london" | "ny";

export type GoldMarketSnapshot = {
  last: number;
  changePct: number;
  sessionHigh: number;
  sessionLow: number;
  swingHigh: number;
  swingLow: number;
  sma20: number;
  structure: "bullish" | "bearish" | "range";
  candlesUsed: number;
};

export type DailyAnalysisContext = {
  symbol: string;
  sessionKey: AnalysisSessionKey;
  sessionLabel: string;
  generatedAt: string;
  market: GoldMarketSnapshot;
  sentiment: MyfxbookSymbolOutlook | null;
};

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function summarizeCandles(candles: MarketCandle[]): GoldMarketSnapshot {
  const closes = candles.map((c) => c.close);
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const last = closes[closes.length - 1] ?? 0;
  const first = closes[0] ?? last;
  const sma20 = avg(closes.slice(-20));
  const swingHigh = Math.max(...highs.slice(-48));
  const swingLow = Math.min(...lows.slice(-48));
  const sessionHigh = Math.max(...highs.slice(-8));
  const sessionLow = Math.min(...lows.slice(-8));
  const changePct = first === 0 ? 0 : ((last - first) / first) * 100;

  let structure: GoldMarketSnapshot["structure"] = "range";
  if (last > sma20 * 1.001 && last > first) structure = "bullish";
  else if (last < sma20 * 0.999 && last < first) structure = "bearish";

  return {
    last: Number(last.toFixed(2)),
    changePct: Number(changePct.toFixed(2)),
    sessionHigh: Number(sessionHigh.toFixed(2)),
    sessionLow: Number(sessionLow.toFixed(2)),
    swingHigh: Number(swingHigh.toFixed(2)),
    swingLow: Number(swingLow.toFixed(2)),
    sma20: Number(sma20.toFixed(2)),
    structure,
    candlesUsed: candles.length,
  };
}

export function resolveAnalysisSession(
  explicit?: string | null,
): { key: AnalysisSessionKey; label: string } {
  const raw = (explicit || "").trim().toLowerCase();
  if (raw === "ny" || raw === "newyork" || raw === "new-york") {
    return { key: "ny", label: "London Killzone → NY Overlap" };
  }
  if (raw === "london") {
    return { key: "london", label: "London Killzone" };
  }

  const hour = new Date().getUTCHours();
  // Rough London open prep window vs NY open / overlap
  if (hour >= 10 && hour < 18) {
    return { key: "ny", label: "London Killzone → NY Overlap" };
  }
  return { key: "london", label: "London Killzone" };
}

export async function buildDailyAnalysisContext(
  session?: string | null,
): Promise<DailyAnalysisContext> {
  const { key, label } = resolveAnalysisSession(session);

  const [candles, sentiment] = await Promise.all([
    fetchMarketCandles("XAUUSD", "1h", 72),
    fetchMyfxbookOutlook("XAUUSD").catch((err) => {
      console.warn("Myfxbook outlook unavailable:", err);
      return null;
    }),
  ]);

  if (!candles.length) {
    throw new Error("No XAUUSD market candles available");
  }

  return {
    symbol: "XAUUSD",
    sessionKey: key,
    sessionLabel: label,
    generatedAt: new Date().toISOString(),
    market: summarizeCandles(candles),
    sentiment,
  };
}
