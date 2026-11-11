interface CoinIconProps {
  symbol: string;
  name?: string;
  size?: number;
  className?: string;
}

export function CoinIcon({ symbol, name, size = 28, className = "" }: CoinIconProps) {
  const s = (symbol || "").toLowerCase().trim();
  const src = `/coins/${s}.png`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200/80 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name || symbol}
        width={size}
        height={size}
        className="h-full w-full object-contain p-0.5"
        loading="lazy"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          if (target.parentElement) {
            target.parentElement.classList.add(
              "bg-zinc-800",
              "text-white",
              "font-mono",
              "font-black",
              "text-[9px]"
            );
            target.parentElement.innerText = symbol.slice(0, 3).toUpperCase();
          }
        }}
      />
    </div>
  );
}
