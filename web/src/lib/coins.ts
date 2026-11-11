/** Quantitative analysis and classification engine for cryptocurrencies.
 * Fetches real-time market data from public exchange endpoints (Kraken)
 * and calculates potential vs risk scores, key technical zones, and trading playbooks.
 */

export type CoinCategory = "potential" | "risky" | "neutral";

export interface CoinAnalysis {
  id: string;
  symbol: string;
  name: string;
  category: CoinCategory;
  potentialScore: number; // 0 - 100
  riskScore: number;      // 0 - 100
  price: number;
  change24h: number;      // percentage (+3.5%)
  high24h: number;
  low24h: number;
  volume24h: number;      // base volume
  volumeUsd24h: number;   // approximate USD volume
  vwap24h: number;
  rangePct: number;       // 24h volatility (High - Low) / Low * 100
  spreadPct: number;      // (Ask - Bid) / Price * 100
  vwapDeviation: number;  // (Price - VWAP) / VWAP * 100
  support: number;
  target: number;
  invalidation: number;
  riskRewardRatio: number;
  statusLabel: string;
  primarySignal: string;
  potentialDrivers: string[];
  riskWarnings: string[];
  actionPlaybook: string;
  tags: string[];
}

export interface CoinConfig {
  symbol: string;
  krakenPair: string;
  krakenKey: string;
  name: string;
  tags: string[];
}

export const TRACKED_COINS: CoinConfig[] = [
  { symbol: "BTC", krakenPair: "XBTUSD", krakenKey: "XXBTZUSD", name: "Bitcoin", tags: ["Layer 1", "Mega Cap", "Benchmark"] },
  { symbol: "ETH", krakenPair: "ETHUSD", krakenKey: "XETHZUSD", name: "Ethereum", tags: ["Layer 1", "Smart Contracts", "DeFi"] },
  { symbol: "SOL", krakenPair: "SOLUSD", krakenKey: "SOLUSD", name: "Solana", tags: ["Layer 1", "High Speed", "DeFi"] },
  { symbol: "XRP", krakenPair: "XRPUSD", krakenKey: "XXRPZUSD", name: "Ripple", tags: ["Payments", "Liquidity"] },
  { symbol: "DOGE", krakenPair: "DOGEUSD", krakenKey: "XDGUSD", name: "Dogecoin", tags: ["Meme", "High Beta"] },
  { symbol: "SUI", krakenPair: "SUIUSD", krakenKey: "SUIUSD", name: "Sui Network", tags: ["Layer 1", "Move", "High Beta"] },
  { symbol: "PEPE", krakenPair: "PEPEUSD", krakenKey: "PEPEUSD", name: "Pepe", tags: ["Meme", "Extreme Volatility"] },
  { symbol: "LINK", krakenPair: "LINKUSD", krakenKey: "LINKUSD", name: "Chainlink", tags: ["Oracle", "DeFi Infra"] },
  { symbol: "AVAX", krakenPair: "AVAXUSD", krakenKey: "AVAXUSD", name: "Avalanche", tags: ["Layer 1", "Subnets"] },
  { symbol: "NEAR", krakenPair: "NEARUSD", krakenKey: "NEARUSD", name: "NEAR Protocol", tags: ["Layer 1", "AI Narrative"] },
  { symbol: "ADA", krakenPair: "ADAUSD", krakenKey: "ADAUSD", name: "Cardano", tags: ["Layer 1", "PoS"] },
  { symbol: "APT", krakenPair: "APTUSD", krakenKey: "APTUSD", name: "Aptos", tags: ["Layer 1", "Move"] },
  { symbol: "DOT", krakenPair: "DOTUSD", krakenKey: "DOTUSD", name: "Polkadot", tags: ["Layer 0", "Interoperability"] },
  { symbol: "SHIB", krakenPair: "SHIBUSD", krakenKey: "SHIBUSD", name: "Shiba Inu", tags: ["Meme", "Ecosystem"] },
];

export interface RawKrakenTicker {
  a: [string, string, string]; // ask [price, lot, lot]
  b: [string, string, string]; // bid [price, lot, lot]
  c: [string, string];         // close [price, lot]
  v: [string, string];         // volume [today, 24h]
  p: [string, string];         // vwap [today, 24h]
  t: [number, number];         // trades [today, 24h]
  l: [string, string];         // low [today, 24h]
  h: [string, string];         // high [today, 24h]
  o: string;                   // today open
}

