export type PageHeaderTheme = "gold" | "signals" | "calendar" | "tools";

export type ParticleTone = "white" | "primary" | "secondary";

export interface PageHeaderThemeConfig {
  badgeDotColor: string;
  orbA: string;
  orbB: string;
  orbC: string;
  particlePrimary: string;
  particleSecondary: string;
  ripple: string;
  line: string;
  accentText: string;
  glowRing: string;
}

export const PAGE_HEADER_THEMES: Record<PageHeaderTheme, PageHeaderThemeConfig> = {
  gold: {
    badgeDotColor: "bg-amber-400",
    orbA: "bg-amber-500/18",
    orbB: "bg-yellow-600/14",
    orbC: "bg-orange-500/10",
    particlePrimary: "245, 158, 11",
    particleSecondary: "251, 191, 36",
    ripple: "245, 158, 11",
    line: "255, 214, 140",
    accentText: "text-amber-300",
    glowRing: "from-amber-400/30 via-amber-500/10 to-transparent",
  },
  signals: {
    badgeDotColor: "bg-emerald-400",
    orbA: "bg-emerald-500/16",
    orbB: "bg-sky-500/12",
    orbC: "bg-rose-500/10",
    particlePrimary: "52, 211, 153",
    particleSecondary: "56, 189, 248",
    ripple: "52, 211, 153",
    line: "167, 243, 208",
    accentText: "text-emerald-300",
    glowRing: "from-emerald-400/30 via-sky-500/10 to-transparent",
  },
  calendar: {
    badgeDotColor: "bg-sky-400",
    orbA: "bg-sky-500/16",
    orbB: "bg-indigo-500/14",
    orbC: "bg-cyan-500/10",
    particlePrimary: "56, 189, 248",
    particleSecondary: "129, 140, 248",
    ripple: "56, 189, 248",
    line: "186, 230, 253",
    accentText: "text-sky-300",
    glowRing: "from-sky-400/30 via-indigo-500/10 to-transparent",
  },
  tools: {
    badgeDotColor: "bg-violet-400",
    orbA: "bg-violet-500/16",
    orbB: "bg-zinc-400/12",
    orbC: "bg-fuchsia-500/10",
    particlePrimary: "167, 139, 250",
    particleSecondary: "232, 121, 249",
    ripple: "167, 139, 250",
    line: "221, 214, 254",
    accentText: "text-violet-300",
    glowRing: "from-violet-400/30 via-fuchsia-500/10 to-transparent",
  },
};
