"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

type Certificate = {
  id: string;
  src: string;
  title: string;
  issuer: string;
};

const CERTIFICATES: Certificate[] = [
  {
    id: "fundednext-elite",
    src: "/certificate/fundednext-elite-trader.jpg",
    title: "Elite Trader Certificate of Appreciation",
    issuer: "FundedNext",
  },
  {
    id: "fundingpips-phase2",
    src: "/certificate/fundingpips-phase2.jpg",
    title: "Phase Two Evaluation Passed",
    issuer: "FundingPips",
  },
  {
    id: "fundingpips-phase1",
    src: "/certificate/fundingpips-phase1.jpg",
    title: "Phase One Evaluation Passed",
    issuer: "FundingPips",
  },
  {
    id: "fundednext-stellar",
    src: "/certificate/fundednext-stellar-lite-phase1.jpg",
    title: "Stellar Lite 2-Step Challenge P1 | 5K",
    issuer: "FundedNext",
  },
  {
    id: "vprop-verification",
    src: "/certificate/vprop-trader-verification.jpg",
    title: "Passed Verification Evaluation Phase ($1,000)",
    issuer: "V Prop Trader",
  },
  {
    id: "hola-prime-sokunthanou",
    src: "/certificate/hola-prime-phase1-sokunthanou.jpg",
    title: "Phase 1 Evaluation Passed",
    issuer: "Hola Prime",
  },
  {
    id: "topstep-funded",
    src: "/certificate/certificate 6.jpeg",
    title: "Certified Funded Trader",
    issuer: "Topstep",
  },
  {
    id: "hola-funded",
    src: "/certificate/certificate 5.jpeg",
    title: "Funded Trader Live Account",
    issuer: "Hola Prime",
  },
  {
    id: "hola-phase1-jun2",
    src: "/certificate/certificate 1.jpeg",
    title: "Phase 1 Institutional Evaluation Passed",
    issuer: "Hola Prime",
  },
  {
    id: "hola-phase1-jun8",
    src: "/certificate/certificate 2.jpeg",
    title: "Phase 1 Institutional Evaluation Passed",
    issuer: "Hola Prime",
  },
  {
    id: "hola-phase1-jun16",
    src: "/certificate/certificate 3.jpeg",
    title: "Phase 1 Institutional Evaluation Passed",
    issuer: "Hola Prime",
  },
  {
    id: "hola-phase1-4",
    src: "/certificate/certificate 4.jpeg",
    title: "Prop Challenge High-Watermark Passed",
    issuer: "Hola Prime",
  },
];

export function Certificates() {
  const titleId = useId();
  const [active, setActive] = useState<Certificate | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  return (
    <section id="proof" className="relative border-b border-zinc-200/80 bg-white py-12 md:py-16">
      <div className="page-container">
        {/* Certificates Grid without borders, border-radius, hover transforms, or bottom info panels */}
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {CERTIFICATES.map((cert) => (
            <button
              key={cert.id}
              type="button"
              onClick={() => setActive(cert)}
              className="relative block w-full text-left cursor-pointer bg-zinc-100"
              aria-label={`View ${cert.issuer} — ${cert.title}`}
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={cert.src}
                  alt={`${cert.issuer}: ${cert.title}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Inspector Modal */}
      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-h-[94vh] w-full max-w-4xl overflow-hidden bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-zinc-100 px-5 py-4">
              <div>
                <p id={titleId} className="font-mono text-base font-bold text-zinc-950">
                  {active.issuer}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">{active.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="btn-secondary px-4 py-2 text-xs"
              >
                Close
              </button>
            </div>
            <div className="relative h-[72vh] sm:h-[78vh] w-full bg-zinc-100">
              <Image
                src={active.src}
                alt={`${active.issuer}: ${active.title}`}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-contain p-3"
                priority
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
