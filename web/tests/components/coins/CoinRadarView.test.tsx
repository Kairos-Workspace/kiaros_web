import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CoinRadarView } from "@/components/coins/CoinRadarView";
import { FALLBACK_COINS } from "@/lib/coins";

describe("CoinRadarView", () => {
  it("renders the filter buttons, search input, and coin cards", () => {
    render(<CoinRadarView initialCoins={FALLBACK_COINS} />);

    // Filters
    expect(screen.getByRole("button", { name: /All Coins/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /High Potential/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /High Risk/i })).toBeDefined();

    // Coins present
    expect(screen.getAllByText("BTC").length).toBeGreaterThan(0);
    expect(screen.getAllByText("SOL").length).toBeGreaterThan(0);
  });

  it("filters cards when High Potential filter button is clicked", () => {
    render(<CoinRadarView initialCoins={FALLBACK_COINS} />);

    const potentialFilterBtn = screen.getByRole("button", { name: /High Potential/i });
    fireEvent.click(potentialFilterBtn);

    // BTC (high potential) is visible, PEPE price should not be in the grid
    expect(screen.getAllByText("Bitcoin").length).toBeGreaterThan(0);
    // PEPE's price "$0.00000524" was only on PEPE's card
    expect(screen.queryByText("$0.00000524")).toBeNull();
  });

  it("filters cards via search input", () => {
    render(<CoinRadarView initialCoins={FALLBACK_COINS} />);

    const searchInput = screen.getByPlaceholderText(/Search coin or tag.../i);
    fireEvent.change(searchInput, { target: { value: "Solana" } });

    expect(screen.getAllByText("Solana").length).toBeGreaterThan(0);
    expect(screen.getByText("SOL")).toBeDefined();
  });

  it("opens detail modal when clicking a coin card and closes it", () => {
    render(<CoinRadarView initialCoins={FALLBACK_COINS} />);

    const solCards = screen.getAllByText("Solana");
    const solCard = solCards[0].closest("div[class*='cursor-pointer']");
    expect(solCard).toBeDefined();

    if (solCard) {
      fireEvent.click(solCard);
      // Modal should now be open with detailed playbook and key levels
      expect(screen.getByText("Algorithmic Key Levels & Execution Plan")).toBeDefined();
      expect(screen.getByText("Trader Playbook Strategy")).toBeDefined();

      // Click close button
      const closeBtn = screen.getByRole("button", { name: /Close/i });
      fireEvent.click(closeBtn);

      // Modal closed
      expect(screen.queryByText("Algorithmic Key Levels & Execution Plan")).toBeNull();
    }
  });

  it("shows empty state when search query matches nothing", () => {
    render(<CoinRadarView initialCoins={FALLBACK_COINS} />);

    const searchInput = screen.getByPlaceholderText(/Search coin or tag.../i);
    fireEvent.change(searchInput, { target: { value: "XYZNONEXISTENT" } });

    expect(screen.getByText("No coins matched your search")).toBeDefined();

    // Reset filters button clears search
    const resetBtn = screen.getByRole("button", { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    expect(screen.getAllByText("Bitcoin").length).toBeGreaterThan(0);
  });

  it("handles pagination cleanly when coin list exceeds PAGE_SIZE (12)", () => {
    const manyCoins = Array.from({ length: 25 }, (_, i) => ({
      ...FALLBACK_COINS[0],
      id: `COIN_${i + 1}`,
      symbol: `SYM${i + 1}`,
      name: `TestCoin ${i + 1}`,
      potentialScore: 90 - i,
      category: (i % 2 === 0 ? "potential" : "risky") as "potential" | "risky",
    }));

    render(<CoinRadarView initialCoins={manyCoins} />);

    // Page 1 should show 1–12 of 25 coins
    expect(screen.getByText("1–12")).toBeDefined();
    expect(screen.getByText("25")).toBeDefined();
    expect(screen.getByText("TestCoin 1")).toBeDefined();
    expect(screen.getByText("TestCoin 12")).toBeDefined();
    expect(screen.queryByText("TestCoin 13")).toBeNull();

    // Previous button should be disabled on page 1
    const prevButton = screen.getByRole("button", { name: /Previous/i });
    expect(prevButton.hasAttribute("disabled")).toBe(true);

    // Click page 2 button
    const page2Btn = screen.getByRole("button", { name: "2" });
    fireEvent.click(page2Btn);

    // Page 2 should show 13–24
    expect(screen.getByText("13–24")).toBeDefined();
    expect(screen.queryByText("TestCoin 1")).toBeNull();
    expect(screen.getByText("TestCoin 13")).toBeDefined();
    expect(screen.getByText("TestCoin 24")).toBeDefined();
    expect(screen.queryByText("TestCoin 25")).toBeNull();

    // Click Next button to advance to page 3
    const nextButton = screen.getByRole("button", { name: /Next/i });
    expect(nextButton.hasAttribute("disabled")).toBe(false);
    fireEvent.click(nextButton);

    // Page 3 should show 25–25, and Next button should now be disabled
    expect(screen.getByText("25–25")).toBeDefined();
    expect(screen.getByText("TestCoin 25")).toBeDefined();
    expect(nextButton.hasAttribute("disabled")).toBe(true);

    // Switching filter resets page back to 1
    const potentialFilterBtn = screen.getByRole("button", { name: /High Potential/i });
    fireEvent.click(potentialFilterBtn);
    expect(screen.queryByText("25–25")).toBeNull();
  });
});
