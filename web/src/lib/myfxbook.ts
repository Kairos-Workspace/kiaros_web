/**
 * Myfxbook public API helpers (sentiment / community outlook).
 * Docs: https://www.myfxbook.com/api
 */

export type MyfxbookSymbolOutlook = {
  name: string;
  shortPercentage: number;
  longPercentage: number;
  shortVolume: number;
  longVolume: number;
  longPositions: number;
  shortPositions: number;
  totalPositions: number;
  avgShortPrice: number;
  avgLongPrice: number;
};

type LoginResponse = {
  error?: boolean;
  message?: string;
  session?: string;
};

type OutlookResponse = {
  error?: boolean;
  message?: string;
  symbols?: Array<Record<string, unknown>>;
};

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function isMyfxbookConfigured(): boolean {
  return Boolean(
    process.env.MYFXBOOK_EMAIL?.trim() && process.env.MYFXBOOK_PASSWORD?.trim(),
  );
}

async function myfxbookLogin(): Promise<string> {
  const email = process.env.MYFXBOOK_EMAIL?.trim();
  const password = process.env.MYFXBOOK_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error("MYFXBOOK_EMAIL / MYFXBOOK_PASSWORD not configured");
  }

  const url = new URL("https://www.myfxbook.com/api/login.json");
  url.searchParams.set("email", email);
  url.searchParams.set("password", password);

  const res = await fetch(url.toString(), {
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    throw new Error(`Myfxbook login HTTP ${res.status}`);
  }

  const data = (await res.json()) as LoginResponse;
  if (data.error) {
    throw new Error(data.message || "Myfxbook login failed");
  }
  if (!data.session) {
    throw new Error("Myfxbook login returned no session");
  }
  return data.session;
}

async function myfxbookLogout(session: string): Promise<void> {
  try {
    const url = new URL("https://www.myfxbook.com/api/logout.json");
    url.searchParams.set("session", session);
    await fetch(url.toString(), {
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    // best-effort
  }
}

function parseSymbol(row: Record<string, unknown>): MyfxbookSymbolOutlook {
  return {
    name: String(row.name ?? "").toUpperCase(),
    shortPercentage: num(row.shortPercentage),
    longPercentage: num(row.longPercentage),
    shortVolume: num(row.shortVolume),
    longVolume: num(row.longVolume),
    longPositions: num(row.longPositions),
    shortPositions: num(row.shortPositions),
    totalPositions: num(row.totalPositions),
    avgShortPrice: num(row.avgShortPrice),
    avgLongPrice: num(row.avgLongPrice),
  };
}

/** Community long/short outlook for a symbol (default XAUUSD). */
export async function fetchMyfxbookOutlook(
  symbol = "XAUUSD",
): Promise<MyfxbookSymbolOutlook | null> {
  if (!isMyfxbookConfigured()) return null;

  const session = await myfxbookLogin();
  try {
    const url = new URL("https://www.myfxbook.com/api/get-community-outlook.json");
    url.searchParams.set("session", session);

    const res = await fetch(url.toString(), {
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      throw new Error(`Myfxbook outlook HTTP ${res.status}`);
    }

    const data = (await res.json()) as OutlookResponse;
    if (data.error) {
      throw new Error(data.message || "Myfxbook outlook failed");
    }

    const target = symbol.toUpperCase();
    const match = (data.symbols ?? [])
      .map(parseSymbol)
      .find((s) => s.name === target || s.name.includes(target.replace("USD", "")));

    return match ?? null;
  } finally {
    await myfxbookLogout(session);
  }
}
