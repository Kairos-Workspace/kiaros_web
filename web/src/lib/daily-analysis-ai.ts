import type { CreateAnalysisInput } from "@/lib/analysis";
import type { DailyAnalysisContext } from "@/lib/daily-analysis-context";

type AiAnalysisPayload = {
  title: string;
  bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  timeframe: string;
  description: string;
  keyLevels: Array<{
    label: string;
    level: string;
    type: "resistance" | "equilibrium" | "support" | "invalidation";
    description?: string;
  }>;
};

function validateBias(value: unknown): "BULLISH" | "BEARISH" | "NEUTRAL" {
  const v = String(value || "").toUpperCase();
  if (v === "BEARISH") return "BEARISH";
  if (v === "NEUTRAL") return "NEUTRAL";
  return "BULLISH";
}

function validateLevelType(
  value: unknown,
): "resistance" | "equilibrium" | "support" | "invalidation" {
  const v = String(value || "").toLowerCase();
  if (v === "support") return "support";
  if (v === "equilibrium") return "equilibrium";
  if (v === "invalidation") return "invalidation";
  return "resistance";
}

function buildPrompt(ctx: DailyAnalysisContext): string {
  const sentimentBlock = ctx.sentiment
    ? `Myfxbook retail sentiment XAUUSD: Long ${ctx.sentiment.longPercentage}% / Short ${ctx.sentiment.shortPercentage}%.`
    : "Sentiment unavailable — use price structure only.";

  return `You write a SHORT Gold (XAUUSD) market ANALYSIS for Kiaros.

Session: ${ctx.sessionLabel}
UTC: ${ctx.generatedAt}
Price: last ${ctx.market.last} | high/low ${ctx.market.sessionHigh}/${ctx.market.sessionLow} | swing ${ctx.market.swingHigh}/${ctx.market.swingLow} | SMA20 ${ctx.market.sma20}
Structure: ${ctx.market.structure}
${sentimentBlock}

GOAL: Show traders the important POI zones only — where liquidity / demand / supply matters.

STRICTLY FORBIDDEN (do not include anywhere):
- BUY / SELL / LONG / SHORT calls
- Signal language
- Entry / Stop Loss / Take Profit / TP / R:R
- Trade tickets or execution instructions
- "wait for confirmation then enter"

ALLOWED:
- Bias as market structure context only (not a call to trade)
- Important POI zone prices + why that zone matters
- 1-2 short sentences of market context

Respond STRICTLY as JSON:
{
  "title": "short analysis headline about structure/POI e.g. XAUUSD Discount Demand POI Into London",
  "bias": "BULLISH" | "BEARISH" | "NEUTRAL",
  "timeframe": "H1 / M15",
  "description": "2 short sentences max about current structure and which POIs matter. No trade instructions.",
  "keyLevels": [
    {
      "label": "short POI name e.g. Discount Demand / Premium Supply / Session High Liquidity",
      "level": "$X,XXX.XX or $X,XXX–$X,XXX",
      "type": "resistance" | "support" | "equilibrium" | "invalidation",
      "description": "why this POI matters, max 10 words"
    }
  ]
}

Rules:
- Exactly 3 to 5 keyLevels — only important POI zones.
- Levels must sit near live last price (${ctx.market.last}).
- description must NOT contain entry/SL/TP/buy/sell.
- Do not mention AI. Gold/XAUUSD only.`;
}

async function callGeminiJson(prompt: string): Promise<AiAnalysisPayload> {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest",
  ];
  let lastError = "Gemini unavailable";

  for (const model of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!res.ok) {
      lastError = `Gemini ${model} HTTP ${res.status}`;
      continue;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      lastError = `Gemini ${model} empty response`;
      continue;
    }

    const parsed = JSON.parse(text) as Partial<AiAnalysisPayload>;
    const keyLevels = Array.isArray(parsed.keyLevels)
      ? parsed.keyLevels
          .slice(0, 5)
          .map((lvl) => ({
            label: String(lvl?.label || "POI"),
            level: String(lvl?.level || ""),
            type: validateLevelType(lvl?.type),
            description: lvl?.description ? String(lvl.description).slice(0, 100) : undefined,
          }))
          .filter((lvl) => lvl.level)
      : [];

    return {
      title: String(parsed.title || "XAUUSD POI Map"),
      bias: validateBias(parsed.bias),
      timeframe: String(parsed.timeframe || "H1 / M15"),
      description: String(parsed.description || ""),
      keyLevels,
    };
  }

  throw new Error(lastError);
}

export async function generateDailyAnalysisDraftInput(
  ctx: DailyAnalysisContext,
): Promise<CreateAnalysisInput> {
  const ai = await callGeminiJson(buildPrompt(ctx));

  return {
    title: ai.title,
    symbol: "XAUUSD",
    timeframe: ai.timeframe,
    bias: ai.bias,
    // No chart until admin uploads a real blueprint
    imageUrl: "",
    description: ai.description,
    session: ctx.sessionLabel,
    keyLevels: ai.keyLevels,
    author: "Kiaros AI Desk",
    published: true,
  };
}
