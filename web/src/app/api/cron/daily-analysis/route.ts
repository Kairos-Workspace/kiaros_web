import { NextResponse } from "next/server";

import { generateDailyAnalysisDraft } from "@/lib/daily-analysis-generate";
import { authorizedBySecret } from "@/lib/webhook-guard";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * cron-job.org → generate and publish an XAUUSD daily analysis.
 * Auth: ENGINE_CRON_SECRET via Bearer or ?secret=
 * Optional: ?session=london|ny  ?force=1
 */
export async function GET(request: Request) {
  if (!authorizedBySecret(request, "ENGINE_CRON_SECRET", { allowQuerySecret: true })) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const session = url.searchParams.get("session");
  const force = url.searchParams.get("force") === "1";

  const result = await generateDailyAnalysisDraft({ session, force });
  if (!result.ok) {
    try {
      const { formatCronFailAlert, sendOpsTelegram } = await import(
        "@/lib/telegram-ops"
      );
      await sendOpsTelegram(
        formatCronFailAlert({
          job: "daily-analysis",
          detail: result.error,
        }),
      );
    } catch {
      // ignore alert failures
    }

    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    reused: result.reused,
    session: result.session,
    analysisId: result.analysis.id,
    title: result.analysis.title,
    bias: result.analysis.bias,
    published: result.analysis.published,
    sentiment: result.sentiment,
  });
}

export async function POST(request: Request) {
  return GET(request);
}
