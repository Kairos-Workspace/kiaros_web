"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";

import { SlidingPillNav } from "@/components/shared/SlidingPillNav";
import {
  SIGNAL_FILTER_OPTIONS,
  type SignalFilterOption,
  type SignalsBrowseTab,
} from "@/lib/signals-browse-tabs";

/** Top-level session filter — a sliding-pill segmented control. */
export function SignalsSessionRail({
  tab,
  basePath,
  options = SIGNAL_FILTER_OPTIONS,
}: {
  tab: SignalsBrowseTab | string;
  basePath: string;
  options?: SignalFilterOption[];
}) {
  const { t } = useTranslation();
  return (
    <SlidingPillNav
      ariaLabel={t("Sessions")}
      activeId={tab}
      options={options.map((option) => ({ ...option, label: t(option.label), hint: t(option.hint) }))}
      hrefFor={(id) => (id === "all" ? basePath : `${basePath}?tab=${id}`)}
    />
  );
}
