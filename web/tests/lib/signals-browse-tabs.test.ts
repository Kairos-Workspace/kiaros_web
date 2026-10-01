import { describe, expect, it } from "vitest";

import {
  comingSoonFilterOption,
  isComingSoonTab,
  parseSignalsBrowseTab,
  SIGNAL_FILTER_OPTIONS,
  ADMIN_SIGNAL_FILTER_OPTIONS,
} from "@/lib/signals-browse-tabs";

describe("parseSignalsBrowseTab", () => {
  it("accepts the live SMC lane", () => {
    expect(parseSignalsBrowseTab("smc")).toBe("smc");
  });

  it("keeps coming-soon strategy ids so the page can open them", () => {
    expect(parseSignalsBrowseTab("ict")).toBe("ict");
    expect(parseSignalsBrowseTab("supply-demand")).toBe("supply-demand");
    expect(parseSignalsBrowseTab("crt")).toBe("crt");
    expect(parseSignalsBrowseTab("msnr")).toBe("msnr");
  });

  it("falls back to all for unknown ids", () => {
    expect(parseSignalsBrowseTab("unknown")).toBe("all");
    expect(parseSignalsBrowseTab(undefined)).toBe("all");
  });
});

describe("coming soon strategies", () => {
  it("marks ICT, Supply Demand, CRT, and MSNR as coming soon but selectable", () => {
    for (const id of ["ict", "supply-demand", "crt", "msnr"] as const) {
      const opt = SIGNAL_FILTER_OPTIONS.find((o) => o.id === id);
      expect(opt).toBeDefined();
      expect(opt?.comingSoon).toBe(true);
      expect(opt?.disabled).toBeFalsy();
    }
  });

  it("identifies coming-soon tabs and looks up their labels", () => {
    expect(isComingSoonTab("ict")).toBe(true);
    expect(isComingSoonTab("smc")).toBe(false);
    expect(comingSoonFilterOption("crt")?.label).toBe("CRT");
    expect(comingSoonFilterOption("ai")).toBeUndefined();
  });
});

describe("SIGNAL_FILTER_OPTIONS", () => {
  it("lists SMC as a selectable strategy", () => {
    const smc = SIGNAL_FILTER_OPTIONS.find((o) => o.id === "smc");
    expect(smc).toBeDefined();
    expect(smc?.disabled).toBeFalsy();
    expect(smc?.comingSoon).toBeFalsy();
  });
});

describe("ADMIN_SIGNAL_FILTER_OPTIONS", () => {
  it("includes an SMC admin filter", () => {
    const smc = ADMIN_SIGNAL_FILTER_OPTIONS.find((o) => o.id === "smc");
    expect(smc).toBeDefined();
    expect(smc?.disabled).toBeFalsy();
  });
});
