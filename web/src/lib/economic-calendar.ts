import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { GeminiPredictionResult } from "@/lib/gemini";

export type EconomicImpact = "HIGH" | "MEDIUM" | "LOW" | "HOLIDAY";

export type EconomicPrediction = GeminiPredictionResult & {
  id: string; // matches event.id
  eventTitle: string;
  currency: string;
  eventDate: string;
  forecast: string;
  previous: string;
  actual: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EconomicCalendarEvent = {
  id: string;
  time: string;
  session: "London" | "New York" | "Tokyo" | "Sydney";
  currency: string;
  event: string;
  impact: EconomicImpact;
  actual: string | null;
  forecast: string;
  previous: string;
  dateTag: "today" | "tomorrow" | "this-week";
  dateFormatted: string;
  rawDate: string;
  algoAction: "Signal Shield Active (±15m)" | "Normal STP Execution" | "Volatility Expansion Warning";
  prediction?: EconomicPrediction | null;
};

const CALENDAR_FEED_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
const LOCAL_PREDICTIONS_DIR = path.join(process.cwd(), "data");
const LOCAL_PREDICTIONS_FILE = path.join(LOCAL_PREDICTIONS_DIR, "economic_predictions.json");

// In-memory cache for live feed
let cachedEvents: EconomicCalendarEvent[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const DEFAULT_CURATED_EVENTS: EconomicCalendarEvent[] = [
  {
    id: "usd-core-cpi-mom",
    time: "12:30 GMT",
    session: "New York",
    currency: "USD",
    event: "Core CPI (MoM)",
    impact: "HIGH",
    actual: null,
    forecast: "0.3%",
    previous: "0.3%",
    dateTag: "today",
    dateFormatted: "Wednesday, Oct 14",
    rawDate: "2026-10-14T12:30:00Z",
    algoAction: "Signal Shield Active (±15m)",
  },
  {
    id: "usd-cpi-inflation-rate-yoy",
    time: "12:30 GMT",
    session: "New York",
    currency: "USD",
    event: "CPI Inflation Rate (YoY)",
    impact: "HIGH",
    actual: null,
    forecast: "2.4%",
    previous: "2.5%",
    dateTag: "today",
    dateFormatted: "Wednesday, Oct 14",
    rawDate: "2026-10-14T12:30:00Z",
    algoAction: "Signal Shield Active (±15m)",
  },
  {
    id: "usd-fomc-meeting-minutes",
    time: "18:00 GMT",
    session: "New York",
    currency: "USD",
    event: "FOMC Meeting Minutes",
    impact: "HIGH",
    actual: null,
    forecast: "—",
    previous: "—",
    dateTag: "today",
    dateFormatted: "Wednesday, Oct 14",
    rawDate: "2026-10-14T18:00:00Z",
    algoAction: "Signal Shield Active (±15m)",
  },
  {
    id: "usd-initial-jobless-claims",
    time: "12:30 GMT",
    session: "New York",
    currency: "USD",
    event: "Initial Jobless Claims",
    impact: "MEDIUM",
    actual: null,
    forecast: "220K",
    previous: "225K",
    dateTag: "tomorrow",
    dateFormatted: "Thursday, Oct 15",
    rawDate: "2026-10-15T12:30:00Z",
    algoAction: "Normal STP Execution",
  },
  {
    id: "usd-non-farm-employment-change-nfp",
    time: "12:30 GMT",
    session: "New York",
    currency: "USD",
    event: "Non-Farm Employment Change (NFP)",
    impact: "HIGH",
    actual: null,
    forecast: "140K",
    previous: "142K",
    dateTag: "this-week",
    dateFormatted: "Friday, Oct 16",
    rawDate: "2026-10-16T12:30:00Z",
    algoAction: "Signal Shield Active (±15m)",
  },
  {
    id: "usd-unemployment-rate",
    time: "12:30 GMT",
    session: "New York",
    currency: "USD",
    event: "Unemployment Rate",
    impact: "HIGH",
    actual: null,
    forecast: "4.2%",
    previous: "4.2%",
    dateTag: "this-week",
    dateFormatted: "Friday, Oct 16",
    rawDate: "2026-10-16T12:30:00Z",
    algoAction: "Signal Shield Active (±15m)",
  },
];

/**
 * Generate a deterministic event ID from title, currency, date, and optional time
 */
export function buildEventId(currency: string, title: string, rawDate: string, time?: string): string {
  const c = currency.toLowerCase().trim();
  const t = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const datePart = rawDate ? rawDate.split("T")[0] : "upcoming";
  let timePart = "";
  if (rawDate && rawDate.includes("T")) {
    const rawTime = rawDate.split("T")[1]?.slice(0, 5).replace(":", "") || "";
    if (rawTime) timePart = `-${rawTime}`;
  } else if (time) {
    const cleanTime = time.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanTime) timePart = `-${cleanTime}`;
  }
  return `${c}-${t}-${datePart}${timePart}`;
}

function parseSession(hoursUtc: number): "London" | "New York" | "Tokyo" | "Sydney" {
  if (hoursUtc >= 0 && hoursUtc < 7) return "Tokyo";
  if (hoursUtc >= 7 && hoursUtc < 12) return "London";
  if (hoursUtc >= 12 && hoursUtc < 21) return "New York";
  return "Sydney";
}

function parseDateTag(eventDate: Date, nowDate: Date): "today" | "tomorrow" | "this-week" {
  const diffDays = Math.floor(
    (eventDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "tomorrow";
  return "this-week";
}

/**
 * Fetch raw economic events from ForexFactory feed with robust error recovery
 */
export async function fetchLiveEconomicEvents(): Promise<EconomicCalendarEvent[]> {
  const now = Date.now();
  if (cachedEvents && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedEvents;
  }

  try {
    const res = await fetch(CALENDAR_FEED_URL, {
      headers: { "User-Agent": "KiarosSignals/1.0 (Quant Trading Desk)" },
      next: { revalidate: 600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const nowDate = new Date();
        const parsed: EconomicCalendarEvent[] = [];
        const seenIds = new Map<string, number>();

        for (const item of data) {
          if (!item || typeof item !== "object") continue;
          const title = String(item.title || "").trim();
          const country = String(item.country || "").trim().toUpperCase();
          const impactRaw = String(item.impact || "").trim().toLowerCase();
          const dateStr = String(item.date || "");

          if (!title || country !== "USD") continue;

          let eventDate: Date;
          try {
            eventDate = new Date(dateStr);
            if (isNaN(eventDate.getTime())) eventDate = new Date();
          } catch {
            eventDate = new Date();
          }

          const hours = eventDate.getUTCHours();
          const minutes = eventDate.getUTCMinutes();
          const timeFormatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} GMT`;

          const impact: EconomicImpact =
            impactRaw === "high"
              ? "HIGH"
              : impactRaw === "medium"
              ? "MEDIUM"
              : impactRaw === "low"
              ? "LOW"
              : "HOLIDAY";

          let id = buildEventId(country, title, dateStr, timeFormatted);
          const occurrences = (seenIds.get(id) || 0) + 1;
          seenIds.set(id, occurrences);
          if (occurrences > 1) {
            id = `${id}-${occurrences}`;
          }
          const dateTag = parseDateTag(eventDate, nowDate);

          const dateFormatted = eventDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          });

          const algoAction: EconomicCalendarEvent["algoAction"] =
            impact === "HIGH"
              ? "Signal Shield Active (±15m)"
              : impact === "MEDIUM"
              ? "Volatility Expansion Warning"
              : "Normal STP Execution";

          parsed.push({
            id,
            time: timeFormatted,
            session: parseSession(hours),
            currency: country,
            event: title,
            impact,
            actual: item.actual ? String(item.actual).trim() : null,
            forecast: item.forecast ? String(item.forecast).trim() : "—",
            previous: item.previous ? String(item.previous).trim() : "—",
            dateTag,
            dateFormatted,
            rawDate: dateStr,
            algoAction,
          });
        }

        if (parsed.length > 0) {
          cachedEvents = parsed;
          lastFetchTime = now;
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("ForexFactory live feed rate-limited or unavailable, using curated fallback:", err);
  }

  // Fallback to cached or curated events
  return cachedEvents ?? DEFAULT_CURATED_EVENTS;
}

/* ==========================================================================
   PREDICTION PERSISTENCE (SUPABASE + LOCAL JSON BACKUP)
   ========================================================================== */

function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

async function readLocalPredictions(): Promise<Record<string, EconomicPrediction>> {
  try {
    const raw = await readFile(LOCAL_PREDICTIONS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

async function writeLocalPredictions(data: Record<string, EconomicPrediction>): Promise<void> {
  try {
    await mkdir(LOCAL_PREDICTIONS_DIR, { recursive: true });
    await writeFile(LOCAL_PREDICTIONS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local predictions:", err);
  }
}

export async function getAllPredictions(): Promise<Record<string, EconomicPrediction>> {
  const cfg = getSupabaseConfig();
  if (cfg) {
    try {
      const res = await fetch(`${cfg.url}/rest/v1/economic_predictions?select=*`, {
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
        },
        next: { revalidate: 30, tags: ["economic-predictions"] },
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const map: Record<string, EconomicPrediction> = {};
          for (const r of rows) {
            map[r.id] = {
              id: r.id,
              eventTitle: r.event_title,
              currency: r.currency,
              eventDate: r.event_date || "",
              forecast: r.forecast || "—",
              previous: r.previous || "—",
              actual: r.actual || null,
              bias: r.bias,
              goldImpact: r.gold_impact || "NEUTRAL",
              predictedOutcome: r.predicted_outcome,
              confidence: Number(r.confidence) || 75,
              summary: r.summary || "",
              macroAnalysis: r.macro_analysis || "",
              tradingPlaybook: r.trading_playbook || "",
              modelName: r.model_name || "gemini-2.5-flash",
              createdAt: r.created_at,
              updatedAt: r.updated_at,
            };
          }
          return map;
        }
      }
    } catch {
      // Fall through to local
    }
  }

  return await readLocalPredictions();
}

export async function savePrediction(prediction: EconomicPrediction): Promise<void> {
  // 1. Try Supabase
  const cfg = getSupabaseConfig();
  if (cfg) {
    try {
      await fetch(`${cfg.url}/rest/v1/economic_predictions`, {
        method: "POST",
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          id: prediction.id,
          event_title: prediction.eventTitle,
          currency: prediction.currency,
          event_date: prediction.eventDate || null,
          forecast: prediction.forecast,
          previous: prediction.previous,
          actual: prediction.actual,
          bias: prediction.bias,
          gold_impact: prediction.goldImpact,
          predicted_outcome: prediction.predictedOutcome,
          confidence: prediction.confidence,
          summary: prediction.summary,
          macro_analysis: prediction.macroAnalysis,
          trading_playbook: prediction.tradingPlaybook,
          model_name: prediction.modelName,
          updated_at: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn("Failed to persist prediction to Supabase:", err);
    }
  }

  // 2. Persist to local JSON storage
  const local = await readLocalPredictions();
  local[prediction.id] = prediction;
  await writeLocalPredictions(local);
}

export async function deletePrediction(id: string): Promise<void> {
  const cfg = getSupabaseConfig();
  if (cfg) {
    try {
      await fetch(`${cfg.url}/rest/v1/economic_predictions?id=eq.${id}`, {
        method: "DELETE",
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
        },
      });
    } catch (err) {
      console.warn("Failed to delete prediction from Supabase:", err);
    }
  }

  const local = await readLocalPredictions();
  delete local[id];
  await writeLocalPredictions(local);
}

/**
 * Get unified list of events with any existing Gemini predictions merged in
 */
export async function getEnrichedEconomicEvents(): Promise<EconomicCalendarEvent[]> {
  const [events, predictions] = await Promise.all([
    fetchLiveEconomicEvents(),
    getAllPredictions(),
  ]);

  return events.map((event) => {
    const pred = predictions[event.id] || null;
    return {
      ...event,
      prediction: pred,
    };
  });
}
