"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";

import { SlidingPillNav } from "@/components/shared/SlidingPillNav";
import {
  AI_SIGNAL_STRATEGY_OPTIONS,
  type AiSignalStrategy,
} from "@/lib/signals-browse-tabs";

/** Sub-filter nested inside the AI Signal tab — pick a strategy, or all of them. */
export function AiStrategyRail({
  strategy,
  basePath,
}: {
  strategy: AiSignalStrategy;
  basePath: string;
}) {
  const { t } = useTranslation();
  return (
    <SlidingPillNav
      ariaLabel={t("AI Strategies")}
      activeId={strategy}
      options={AI_SIGNAL_STRATEGY_OPTIONS.map((option) => ({ ...option, label: t(option.label), hint: t(option.hint) }))}
      hrefFor={(id) =>
        id === "all" ? `${basePath}?tab=ai` : `${basePath}?tab=ai&strategy=${id}`
      }
      size="sm"
    />
  );
}
