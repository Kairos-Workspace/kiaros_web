import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
import { T } from "@/components/i18n/T";
import { LOCALE_COOKIE } from "@/lib/i18n/config";

afterEach(() => {
  cleanup();
  document.cookie = `${LOCALE_COOKIE}=; Max-Age=0; Path=/`;
  document.documentElement.lang = "en";
  vi.clearAllMocks();
});

describe("site language", () => {
  it("switches all mounted text, saves the preference, and refreshes server content", () => {
    render(
      <LanguageProvider initialLocale="en">
        <LanguageSwitch />
        <span><T>Live Signals</T></span>
        <span><T>Economic Calendar</T></span>
      </LanguageProvider>
    );

    // Open dropdown
    fireEvent.click(screen.getByRole("button", { name: "Language" }));
    // Select Khmer
    fireEvent.click(screen.getByRole("option", { name: /ខ្មែរ/ }));

    expect(screen.getByText("សញ្ញាជួញដូរផ្ទាល់")).toBeTruthy();
    expect(screen.getByText("ប្រតិទិនសេដ្ឋកិច្ច")).toBeTruthy();
    expect(document.cookie).toContain(`${LOCALE_COOKIE}=km`);
    expect(document.documentElement.lang).toBe("km");
    expect(refresh).toHaveBeenCalledOnce();

    // Open dropdown again (Khmer label for "Language" is "ភាសា")
    fireEvent.click(screen.getByRole("button", { name: "ភាសា" }));
    // Select English
    fireEvent.click(screen.getByRole("option", { name: /English/ }));
    expect(screen.getByText("Live Signals")).toBeTruthy();
    expect(document.cookie).toContain(`${LOCALE_COOKIE}=en`);
    expect(document.documentElement.lang).toBe("en");
  });

  it("renders Khmer immediately from the server preference and keeps all switches in sync", () => {
    render(
      <LanguageProvider initialLocale="km">
        <LanguageSwitch />
        <LanguageSwitch />
        <T>Sign In</T>
      </LanguageProvider>
    );
    expect(screen.getByText("ចូលគណនី")).toBeTruthy();

    const switches = screen.getAllByRole("button", { name: "ភាសា" });
    expect(switches).toHaveLength(2);
    expect(switches[0].textContent).toContain("ខ្មែរ");
    expect(switches[1].textContent).toContain("ខ្មែរ");

    // Click the first switch to open and choose English
    fireEvent.click(switches[0]);
    fireEvent.click(screen.getByRole("option", { name: /English/ }));

    const updatedSwitches = screen.getAllByRole("button", { name: "Language" });
    expect(updatedSwitches[0].textContent).toContain("English");
    expect(updatedSwitches[1].textContent).toContain("English");
  });

  it("closes dropdown on Escape key or outside click", () => {
    render(
      <LanguageProvider initialLocale="en">
        <div data-testid="outside">Outside area</div>
        <LanguageSwitch />
      </LanguageProvider>
    );

    const trigger = screen.getByRole("button", { name: "Language" });
    expect(screen.queryByRole("listbox")).toBeNull();

    // Open
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeTruthy();

    // Close on Escape
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();

    // Open again
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeTruthy();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
