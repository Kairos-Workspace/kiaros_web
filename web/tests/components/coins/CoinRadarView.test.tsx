import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CoinRadarView } from "@/components/coins/CoinRadarView";
import { FALLBACK_COINS } from "@/lib/coins";

describe("CoinRadarView", () => {
  it("renders the KPI strip, filter buttons, search input, and coin cards", () => {
    render(<CoinRadarView initialCoins={FALLBACK_COINS} />);

    // KPI cards
    expect(screen.getByText("🚀 Top Potential Pick")).toBeDefined();
    expect(screen.getByText("⚠️ Highest Risk Watch")).toBeDefined();
    expect(screen.getByText("Quant Radar Health")).toBeDefined();

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
});
