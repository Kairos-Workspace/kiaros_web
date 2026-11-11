interface CoinIconProps {
  symbol: string;
  name?: string;
  size?: number;
  className?: string;
}

export function CoinIcon({ symbol, name, size = 28, className = "" }: CoinIconProps) {
  const s = (symbol || "").toLowerCase().trim();

  // Special emblem for Gold
  if (s === "xau" || s === "gold" || s === "xauusd") {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-amber-950 font-bold shadow-2xs ring-1 ring-amber-300/80 ${className}`}
        style={{ width: size, height: size }}
        title={name || "Gold (XAUUSD)"}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-amber-950"
          style={{ width: size * 0.55, height: size * 0.55 }}
        >
          <path d="M12 2L4.5 9L12 22L19.5 9L12 2ZM6.7 9L12 4.05L17.3 9H6.7ZM12 18.5L7.2 10.5H16.8L12 18.5Z" />
        </svg>
      </div>
    );
  }

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

