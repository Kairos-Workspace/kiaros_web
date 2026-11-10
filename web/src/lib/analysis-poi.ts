export type AnalysisLevelType =
  | "resistance"
  | "equilibrium"
  | "support"
  | "invalidation";

export type ParsedPoi = {
  low: number;
  high: number;
  mid: number;
  isZone: boolean;
};

/** Parse "$4,121.00–$4,128.68" or "$4,105.67" into numeric bounds. */
export function parsePoiLevel(level: string): ParsedPoi | null {
  const cleaned = String(level || "")
    .replace(/[$,USD\s]/gi, "")
    .replace(/,/g, "");
  if (!cleaned) return null;

  const parts = cleaned
    .split(/[–—\-~]|to/i)
    .map((p) => Number(p.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (parts.length >= 2) {
    const low = Math.min(parts[0], parts[1]);
    const high = Math.max(parts[0], parts[1]);
    return { low, high, mid: (low + high) / 2, isZone: high - low > 0.01 };
  }

  if (parts.length === 1) {
    return { low: parts[0], high: parts[0], mid: parts[0], isZone: false };
  }

  return null;
}

export function poiLineColor(type: AnalysisLevelType | string): string {
  switch (String(type || "").toLowerCase()) {
    case "support":
      return "#059669";
    case "resistance":
      return "#e11d48";
    case "invalidation":
      return "#d97706";
    case "equilibrium":
      return "#0284c7";
    default:
      return "#71717a";
  }
}

export function poiFillColor(type: AnalysisLevelType | string): string {
  switch (String(type || "").toLowerCase()) {
    case "support":
      return "rgba(5, 150, 105, 0.12)";
    case "resistance":
      return "rgba(225, 29, 72, 0.12)";
    case "invalidation":
      return "rgba(217, 119, 6, 0.12)";
    case "equilibrium":
      return "rgba(2, 132, 199, 0.10)";
    default:
      return "rgba(113, 113, 122, 0.10)";
  }
}
