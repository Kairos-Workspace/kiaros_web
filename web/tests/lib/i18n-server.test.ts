import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookieValue } = vi.hoisted(() => ({ cookieValue: { value: undefined as string | undefined } }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => cookieValue.value ? { value: cookieValue.value } : undefined }) }));

import { getLocale, getTranslations } from "@/lib/i18n/server";

beforeEach(() => { cookieValue.value = undefined; });

describe("server language", () => {
  it("uses the saved language for server-rendered content", async () => {
    cookieValue.value = "km";
    const { locale, t } = await getTranslations();
    expect(locale).toBe("km");
    expect(t("Sign In")).toBe("ចូលគណនី");
  });

  it("defaults missing or invalid cookies to English", async () => {
    expect(await getLocale()).toBe("en");
    cookieValue.value = "unsupported";
    expect(await getLocale()).toBe("en");
  });
});
