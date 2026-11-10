import Image from "next/image";
import type { PageHeaderTheme } from "@/components/shared/page-header-themes";

interface HeaderIllustrationProps {
  theme: PageHeaderTheme;
}

export function HeaderIllustration({ theme }: HeaderIllustrationProps) {
  const isGold = theme === "gold";
  const isTools = theme === "tools";

  return (
    <div className="relative mx-auto w-full">
      <div
        className="pointer-events-none absolute inset-0 rounded-full opacity-70 blur-2xl sm:opacity-80"
        style={{
          backgroundImage:
            theme === "gold"
              ? "radial-gradient(circle at 40% 40%, rgba(245,158,11,0.35), transparent 65%)"
              : theme === "signals"
                ? "radial-gradient(circle at 40% 40%, rgba(52,211,153,0.3), transparent 65%)"
                : theme === "calendar"
                  ? "radial-gradient(circle at 40% 40%, rgba(56,189,248,0.3), transparent 65%)"
                  : "radial-gradient(circle at 40% 40%, rgba(167,139,250,0.3), transparent 65%)",
        }}
        aria-hidden
      />
      <div
        className={`relative mx-auto w-full ${
          isGold
            ? "aspect-[3/2] max-w-[420px]"
            : isTools
              ? "aspect-square max-w-[200px] sm:max-w-[240px] md:max-w-[280px]"
              : "aspect-square max-w-[280px] sm:max-w-[320px]"
        }`}
      >
        {theme === "gold" ? <GoldMark /> : null}
        {theme === "signals" ? <SignalsMark /> : null}
        {theme === "calendar" ? <CalendarMark /> : null}
        {theme === "tools" ? <ToolsMark /> : null}
      </div>
    </div>
  );
}

function GoldMark() {
  return (
    <div className="header-float relative h-full w-full">
      <Image
        src="/assets/headers/gold-candles.png"
        alt=""
        fill
        sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 420px"
        className="object-contain"
        priority
      />
    </div>
  );
}

function SignalsMark() {
  return (
    <svg viewBox="0 0 320 320" className="h-full w-full" aria-hidden>
      <circle cx="160" cy="160" r="118" fill="none" stroke="rgba(52,211,153,0.18)" strokeWidth="1.5" />
      <circle cx="160" cy="160" r="96" fill="rgba(9,9,11,0.55)" stroke="rgba(52,211,153,0.25)" strokeWidth="1" />
      <g className="header-float">
        <line x1="100" y1="120" x2="100" y2="210" stroke="#34D399" strokeWidth="2" />
        <rect x="90" y="140" width="20" height="48" rx="2" fill="#059669" />
        <line x1="140" y1="100" x2="140" y2="200" stroke="#F43F5E" strokeWidth="2" />
        <rect x="130" y="118" width="20" height="56" rx="2" fill="#BE123C" />
        <line x1="180" y1="130" x2="180" y2="220" stroke="#34D399" strokeWidth="2" />
        <rect x="170" y="150" width="20" height="44" rx="2" fill="#059669" />
        <line x1="220" y1="110" x2="220" y2="190" stroke="#38BDF8" strokeWidth="2" />
        <rect x="210" y="128" width="20" height="40" rx="2" fill="#0284C7" />
      </g>
      <circle cx="160" cy="160" r="28" fill="none" stroke="rgba(52,211,153,0.45)" strokeWidth="2" className="header-pulse" style={{ transformOrigin: "160px 160px" }} />
      <circle cx="160" cy="160" r="8" fill="#34D399" />
      <text x="160" y="262" textAnchor="middle" fill="#A7F3D0" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="700">
        LIVE SIGNAL
      </text>
    </svg>
  );
}

function CalendarMark() {
  return (
    <svg viewBox="0 0 320 320" className="h-full w-full" aria-hidden>
      <circle cx="160" cy="160" r="118" fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth="1.5" />
      <g className="header-float-slow">
        <rect x="78" y="88" width="164" height="150" rx="16" fill="rgba(9,9,11,0.75)" stroke="rgba(125,211,252,0.35)" strokeWidth="1.5" />
        <rect x="78" y="88" width="164" height="36" rx="16" fill="#0EA5E9" />
        <rect x="78" y="110" width="164" height="14" fill="#0EA5E9" />
        <circle cx="108" cy="106" r="5" fill="#E0F2FE" />
        <circle cx="212" cy="106" r="5" fill="#E0F2FE" />
        <circle cx="112" cy="156" r="7" fill="#38BDF8" className="header-pulse" />
        <circle cx="148" cy="156" r="7" fill="rgba(148,163,184,0.45)" />
        <circle cx="184" cy="156" r="7" fill="#F59E0B" />
        <circle cx="220" cy="156" r="7" fill="rgba(148,163,184,0.45)" />
        <circle cx="112" cy="192" r="7" fill="#F43F5E" className="header-pulse" />
        <circle cx="148" cy="192" r="7" fill="#38BDF8" />
        <circle cx="184" cy="192" r="7" fill="rgba(148,163,184,0.45)" />
        <circle cx="220" cy="192" r="7" fill="#A78BFA" />
      </g>
      <text x="160" y="268" textAnchor="middle" fill="#BAE6FD" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="700">
        MACRO / NFP · CPI
      </text>
    </svg>
  );
}

function ToolsMark() {
  return (
    <div className="header-float relative h-full w-full">
      <Image
        src="/assets/headers/mt5-logo.png"
        alt=""
        fill
        sizes="(max-width: 640px) 160px, (max-width: 1024px) 220px, 280px"
        className="object-contain"
        priority
      />
    </div>
  );
}
