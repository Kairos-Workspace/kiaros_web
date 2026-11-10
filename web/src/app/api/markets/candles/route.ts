import { NextRequest, NextResponse } from "next/server";
import {
  fetchMarketCandles,
  parseMarketInterval,
} from "@/lib/markets/kraken";

export const dynamic = "force-dynamic";

/** Public OHLC candles for analysis chart (XAUUSD / crypto). */
export async function GET(request: NextRequest) {
  try {
    const symbol = (request.nextUrl.searchParams.get("symbol") || "XAUUSD").toUpperCase();
    const interval = parseMarketInterval(request.nextUrl.searchParams.get("interval"));
    const limitRaw = Number(request.nextUrl.searchParams.get("limit") || "72");
    const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 72, 20), 180);

    const candles = await fetchMarketCandles(symbol, interval, limit);
    return NextResponse.json(
      { ok: true, symbol, interval, candles },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to load candles",
        candles: [],
      },
      { status: 502 },
    );
  }
}