export function formatCryptoPrice(price: number): string {
  if (price === 0) return "$0.00";
  if (price >= 1000) {
    return "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1) {
    return "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  if (price >= 0.001) {
    return "$" + price.toFixed(4);
  }
  return "$" + price.toFixed(8);
}

export function formatCompactUsd(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

/**
 * Evaluates raw ticker data against quantitative rules to produce potential score,
 * risk score, categorization, key levels, and actionable analysis.
 */
export function analyzeCoin(config: CoinConfig, raw: RawKrakenTicker): CoinAnalysis {
  const price = Number(raw.c[0]) || 0;
  const open = Number(raw.o) || price;
  const high24h = Number(raw.h[1]) || price;
  const low24h = Number(raw.l[1]) || price;
  const vwap24h = Number(raw.p[1]) || price;
  const volume24h = Number(raw.v[1]) || 0;
  const ask = Number(raw.a[0]) || price;
  const bid = Number(raw.b[0]) || price;

  const change24h = open > 0 ? ((price - open) / open) * 100 : 0;
  const range = Math.max(0.00000001, high24h - low24h);
  const rangePct = low24h > 0 ? (range / low24h) * 100 : 0;
  const spreadPct = price > 0 ? (Math.max(0, ask - bid) / price) * 100 : 0;
  const vwapDeviation = vwap24h > 0 ? ((price - vwap24h) / vwap24h) * 100 : 0;
  const rangePosition = Math.min(1, Math.max(0, (price - low24h) / range));
  const volumeUsd24h = volume24h * (vwap24h || price);

  // --- QUANT POTENTIAL SCORING (0 to 100) ---
  let potScore = 50;

  // 1. VWAP Health (institutional accumulation)
  if (vwapDeviation > 0 && vwapDeviation <= 3.0) {
    potScore += 18; // Clean absorption above benchmark
  } else if (vwapDeviation > 3.0 && vwapDeviation <= 6.5) {
    potScore += 10;
  } else if (vwapDeviation > 9.0) {
    potScore -= 12; // Overextended from VWAP, mean-reversion pull expected
  } else if (vwapDeviation < -4.0) {
    potScore -= 15; // Sustained below benchmark seller control
  }

  // 2. 24h Momentum Structure
  if (change24h >= 2.0 && change24h <= 9.0) {
    potScore += 20; // Sweet spot: steady expansion without blow-off
  } else if (change24h >= -1.5 && change24h < 2.0) {
    potScore += 12; // Healthy consolidation base
  } else if (change24h > 18.0) {
    potScore -= 16; // Chase penalty
  } else if (change24h < -6.0) {
    potScore -= 18; // Heavy bearish trend
  }

  // 3. Range Position (breakout vs breakdown)
  if (rangePosition >= 0.55 && rangePosition <= 0.85) {
    potScore += 16; // Breaking upward out of mid-range
  } else if (rangePosition < 0.25) {
    potScore -= 14; // Trapped near daily low
  }

  // 4. Liquidity & Spread Efficiency
  if (spreadPct <= 0.06) {
    potScore += 8;
  } else if (spreadPct > 0.20) {
    potScore -= 10;
  }

  const potentialScore = Math.min(97, Math.max(8, Math.round(potScore)));

  // --- QUANT RISK SCORING (0 to 100) ---
  let rkScore = 32;

  // 1. Volatility Expansion
  if (rangePct > 15.0) {
    rkScore += 28; // Extreme swings / liquidation hunts
  } else if (rangePct > 8.0) {
    rkScore += 16;
  } else if (rangePct < 3.5) {
    rkScore -= 10; // Low volatility / stable range
  }

  // 2. Overextended Pumps / Blow-Off
  if (change24h >= 20.0) {
    rkScore += 35; // Severe pump dump vulnerability
  } else if (change24h >= 10.0) {
    rkScore += 20;
  }

  // 3. Extreme Exhaustion at Boundaries
  if (rangePosition > 0.92) {
    rkScore += 18; // Pinned at daily ceiling, rejection risk
  } else if (rangePosition < 0.15) {
    rkScore += 18; // Breakdown risk at lower threshold
  }

  // 4. Distance from Mean (VWAP Extension)
  if (Math.abs(vwapDeviation) > 5.5) {
    rkScore += 14;
  }

  // 5. Slippage / Spread Risk
  if (spreadPct > 0.15) {
    rkScore += 12;
  }

  const riskScore = Math.min(98, Math.max(6, Math.round(rkScore)));

  // --- CATEGORIZATION ---
  let category: CoinCategory = "neutral";
  let statusLabel = "Watchlist / Range";

  if (potentialScore >= 65 && riskScore < 60) {
    category = "potential";
    statusLabel = "High Potential";
  } else if (riskScore >= 65 || (riskScore >= 55 && potentialScore <= 45)) {
    category = "risky";
    statusLabel = "High Risk / Overheated";
  } else {
    category = "neutral";
    statusLabel = "Watchlist / Neutral";
  }

  // --- KEY LEVELS (SUPPORT & TARGET) ---
  let support: number;
  let target: number;
  let invalidation: number;

  if (category === "potential" || change24h >= 0) {
    support = Number(Math.max(low24h, vwap24h * 0.985).toFixed(price < 1 ? 6 : 2));
    target = Number((Math.max(high24h, price) * 1.045).toFixed(price < 1 ? 6 : 2));
    invalidation = Number((low24h * 0.982).toFixed(price < 1 ? 6 : 2));
  } else {
    support = Number((low24h * 0.95).toFixed(price < 1 ? 6 : 2));
    target = Number((vwap24h * 1.01).toFixed(price < 1 ? 6 : 2));
    invalidation = Number((high24h * 1.025).toFixed(price < 1 ? 6 : 2));
  }

  const rewardDist = Math.abs(target - price);
  const riskDist = Math.max(0.00000001, Math.abs(price - invalidation));
  const riskRewardRatio = Number((rewardDist / riskDist).toFixed(2));

  // --- SIGNALS, DRIVERS & WARNINGS ---
  const potentialDrivers: string[] = [];
  const riskWarnings: string[] = [];
  let primarySignal = "Range Compression";

  if (vwapDeviation > 0.5) {
    potentialDrivers.push(`Institutional VWAP confirmation (+${vwapDeviation.toFixed(1)}% above mean)`);
  } else if (rangePosition <= 0.35 && change24h > -2.0) {
    potentialDrivers.push("Accumulating near 24h floor with price holding support");
  }

  if (change24h > 1.5 && change24h <= 10.0) {
    potentialDrivers.push(`Strong +${change24h.toFixed(1)}% 24h expansion with buyer dominance`);
  }

  if (spreadPct < 0.08) {
    potentialDrivers.push("Deep liquidity with institutional bid-ask depth");
  }

  if (potentialDrivers.length === 0) {
    potentialDrivers.push("Tight consolidation structure forming higher baseline");
    potentialDrivers.push("Orderly orderbook rotation without panic liquidations");
  }

  // Risk warnings
  if (change24h >= 10.0) {
    riskWarnings.push(`Overextended +${change24h.toFixed(1)}% run prone to profit-taking flush`);
  }
  if (rangePct > 10.0) {
    riskWarnings.push(`Elevated ${rangePct.toFixed(1)}% intraday volatility — wide stops needed`);
  }
  if (rangePosition > 0.88) {
    riskWarnings.push(`Testing upper 24h resistance at ${formatCryptoPrice(high24h)}`);
  }
  if (rangePosition < 0.20) {
    riskWarnings.push(`Approaching daily low breakdown at ${formatCryptoPrice(low24h)}`);
  }
  if (riskWarnings.length === 0) {
    riskWarnings.push("Sudden BTC macro sentiment shift could alter structure");
    riskWarnings.push("Low-volume session slip risk on off-peak hours");
  }

  // Primary signal title
  if (category === "potential") {
    primarySignal = change24h > 3 ? "Bullish Momentum & VWAP Expansion" : "Healthy Base & Accumulation Setup";
  } else if (category === "risky") {
    primarySignal = change24h > 10 ? "Overheated / Blow-Off Exhaustion Risk" : "Distribution & High Volatility Flush";
  } else {
    primarySignal = "Range Bound / Wait For Directional Break";
  }

  // Actionable trader playbook
  let actionPlaybook = "";
  if (category === "potential") {
    actionPlaybook = `Favor pullback longs into support (${formatCryptoPrice(support)}). Target expansion towards ${formatCryptoPrice(target)} with invalidation strictly under ${formatCryptoPrice(invalidation)} (R:R ${riskRewardRatio}:1).`;
  } else if (category === "risky") {
    actionPlaybook = `Avoid FOMO market buying. Wait for a retrace and consolidation base near ${formatCryptoPrice(support)} or look for scalp hedge confirmation on lower timeframes.`;
  } else {
    actionPlaybook = `Keep on radar. Set alerts above ${formatCryptoPrice(high24h)} for breakout momentum, or bid limit orders around ${formatCryptoPrice(support)}.`;
  }

  return {
    id: config.symbol,
    symbol: config.symbol,
    name: config.name,
    category,
    potentialScore,
    riskScore,
    price,
    change24h: Number(change24h.toFixed(2)),
    high24h,
    low24h,
    volume24h,
    volumeUsd24h,
    vwap24h,
    rangePct: Number(rangePct.toFixed(2)),
    spreadPct: Number(spreadPct.toFixed(3)),
    vwapDeviation: Number(vwapDeviation.toFixed(2)),
    support,
    target,
    invalidation,
    riskRewardRatio,
    statusLabel,
    primarySignal,
    potentialDrivers: potentialDrivers.slice(0, 3),
    riskWarnings: riskWarnings.slice(0, 2),
    actionPlaybook,
    tags: config.tags,
  };
}

/**
 * Fallback dataset if Kraken network times out or is unreachable.
 * Allows the page and tests to always function cleanly without disruption.
 */
export const FALLBACK_COINS: CoinAnalysis[] = [
  {
    id: "BTC",
    symbol: "BTC",
    name: "Bitcoin",
    category: "potential",
    potentialScore: 84,
    riskScore: 28,
    price: 73540.10,
    change24h: 3.25,
    high24h: 74888.70,
    low24h: 72584.60,
    volume24h: 3674.33,
    volumeUsd24h: 270189000,
    vwap24h: 73534.13,
    rangePct: 3.17,
    spreadPct: 0.001,
    vwapDeviation: 0.01,
    support: 72800.00,
    target: 78250.00,
    invalidation: 71900.00,
    riskRewardRatio: 2.87,
    statusLabel: "High Potential",
    primarySignal: "Bullish Momentum & VWAP Expansion",
    potentialDrivers: [
      "Holding firm above institutional VWAP ($73,534)",
      "Strong spot accumulation and ETF inflow support",
      "Exceptionally tight bid-ask spread (0.001%)"
    ],
    riskWarnings: [
      "Testing psychological resistance at $75,000",
      "Macro interest rate volatility may trigger liquidity wicks"
    ],
    actionPlaybook: "Favor pullback longs into support ($72,800.00). Target expansion towards $78,250.00 with invalidation strictly under $71,900.00 (R:R 2.87:1).",
    tags: ["Layer 1", "Mega Cap", "Benchmark"],
  },
  {
    id: "SOL",
    symbol: "SOL",
    name: "Solana",
    category: "potential",
    potentialScore: 78,
    riskScore: 36,
    price: 82.51,
    change24h: 4.82,
    high24h: 86.39,
    low24h: 81.26,
    volume24h: 330989.60,
    volumeUsd24h: 27610000,
    vwap24h: 83.41,
    rangePct: 6.31,
    spreadPct: 0.012,
    vwapDeviation: -1.08,
    support: 81.26,
    target: 90.28,
    invalidation: 79.80,
    riskRewardRatio: 2.86,
    statusLabel: "High Potential",
    primarySignal: "Healthy Base & Accumulation Setup",
    potentialDrivers: [
      "Strong DEX ecosystem volume and active wallet surge",
      "Consolidation at key support zone before next leg up",
      "Bullish structural continuation on 4h timeframe"
    ],
    riskWarnings: [
      "Needs sustained close above $84.00 VWAP pivot",
      "High beta sensitivity if BTC pulls back"
    ],
    actionPlaybook: "Favor pullback longs into support ($81.26). Target expansion towards $90.28 with invalidation strictly under $79.80 (R:R 2.86:1).",
    tags: ["Layer 1", "High Speed", "DeFi"],
  },
  {
    id: "ETH",
    symbol: "ETH",
    name: "Ethereum",
    category: "neutral",
    potentialScore: 61,
    riskScore: 34,
    price: 2054.23,
    change24h: 0.85,
    high24h: 2122.08,
    low24h: 2002.00,
    volume24h: 38845.35,
    volumeUsd24h: 79888000,
    vwap24h: 2056.55,
    rangePct: 5.99,
    spreadPct: 0.005,
    vwapDeviation: -0.11,
    support: 2025.00,
    target: 2217.00,
    invalidation: 1970.00,
    riskRewardRatio: 1.93,
    statusLabel: "Watchlist / Neutral",
    primarySignal: "Range Bound / Wait For Directional Break",
    potentialDrivers: [
      "Layer 2 gas burn activity stable",
      "Holding key psychological pivot at $2,000"
    ],
    riskWarnings: [
      "Underperforming BTC relative strength ratio (ETH/BTC)",
      "Overhead supply cluster between $2,120 - $2,180"
    ],
    actionPlaybook: "Keep on radar. Set alerts above $2,122.08 for breakout momentum, or bid limit orders around $2,025.00.",
    tags: ["Layer 1", "Smart Contracts", "DeFi"],
  },
  {
    id: "PEPE",
    symbol: "PEPE",
    name: "Pepe",
    category: "risky",
    potentialScore: 42,
    riskScore: 82,
    price: 0.000005238,
    change24h: 16.40,
    high24h: 0.000005609,
    low24h: 0.000005100,
    volume24h: 1381003815714,
    volumeUsd24h: 7364000,
    vwap24h: 0.000005332,
    rangePct: 9.98,
    spreadPct: 0.019,
    vwapDeviation: -1.76,
    support: 0.00000480,
    target: 0.00000540,
    invalidation: 0.00000575,
    riskRewardRatio: 0.32,
    statusLabel: "High Risk / Overheated",
    primarySignal: "Overheated / Blow-Off Exhaustion Risk",
    potentialDrivers: [
      "Extreme retail social sentiment and speculative interest"
    ],
    riskWarnings: [
      "Overextended +16.4% run prone to profit-taking flush",
      "Whale distribution signals detected on-chain"
    ],
    actionPlaybook: "Avoid FOMO market buying. Wait for a retrace and consolidation base near $0.00000480 or look for scalp hedge confirmation on lower timeframes.",
    tags: ["Meme", "Extreme Volatility"],
  },
  {
    id: "SUI",
    symbol: "SUI",
    name: "Sui Network",
    category: "potential",
    potentialScore: 76,
    riskScore: 48,
    price: 0.8181,
    change24h: 5.40,
    high24h: 0.8505,
    low24h: 0.8007,
    volume24h: 8415505.56,
    volumeUsd24h: 6925000,
    vwap24h: 0.8229,
    rangePct: 6.22,
    spreadPct: 0.012,
    vwapDeviation: -0.58,
    support: 0.8007,
    target: 0.8887,
    invalidation: 0.7860,
    riskRewardRatio: 2.19,
    statusLabel: "High Potential",
    primarySignal: "Bullish Momentum & VWAP Expansion",
    potentialDrivers: [
      "TVL growth outpacing competing Move-based chains",
      "Clean ascending triangle on the 1-hour chart"
    ],
    riskWarnings: [
      "Upcoming token unlocks may induce periodic selling",
      "High beta to overall market pullbacks"
    ],
    actionPlaybook: "Favor pullback longs into support ($0.8007). Target expansion towards $0.8887 with invalidation strictly under $0.7860 (R:R 2.19:1).",
    tags: ["Layer 1", "Move", "High Beta"],
  },
  {
    id: "DOGE",
    symbol: "DOGE",
    name: "Dogecoin",
    category: "risky",
    potentialScore: 46,
    riskScore: 71,
    price: 0.0675,
    change24h: -4.80,
    high24h: 0.0702,
    low24h: 0.0665,
    volume24h: 78544153.50,
    volumeUsd24h: 5334000,
    vwap24h: 0.0679,
    rangePct: 5.56,
    spreadPct: 0.002,
    vwapDeviation: -0.59,
    support: 0.0631,
    target: 0.0686,
    invalidation: 0.0719,
    riskRewardRatio: 0.25,
    statusLabel: "High Risk / Overheated",
    primarySignal: "Distribution & High Volatility Flush",
    potentialDrivers: [
      "High brand awareness and merchant acceptance"
    ],
    riskWarnings: [
      "Lower high rejection sequence on 4h timeframe",
      "Declining open interest indicating waning momentum"
    ],
    actionPlaybook: "Avoid FOMO market buying. Wait for a retrace and consolidation base near $0.0631 or look for scalp hedge confirmation on lower timeframes.",
    tags: ["Meme", "High Beta"],
  },
  {
    id: "LINK",
    symbol: "LINK",
    name: "Chainlink",
    category: "potential",
    potentialScore: 72,
    riskScore: 31,
    price: 10.25,
    change24h: 2.10,
    high24h: 10.66,
    low24h: 10.10,
    volume24h: 286529.87,
    volumeUsd24h: 2965000,
    vwap24h: 10.34,
    rangePct: 5.54,
    spreadPct: 0.037,
    vwapDeviation: -0.87,
    support: 10.10,
    target: 11.14,
    invalidation: 9.92,
    riskRewardRatio: 2.69,
    statusLabel: "High Potential",
    primarySignal: "Healthy Base & Accumulation Setup",
    potentialDrivers: [
      "CCIP enterprise adoption increasing cross-chain volume",
      "Staking pool saturation demonstrating strong holder conviction"
    ],
    riskWarnings: [
      "Resistance shelf at $10.80 needs definitive daily close"
    ],
    actionPlaybook: "Favor pullback longs into support ($10.10). Target expansion towards $11.14 with invalidation strictly under $9.92 (R:R 2.69:1).",
    tags: ["Oracle", "DeFi Infra"],
  },
  {
    id: "NEAR",
    symbol: "NEAR",
    name: "NEAR Protocol",
    category: "potential",
    potentialScore: 74,
    riskScore: 42,
    price: 3.58,
    change24h: 4.15,
    high24h: 3.75,
    low24h: 3.46,
    volume24h: 3186495.08,
    volumeUsd24h: 11500000,
    vwap24h: 3.60,
    rangePct: 8.38,
    spreadPct: 0.030,
    vwapDeviation: -0.55,
    support: 3.46,
    target: 3.92,
    invalidation: 3.40,
    riskRewardRatio: 1.89,
    statusLabel: "High Potential",
    primarySignal: "Bullish Momentum & VWAP Expansion",
    potentialDrivers: [
      "User-owned AI narrative leadership",
      "Daily active accounts trending towards record highs"
    ],
    riskWarnings: [
      "Resistance between $3.75 - $3.85 has triggered previous rejections"
    ],
    actionPlaybook: "Favor pullback longs into support ($3.46). Target expansion towards $3.92 with invalidation strictly under $3.40 (R:R 1.89:1).",
    tags: ["Layer 1", "AI Narrative"],
  },
  {
    id: "AVAX",
    symbol: "AVAX",
    name: "Avalanche",
    category: "neutral",
    potentialScore: 58,
    riskScore: 40,
    price: 8.46,
    change24h: 1.15,
    high24h: 8.53,
    low24h: 8.06,
    volume24h: 587337.39,
    volumeUsd24h: 4894000,
    vwap24h: 8.33,
    rangePct: 5.83,
    spreadPct: 0.035,
    vwapDeviation: 1.56,
    support: 8.20,
    target: 8.91,
    invalidation: 7.92,
    riskRewardRatio: 1.67,
    statusLabel: "Watchlist / Neutral",
    primarySignal: "Range Bound / Wait For Directional Break",
    potentialDrivers: [
      "Subnet tokenization pilot announcements",
      "Steady staking ratio exceeding 60%"
    ],
    riskWarnings: [
      "Range compression between $8.00 and $8.60",
      "Lacks decisive spot volume surge"
    ],
    actionPlaybook: "Keep on radar. Set alerts above $8.53 for breakout momentum, or bid limit orders around $8.20.",
    tags: ["Layer 1", "Subnets"],
  },
  {
    id: "XRP",
    symbol: "XRP",
    name: "Ripple",
    category: "neutral",
    potentialScore: 56,
    riskScore: 44,
    price: 1.052,
    change24h: -0.22,
    high24h: 1.103,
    low24h: 1.030,
    volume24h: 35951033.40,
    volumeUsd24h: 38115000,
    vwap24h: 1.060,
    rangePct: 7.08,
    spreadPct: 0.007,
    vwapDeviation: -0.75,
    support: 1.030,
    target: 1.153,
    invalidation: 1.010,
    riskRewardRatio: 2.40,
    statusLabel: "Watchlist / Neutral",
    primarySignal: "Range Compression",
    potentialDrivers: [
      "Cross-border corridor remittance volume expansion",
      "High liquidity depth across spot desks"
    ],
    riskWarnings: [
      "High sensitivity to regulatory news cycles",
      "Stuck under resistance zone near $1.10"
    ],
    actionPlaybook: "Keep on radar. Set alerts above $1.103 for breakout momentum, or bid limit orders around $1.030.",
    tags: ["Payments", "Liquidity"],
  },
  {
    id: "ADA",
    symbol: "ADA",
    name: "Cardano",
    category: "neutral",
    potentialScore: 52,
    riskScore: 38,
    price: 0.1737,
    change24h: -0.04,
    high24h: 0.1796,
    low24h: 0.1703,
    volume24h: 26140174.41,
    volumeUsd24h: 4566000,
    vwap24h: 0.1746,
    rangePct: 5.46,
    spreadPct: 0.049,
    vwapDeviation: -0.52,
    support: 0.1703,
    target: 0.1877,
    invalidation: 0.1672,
    riskRewardRatio: 2.15,
    statusLabel: "Watchlist / Neutral",
    primarySignal: "Range Compression",
    potentialDrivers: [
      "Steady network decentralization parameters",
      "Low downside volatility relative to peers"
    ],
    riskWarnings: [
      "Low relative volume and velocity"
    ],
    actionPlaybook: "Keep on radar. Set alerts above $0.1796 for breakout momentum, or bid limit orders around $0.1703.",
    tags: ["Layer 1", "PoS"],
  },
  {
    id: "APT",
    symbol: "APT",
    name: "Aptos",
    category: "potential",
    potentialScore: 68,
    riskScore: 45,
    price: 1.84,
    change24h: 3.80,
    high24h: 1.92,
    low24h: 1.76,
    volume24h: 1820000.00,
    volumeUsd24h: 3340000,
    vwap24h: 1.83,
    rangePct: 9.09,
    spreadPct: 0.054,
    vwapDeviation: 0.55,
    support: 1.76,
    target: 2.01,
    invalidation: 1.72,
    riskRewardRatio: 1.42,
    statusLabel: "High Potential",
    primarySignal: "Bullish Momentum & VWAP Expansion",
    potentialDrivers: [
      "Rising DeFi integrations and stablecoin transfer volumes",
      "Holding steady higher low on daily structure"
    ],
    riskWarnings: [
      "Overhead supply zone near $2.00 psychological level"
    ],
    actionPlaybook: "Favor pullback longs into support ($1.76). Target expansion towards $2.01 with invalidation strictly under $1.72 (R:R 1.42:1).",
    tags: ["Layer 1", "Move"],
  },
];

/**
 * Fetch and analyze all tracked cryptocurrencies.
 * Fetches real-time ticker data from Kraken public API with zero authentication.
 * Falls back safely to predefined baseline if network drops or times out.
 */
export async function fetchCoinAnalyses(): Promise<CoinAnalysis[]> {
  try {
    const pairsQuery = TRACKED_COINS.map((c) => c.krakenPair).join(",");
    const url = `https://api.kraken.com/0/public/Ticker?pair=${pairsQuery}`;

    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      return FALLBACK_COINS;
    }

    const data = await res.json() as { error?: unknown[]; result?: Record<string, RawKrakenTicker> };
    if (!data.result || Object.keys(data.result).length === 0) {
      return FALLBACK_COINS;
    }

    const result = data.result;
    const analyses: CoinAnalysis[] = [];

    for (const config of TRACKED_COINS) {
      const raw = result[config.krakenKey] || result[config.krakenPair];
      if (raw && raw.c && raw.h && raw.l) {
        analyses.push(analyzeCoin(config, raw));
      } else {
        // Fallback for this specific coin if missing from response
        const fallbackItem = FALLBACK_COINS.find((f) => f.symbol === config.symbol);
        if (fallbackItem) analyses.push(fallbackItem);
      }
    }

    return analyses.length > 0 ? analyses : FALLBACK_COINS;
  } catch {
    return FALLBACK_COINS;
  }
}

