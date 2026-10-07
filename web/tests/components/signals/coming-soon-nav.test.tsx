import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SlidingPillNav } from "@/components/shared/SlidingPillNav";
import { SignalsBrowseFilter } from "@/components/signals/SignalsBrowseFilter";
import { SIGNAL_FILTER_OPTIONS } from "@/lib/signals-browse-tabs";

describe("coming-soon strategy navigation", () => {
  it("lets users open ICT from the session rail", () => {
    render(
      <SlidingPillNav
        ariaLabel="Sessions"
        activeId="all"
        options={SIGNAL_FILTER_OPTIONS}
        hrefFor={(id) => (id === "all" ? "/signals" : `/signals?tab=${id}`)}
      />,
    );

    const ict = screen.getByRole("link", { name: "ICT" });
    expect(ict.getAttribute("href")).toBe("/signals?tab=ict");
  });

  it("lets users open ICT from the session filter", () => {
    render(<SignalsBrowseFilter tab="all" basePath="/signals" showLabel={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Sessions" }));

    const ict = screen.getByRole("link", { name: /ICT/ });
    expect(ict.getAttribute("href")).toBe("/signals?tab=ict");
  });
});
