import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "@/components/shared/Dropdown";
import { useState } from "react";

const OPTIONS = [
  { value: "opt1", label: "Option 1", hint: "H1" },
  { value: "opt2", label: "Option 2", hint: "H2" },
  { value: "opt3", label: "Option 3", hint: "H3", disabled: true },
];

function ControlledDropdown({
  initialValue = "opt1",
  disabled = false,
  size = "md" as const,
  align = "left" as const,
  fullWidth = false,
}) {
  const [val, setVal] = useState(initialValue);
  return (
    <div>
      <div data-testid="outside">Outside Element</div>
      <Dropdown
        value={val}
        onChange={setVal}
        options={OPTIONS}
        label="Test Select"
        disabled={disabled}
        size={size}
        align={align}
        fullWidth={fullWidth}
      />
    </div>
  );
}

describe("Dropdown component", () => {
  it("renders trigger with current selected value", () => {
    render(<ControlledDropdown initialValue="opt1" />);

    const trigger = screen.getByRole("button", { name: "Test Select" });
    expect(trigger).toBeTruthy();
    expect(trigger.textContent).toContain("Option 1");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("opens listbox on click and allows selecting an option", () => {
    render(<ControlledDropdown initialValue="opt1" />);

    const trigger = screen.getByRole("button", { name: "Test Select" });
    fireEvent.click(trigger);

    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeTruthy();

    const option2 = screen.getByRole("option", { name: /Option 2/ });
    fireEvent.click(option2);

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger.textContent).toContain("Option 2");
  });

  it("does not select disabled options", () => {
    render(<ControlledDropdown initialValue="opt1" />);

    const trigger = screen.getByRole("button", { name: "Test Select" });
    fireEvent.click(trigger);

    const option3 = screen.getByRole("option", { name: /Option 3/ });
    expect(option3.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(option3);
    // Menu stays or option not changed
    expect(trigger.textContent).toContain("Option 1");
  });

  it("supports keyboard navigation with arrow keys and Enter", () => {
    render(<ControlledDropdown initialValue="opt1" />);

    const trigger = screen.getByRole("button", { name: "Test Select" });
    // Open via down arrow
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeTruthy();

    // Move to Option 2
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    // Press Enter to select
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger.textContent).toContain("Option 2");
  });

  it("closes on Escape key", () => {
    render(<ControlledDropdown initialValue="opt1" />);

    const trigger = screen.getByRole("button", { name: "Test Select" });
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("closes on outside click", () => {
    render(<ControlledDropdown initialValue="opt1" />);

    const trigger = screen.getByRole("button", { name: "Test Select" });
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeTruthy();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("supports hidden input name for standard form submission", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Dropdown
        name="strategy"
        value="opt1"
        onChange={handleChange}
        options={OPTIONS}
        label="Strategy"
      />
    );

    const hiddenInput = container.querySelector('input[name="strategy"]') as HTMLInputElement;
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput.value).toBe("opt1");
  });

  it("renders in uncontrolled mode with defaultValue and updates hidden input when selecting", () => {
    const { container } = render(
      <Dropdown
        name="strategy"
        defaultValue="opt2"
        options={OPTIONS}
        label="Strategy"
      />
    );

    const trigger = screen.getByRole("button", { name: "Strategy" });
    expect(trigger.textContent).toContain("Option 2");

    const hiddenInput = container.querySelector('input[name="strategy"]') as HTMLInputElement;
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput.value).toBe("opt2");

    fireEvent.click(trigger);
    const option1 = screen.getByRole("option", { name: /Option 1/ });
    fireEvent.click(option1);

    expect(trigger.textContent).toContain("Option 1");
    expect(hiddenInput.value).toBe("opt1");
  });
});
