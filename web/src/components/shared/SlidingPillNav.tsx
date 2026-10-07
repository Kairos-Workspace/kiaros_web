"use client";

import Link from "next/link";

export type PillNavOption = {
  id: string;
  label: string;
  disabled?: boolean;
};

/** Flowbite-style tab bar with rounded-t tabs and border-b border-default. */
export function SlidingPillNav({
  options,
  activeId,
  hrefFor,
  ariaLabel,
  size = "md",
}: {
  options: PillNavOption[];
  activeId: string;
  hrefFor: (id: string) => string;
  ariaLabel: string;
  size?: "md" | "sm";
}) {
  const isSm = size === "sm";

  return (
    <ul
      aria-label={ariaLabel}
      className={`flex flex-wrap text-center border-b border-zinc-200 text-zinc-600 ${
        isSm ? "text-xs font-medium" : "text-sm font-medium"
      }`}
    >
      {options.map((opt) => {
        if (opt.disabled) {
          return (
            <li key={opt.id} className="me-2">
              <span
                aria-disabled="true"
                className={`inline-block ${
                  isSm ? "px-3 py-2.5" : "p-4"
                } text-zinc-400 rounded-t-lg cursor-not-allowed`}
              >
                {opt.label}
              </span>
            </li>
          );
        }

        const active = opt.id === activeId;

        return (
          <li key={opt.id} className="me-2">
            <Link
              href={hrefFor(opt.id)}
              aria-current={active ? "page" : undefined}
              className={`inline-block ${
                isSm ? "px-3.5 py-2.5" : "p-4"
              } rounded-t-lg transition-colors ${
                active
                  ? "text-white bg-zinc-950 font-bold shadow-xs active"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
            >
              {opt.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
