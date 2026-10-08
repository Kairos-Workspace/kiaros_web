import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { deleteAnalysisImage } from "@/lib/r2";

export type DailyAnalysis = {
  id: string;
  title: string;
  symbol: string;
  timeframe: string;
  bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  imageUrl: string;
  imageKey?: string;
  description: string;
  session: string;
  keyLevels?: Array<{
    label: string;
    level: string;
    type: "resistance" | "equilibrium" | "support" | "invalidation";
    description?: string;
  }>;
  author: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAnalysisInput = {
  title: string;
  symbol: string;
  timeframe: string;
  bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  imageUrl: string;
  imageKey?: string;
  description: string;
  session?: string;
  keyLevels?: Array<{
    label: string;
    level: string;
    type: "resistance" | "equilibrium" | "support" | "invalidation";
    description?: string;
  }>;
  author?: string;
  published?: boolean;
};

const DEFAULT_ANALYSES: DailyAnalysis[] = [
  {
    id: "default-xauusd",
    title: "Gold (XAUUSD) London Liquidity Sweep & M15 Fair Value Gap Retest",
    symbol: "XAUUSD",
    timeframe: "H4 / H1 / M15",
    bias: "BULLISH",
    imageUrl: "/assets/signal_screen.png",
    description: `Gold maintains a strong institutional bullish posture after sweeping Asian session sell-side liquidity at $2,638.20. Market structure on H1 shifted bullish with high displacement creating a prominent Fair Value Gap (FVG) at $2,642.00–$2,646.00.

### Trade Setup & Execution Plan:
- **Primary Trigger:** Pullback into M15 Discount FVG with 5m bar-close bullish engulfing confirmation.
- **Entry Zone:** $2,644.00 – $2,646.50
- **Stop Loss:** $2,637.80 (below Asian low sweep)
- **Target 1:** $2,658.00 (+120 Pips)
- **Target 2:** $2,668.50 (+225 Pips)
- **Target 3:** $2,682.00 (+360 Pips)

### Orderflow Confluence:
- Institutional Cumulative Volume Delta (CVD) shows aggressive passive absorption at the London open low.
- Commercial trader positioning (COT) remains net positive with sustained central bank accumulation tailwinds.
- DXY (US Dollar Index) facing key resistance at 104.20, providing confluence for bullion upside expansion.`,
    session: "London Killzone → NY Overlap",
    keyLevels: [
      { label: "Major BSL Target (ATH Pool)", level: "$2,688.00", type: "resistance", description: "Buy-side liquidity resting above weekly swing high" },
      { label: "Session Target 1 (Interday High)", level: "$2,662.50", type: "resistance", description: "Internal range liquidity & NY session high objective" },
      { label: "Daily Equilibrium (50% Range)", level: "$2,652.00", type: "equilibrium", description: "Institutional median fair value retest zone" },
      { label: "Discount Order Block & M15 FVG", level: "$2,642.50", type: "support", description: "High-probability long entry zone upon pullback" },
      { label: "Structural Invalidation (SSL)", level: "$2,635.00", type: "invalidation", description: "H4 swing low; break below negates bullish continuation" },
    ],
    author: "Kiaros Quant Team",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "default-eurusd",
    title: "EURUSD London Open Range Expansion & Bearish Displacement",
    symbol: "EURUSD",
    timeframe: "H4 / H1",
    bias: "BEARISH",
    imageUrl: "/assets/signal_screen.png",
    description: `EURUSD completed an engineered liquidity sweep above the previous day high (1.08450) into an established institutional 4H order block. Displacement lower confirmed with consecutive bearish candle closures on 15m.

### Execution Blueprint:
- **Bias:** Short on premium re-entry into 1.08280 equilibrium.
- **Stop Loss:** 1.08480
- **Target 1:** 1.07800 (Previous Day Low)
- **Target 2:** 1.07400 (Daily Institutional Demand)`,
    session: "London Killzone",
    keyLevels: [
      { label: "Premium Order Block", level: "1.08450", type: "resistance" },
      { label: "Equilibrium Level", level: "1.08250", type: "equilibrium" },
      { label: "Sell-Side Liquidity Pool", level: "1.07800", type: "support" },
    ],
    author: "Kiaros Quant Team",
    published: true,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "default-btcusd",
    title: "Bitcoin (BTCUSD) 4H Bullish Structure Shift & Institutional Absorption",
    symbol: "BTCUSD",
    timeframe: "H4 / 1H",
    bias: "BULLISH",
    imageUrl: "/assets/signal_screen.png",
    description: `BTC demonstrated massive spot volume absorption on the weekend consolidation retest. Price reclaimed key $68,200 pivot with sustained Open Interest (OI) expansion indicating institutional accumulation.

### Execution Blueprint:
- **Bias:** Long on retest of $68,500 demand shelf.
- **Stop Loss:** $67,400
- **Take Profit:** $71,200 / $73,500`,
    session: "Global 24/7 Session",
    keyLevels: [
      { label: "All-Time High Liquidity", level: "$73,800", type: "resistance" },
      { label: "Institutional Pivot Shelf", level: "$68,500", type: "support" },
      { label: "Macro Invalidation", level: "$66,800", type: "invalidation" },
    ],
    author: "Kiaros Quant Team",
    published: true,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

const LOCAL_STORAGE_FILE = path.join(process.cwd(), "public", "uploads", "daily-analyses.json");

async function readLocalAnalyses(): Promise<DailyAnalysis[]> {
  try {
    const raw = await readFile(LOCAL_STORAGE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // If file doesn't exist, return defaults
  }
  return DEFAULT_ANALYSES;
}

async function writeLocalAnalyses(analyses: DailyAnalysis[]): Promise<void> {
  const dir = path.dirname(LOCAL_STORAGE_FILE);
  await mkdir(dir, { recursive: true });
  await writeFile(LOCAL_STORAGE_FILE, JSON.stringify(analyses, null, 2), "utf-8");
}

function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

/**
 * Fetch all published analyses for public page (/analysis).
 */
export async function listPublishedAnalyses(): Promise<DailyAnalysis[]> {
  const cfg = getSupabaseConfig();
  if (cfg) {
    try {
      const res = await fetch(
        `${cfg.url}/rest/v1/daily_analyses?published=eq.true&order=created_at.desc`,
        {
          headers: {
            apikey: cfg.key,
            Authorization: `Bearer ${cfg.key}`,
          },
          next: { revalidate: 30, tags: ["daily-analyses"] },
        },
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            title: r.title,
            symbol: r.symbol,
            timeframe: r.timeframe,
            bias: r.bias,
            imageUrl: r.image_url,
            imageKey: r.image_key,
            description: r.description,
            session: r.session || "London / New York",
            keyLevels: r.key_levels || [],
            author: r.author || "Kiaros Quant Team",
            published: Boolean(r.published),
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));
        }
      }
    } catch {
      // Fallback to local
    }
  }

  const local = await readLocalAnalyses();
  return local.filter((a) => a.published);
}

/**
 * Fetch all analyses (including drafts) for admin dashboard.
 */
export async function listAllAnalysesForAdmin(): Promise<DailyAnalysis[]> {
  const cfg = getSupabaseConfig();
  if (cfg) {
    try {
      const res = await fetch(
        `${cfg.url}/rest/v1/daily_analyses?order=created_at.desc`,
        {
          headers: {
            apikey: cfg.key,
            Authorization: `Bearer ${cfg.key}`,
          },
          cache: "no-store",
        },
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            title: r.title,
            symbol: r.symbol,
            timeframe: r.timeframe,
            bias: r.bias,
            imageUrl: r.image_url,
            imageKey: r.image_key,
            description: r.description,
            session: r.session || "London / New York",
            keyLevels: r.key_levels || [],
            author: r.author || "Kiaros Quant Team",
            published: Boolean(r.published),
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));
        }
      }
    } catch {
      // Fallback
    }
  }

  return await readLocalAnalyses();
}

