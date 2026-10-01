export const COMING_SOON_TABS = ["ict", "supply-demand", "crt", "msnr"] as const;

export type ComingSoonTab = (typeof COMING_SOON_TABS)[number];

export type SignalsBrowseTab = "all" | "ai" | "bbma" | "smc" | ComingSoonTab;

/** Sub-filter within the AI Signal tab — one strategy or every strategy. */
export type AiSignalStrategy =
  | "all"
  | "super-scalping"
  | "scalping"
  | "swing";

export type SignalFilterOption = {
  id: string;
  label: string;
  hint: string;
  /** Compact lane code for the session rail (e.g. 5M). */
  code?: string;
  /** Placeholder strategy — selectable, but the page shows a coming-soon message. */
  comingSoon?: boolean;
  /** Shown but not selectable. */
  disabled?: boolean;
};

export function isComingSoonTab(tab: string | undefined): tab is ComingSoonTab {
  return COMING_SOON_TABS.includes(tab as ComingSoonTab);
}

export function comingSoonFilterOption(
  tab: string | undefined,
): SignalFilterOption | undefined {
  if (!isComingSoonTab(tab)) return undefined;
  return SIGNAL_FILTER_OPTIONS.find((o) => o.id === tab);
}

export function parseSignalsBrowseTab(tab: string | undefined): SignalsBrowseTab {
  if (tab === "ai") return "ai";
  if (tab === "bbma") return "bbma";
  if (tab === "smc") return "smc";
  if (isComingSoonTab(tab)) return tab;
  return "all";
}

export function parseAiSignalStrategy(
  strategy: string | undefined,
): AiSignalStrategy {
  if (strategy === "super-scalping") return "super-scalping";
  if (strategy === "scalping") return "scalping";
  if (strategy === "swing") return "swing";
  return "all";
}

export const SIGNAL_FILTER_OPTIONS: SignalFilterOption[] = [
  { id: "all", label: "ទាំងអស់", hint: "គ្រប់វគ្គ", code: "ALL" },
  { id: "ai", label: "AI Signal", hint: "បញ្ជាក់ដោយ SEA-LION", code: "AI" },
  { id: "bbma", label: "BBMA", hint: "XAU EA ផ្ទាល់", code: "BBMA" },
  { id: "ict", label: "ICT", hint: "មកដល់ឆាប់ៗ", code: "ICT", comingSoon: true },
  { id: "smc", label: "SMC", hint: "XAU EA ផ្ទាល់", code: "SMC" },
  {
    id: "supply-demand",
    label: "Supply Demand",
    hint: "មកដល់ឆាប់ៗ",
    code: "S/D",
    comingSoon: true,
  },
  { id: "crt", label: "CRT", hint: "មកដល់ឆាប់ៗ", code: "CRT", comingSoon: true },
  { id: "msnr", label: "MSNR", hint: "មកដល់ឆាប់ៗ", code: "MSNR", comingSoon: true },
];

/** Sub-strategy pills shown inside the AI Signal tab. */
export const AI_SIGNAL_STRATEGY_OPTIONS: SignalFilterOption[] = [
  { id: "all", label: "ទាំងអស់", hint: "គ្រប់យុទ្ធសាស្ត្រ AI", code: "ALL" },
  { id: "super-scalping", label: "Super scalp", hint: "5m ICT FVG", code: "5M" },
  { id: "scalping", label: "Scalping", hint: "15m cloud + MSS", code: "15M" },
  { id: "swing", label: "Swing", hint: "1h បញ្ជាក់ដោយ AI", code: "1H" },
];

export const ADMIN_SIGNAL_FILTER_OPTIONS: SignalFilterOption[] = [
  { id: "all", label: "All", hint: "Every stored signal", code: "ALL" },
  { id: "llm", label: "LLM", hint: "SEA-LION confirmed", code: "LLM" },
  { id: "super-scalping", label: "Super scalp (5m)", hint: "ICT FVG", code: "5M" },
  { id: "scalping", label: "Scalping (15m)", hint: "Cloud + MSS", code: "15M" },
  { id: "swing", label: "Swing (1h)", hint: "AI-confirmed", code: "1H" },
  { id: "bbma", label: "BBMA", hint: "XAU live EA", code: "BBMA" },
  { id: "smc", label: "SMC", hint: "XAU live EA", code: "SMC" },
];
