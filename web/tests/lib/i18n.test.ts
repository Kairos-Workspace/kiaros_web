import { describe, expect, it } from "vitest";
import { resolveLocale } from "@/lib/i18n/config";
import { createTranslator, translate } from "@/lib/i18n/translate";
import { formatDateTime, formatRelativeTime } from "@/lib/format";

describe("translations", () => {
  it("accepts supported locales and safely defaults unsupported cookie values to English", () => {
    expect(resolveLocale("km")).toBe("km");
    expect(resolveLocale("en")).toBe("en");
    expect(resolveLocale("fr")).toBe("en");
    expect(resolveLocale(undefined)).toBe("en");
  });

  it("translates across domains and preserves unknown market data and English", () => {
    expect(translate("km", "Live Signals")).toBe("សញ្ញាជួញដូរផ្ទាល់");
    expect(translate("km", "XAUUSD 2,648.80")).toBe("XAUUSD 2,648.80");
    expect(translate("km", "constructor")).toBe("constructor");
    expect(translate("km", "__proto__")).toBe("__proto__");
    expect(translate("en", "Live Signals")).toBe("Live Signals");
    expect(translate("km", "  Economic\n Calendar  ")).toBe("  ប្រតិទិនសេដ្ឋកិច្ច  ");
  });

  it("interpolates complete messages without treating replacement values as translation keys", () => {
    const t = createTranslator("km");
    const email = "trader@example.com";
    expect(t("Admin access is not enabled for {email}. Ask the owner to add your email to ADMIN_EMAILS, then sign out and back in.", { email })).toContain(email);
    expect(translate("en", "{count} trades", { count: 12 })).toBe("12 trades");
    expect(translate("en", "{unknown}", {})).toBe("{unknown}");
  });

  it("formats relative times in Khmer while retaining existing English behavior", () => {
    const now = new Date("2026-11-04T10:00:00Z");
    expect(formatRelativeTime("2026-11-04T08:00:00Z", now, "km")).toBe("2 ម៉ោងមុន");
    expect(formatRelativeTime("2026-11-04T08:00:00Z", now)).toBe("2h ago");
    expect(formatDateTime(null, "km")).toBe("មិនធ្លាប់មាន");
  });
});