/**
 * Create a new daily analysis.
 */
export async function createDailyAnalysis(
  input: CreateAnalysisInput,
): Promise<DailyAnalysis> {
  const now = new Date().toISOString();
  const id = `analysis-${Date.now()}`;

  const record: DailyAnalysis = {
    id,
    title: input.title,
    symbol: input.symbol.toUpperCase(),
    timeframe: input.timeframe,
    bias: input.bias,
    imageUrl: input.imageUrl,
    imageKey: input.imageKey,
    description: input.description,
    session: input.session || "London / New York",
    keyLevels: input.keyLevels || [],
    author: input.author || "Kiaros Quant Team",
    published: input.published ?? true,
    createdAt: now,
    updatedAt: now,
  };

  const cfg = getSupabaseConfig();
  if (cfg) {
    try {
      const res = await fetch(`${cfg.url}/rest/v1/daily_analyses`, {
        method: "POST",
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          title: record.title,
          symbol: record.symbol,
          timeframe: record.timeframe,
          bias: record.bias,
          image_url: record.imageUrl,
          image_key: record.imageKey,
          description: record.description,
          session: record.session,
          key_levels: record.keyLevels,
          author: record.author,
          published: record.published,
        }),
      });

      if (res.ok) {
        const [saved] = await res.json();
        if (saved?.id) {
          return {
            ...record,
            id: saved.id,
            createdAt: saved.created_at || now,
            updatedAt: saved.updated_at || now,
          };
        }
      }
    } catch {
      // Fallback to local
    }
  }

  // Update local file storage fallback
  const local = await readLocalAnalyses();
  const updated = [record, ...local];
  await writeLocalAnalyses(updated);

  return record;
}

/**
 * Delete daily analysis.
 */
export async function deleteDailyAnalysis(id: string): Promise<boolean> {
  const all = await listAllAnalysesForAdmin();
  const target = all.find((a) => a.id === id);

  if (target?.imageKey) {
    await deleteAnalysisImage(target.imageKey);
  }

  const cfg = getSupabaseConfig();
  if (cfg) {
    try {
      await fetch(
        `${cfg.url}/rest/v1/daily_analyses?id=eq.${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            apikey: cfg.key,
            Authorization: `Bearer ${cfg.key}`,
          },
        },
      );
    } catch {
      // Ignore
    }
  }

  const local = await readLocalAnalyses();
  const filtered = local.filter((a) => a.id !== id);
  await writeLocalAnalyses(filtered);
  return true;
}

/**
 * Toggle published state of an analysis.
 */
export async function toggleDailyAnalysisPublished(
  id: string,
  published: boolean,
): Promise<boolean> {
  const cfg = getSupabaseConfig();
  if (cfg) {
    try {
      await fetch(
        `${cfg.url}/rest/v1/daily_analyses?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            apikey: cfg.key,
            Authorization: `Bearer ${cfg.key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ published, updated_at: new Date().toISOString() }),
        },
      );
    } catch {
      // Fallback
    }
  }

  const local = await readLocalAnalyses();
  const updated = local.map((a) => (a.id === id ? { ...a, published } : a));
  await writeLocalAnalyses(updated);
  return true;
}
