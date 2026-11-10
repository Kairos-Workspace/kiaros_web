import {
  createDailyAnalysis,
  listAllAnalysesForAdmin,
  type DailyAnalysis,
} from "@/lib/analysis";
import { generateDailyAnalysisDraftInput } from "@/lib/daily-analysis-ai";
import { buildDailyAnalysisContext } from "@/lib/daily-analysis-context";

export type GenerateDailyAnalysisResult = {
  ok: true;
  analysis: DailyAnalysis;
  reused: boolean;
  session: string;
  sentiment: {
    longPercentage: number;
    shortPercentage: number;
  } | null;
} | {
  ok: false;
  error: string;
};

function sameUtcDay(iso: string, now = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate()
  );
}

/**
 * Build market + Myfxbook context, ask Gemini for a Kiaros-format draft,
 * and publish it to the public /analysis page.
 */
export async function generateDailyAnalysisDraft(opts?: {
  session?: string | null;
  force?: boolean;
}): Promise<GenerateDailyAnalysisResult> {
  try {
    const ctx = await buildDailyAnalysisContext(opts?.session);

    if (!opts?.force) {
      const existing = await listAllAnalysesForAdmin();
      const duplicate = existing.find(
        (a) =>
          !a.published &&
          a.author === "Kiaros AI Desk" &&
          a.symbol === "XAUUSD" &&
          a.session === ctx.sessionLabel &&
          sameUtcDay(a.createdAt),
      );
      if (duplicate) {
        return {
          ok: true,
          analysis: duplicate,
          reused: true,
          session: ctx.sessionLabel,
          sentiment: ctx.sentiment
            ? {
                longPercentage: ctx.sentiment.longPercentage,
                shortPercentage: ctx.sentiment.shortPercentage,
              }
            : null,
        };
      }
    }

    const input = await generateDailyAnalysisDraftInput(ctx);
    const analysis = await createDailyAnalysis(input);

    return {
      ok: true,
      analysis,
      reused: false,
      session: ctx.sessionLabel,
      sentiment: ctx.sentiment
        ? {
            longPercentage: ctx.sentiment.longPercentage,
            shortPercentage: ctx.sentiment.shortPercentage,
          }
        : null,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to generate analysis",
    };
  }
}
