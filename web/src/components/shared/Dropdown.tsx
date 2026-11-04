"use client";

import {
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface DropdownProps<T extends string = string> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  options: DropdownOption<T>[];
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  icon?: ReactNode;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
  fullWidth?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  ariaBusy?: boolean;
}

const sizeStyles = {
  sm: {
    trigger: "min-h-8 px-2.5 py-1.5 text-xs gap-1.5 rounded-lg",
    icon: "h-3.5 w-3.5",
    option: "px-2.5 py-1.5 text-xs",
  },
  md: {
    trigger: "min-h-9 px-3 py-2 text-sm gap-2 rounded-lg",
    icon: "h-4 w-4",
    option: "px-3 py-2 text-sm",
  },
  lg: {
    trigger: "min-h-11 px-4 py-2.5 text-base gap-2.5 rounded-xl",
    icon: "h-5 w-5",
    option: "px-3.5 py-2.5 text-sm",
  },
};

export function Dropdown<T extends string = string>({
  value: controlledValue,
  defaultValue,
  onChange,
  options,
  id: explicitId,
  name,
  label,
  placeholder,
  icon,
  disabled = false,
  size = "md",
  align = "left",
  fullWidth = false,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  ariaBusy,
}: DropdownProps<T>) {
  const generatedId = useId();
  const selectId = explicitId ?? generatedId;
  const listboxId = `${selectId}-listbox`;

  const [uncontrolledValue, setUncontrolledValue] = useState<T>(() => {
    return (defaultValue ?? options[0]?.value) as T;
  });

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const currentOption = options.find((opt) => opt.value === value);

  // Close when clicking outside or pressing Escape on document
  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  function openMenu() {
    const idx = options.findIndex((opt) => opt.value === value);
    setHighlightedIndex(idx >= 0 ? idx : 0);
    setIsOpen(true);
  }

  function toggleMenu() {
    setIsOpen((prev) => {
      if (!prev) {
        const idx = options.findIndex((opt) => opt.value === value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
        return true;
      }
      return false;
    });
  }

  function selectOption(opt: DropdownOption<T>) {
    if (opt.disabled) return;
    if (controlledValue === undefined) {
      setUncontrolledValue(opt.value);
    }
    onChange?.(opt.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (disabled) return;

    if (!isOpen) {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev + 1;
          while (next < options.length && options[next].disabled) {
            next++;
          }
          return next < options.length ? next : prev;
        });
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && options[next].disabled) {
            next--;
          }
          return next >= 0 ? next : prev;
        });
        break;
      }
      case "Home": {
        event.preventDefault();
        const first = options.findIndex((opt) => !opt.disabled);
        if (first >= 0) setHighlightedIndex(first);
        break;
      }
      case "End": {
        event.preventDefault();
        for (let i = options.length - 1; i >= 0; i--) {
          if (!options[i].disabled) {
            setHighlightedIndex(i);
            break;
          }
        }
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          selectOption(options[highlightedIndex]);
        }
        break;
      }
      case "Tab": {
        setIsOpen(false);
        break;
      }
    }
  }

  const currentSize = sizeStyles[size];
  const alignClass = align === "right" ? "right-0" : "left-0";

  return (
    <div
      ref={rootRef}
      className={`relative ${fullWidth ? "w-full" : "inline-block"} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for standard HTML form submissions if name is provided */}
      {name && (
        <input
          type="hidden"
          id={selectId}
          name={name}
          value={value}
        />
      )}

      {/* Custom Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={label}
        aria-busy={ariaBusy}
        onClick={toggleMenu}
        className={`inline-flex items-center justify-between font-semibold border border-zinc-200 bg-white text-zinc-700 shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 active:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed ${
          fullWidth ? "w-full" : ""
        } ${currentSize.trigger} ${triggerClassName}`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {icon ? (
            <span className="shrink-0 text-zinc-500">{icon}</span>
          ) : currentOption?.icon ? (
            <span className="shrink-0 text-zinc-500">{currentOption.icon}</span>
          ) : null}
          <span className="truncate">
            {currentOption ? currentOption.label : placeholder ?? ""}
          </span>
        </span>

        <svg
          className={`shrink-0 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-zinc-700" : ""
          } ${currentSize.icon}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Floating Custom Dropdown Menu */}
      {isOpen && !disabled && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          className={`absolute ${alignClass} z-50 mt-1.5 min-w-[9.5rem] overflow-hidden rounded-xl border border-zinc-200/90 bg-white/95 p-1 shadow-lg backdrop-blur-md transition-all duration-150 animate-in fade-in-50 zoom-in-95 ${
            fullWidth ? "w-full min-w-full" : ""
          } ${menuClassName}`}
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isHighlighted = highlightedIndex === index;

            if (opt.disabled) {
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-disabled="true"
                  aria-selected={false}
                  className={`flex items-center justify-between gap-2 rounded-lg opacity-40 cursor-not-allowed text-zinc-400 ${currentSize.option}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.hint && (
                    <span className="text-[10px] font-mono">{opt.hint}</span>
                  )}
                </li>
              );
            }

            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOption(opt)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`group flex items-center justify-between gap-2.5 rounded-lg cursor-pointer transition-colors text-left ${
                  currentSize.option
                } ${
                  isSelected
                    ? "bg-zinc-100 font-bold text-zinc-950"
                    : isHighlighted
                    ? "bg-zinc-50 text-zinc-950"
                    : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                } ${opt.className ?? ""}`}
              >
                <span className="flex items-center gap-2 truncate">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </span>

                <span className="flex items-center gap-1.5 shrink-0">
                  {opt.hint && (
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected ? "text-zinc-500 font-semibold" : "text-zinc-400"
                      }`}
                    >
                      {opt.hint}
                    </span>
                  )}

                  {isSelected && (
                    <svg
                      className="h-3.5 w-3.5 text-zinc-950 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
