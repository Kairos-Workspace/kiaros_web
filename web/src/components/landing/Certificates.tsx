"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

type Certificate = {
  id: string;
  src: string;
  title: string;
  issuer: string;
  kind: "image" | "pdf";
  category: "funded" | "evaluation" | "document";
};

const CERTIFICATES: Certificate[] = [
  {
    id: "hola-funded",
    src: "/certificate/certificate 5.jpeg",
    title: "Funded Trader Live Account",
    issuer: "Hola Prime",
    kind: "image",
    category: "funded",
  },
  {
    id: "hola-phase1-jun2",
    src: "/certificate/certificate 1.jpeg",
    title: "Phase 1 Institutional Evaluation Passed",
    issuer: "Hola Prime",
    kind: "image",
    category: "evaluation",
  },
  {
    id: "hola-phase1-jun8",
    src: "/certificate/certificate 2.jpeg",
    title: "Phase 1 Institutional Evaluation Passed",
    issuer: "Hola Prime",
    kind: "image",
    category: "evaluation",
  },
  {
    id: "hola-phase1-jun16",
    src: "/certificate/certificate 3.jpeg",
    title: "Phase 1 Institutional Evaluation Passed",
    issuer: "Hola Prime",
    kind: "image",
    category: "evaluation",
  },
  {
    id: "hola-phase1-4",
    src: "/certificate/certificate 4.jpeg",
    title: "Prop Challenge High-Watermark Passed",
    issuer: "Hola Prime",
    kind: "image",
    category: "evaluation",
  },
  {
    id: "virakyuth-pdf",
    src: "/certificate/Certificate for  Virakyuth Srun.pdf",
    title: "Institutional Completion Certificate",
    issuer: "Virakyuth Srun",
    kind: "pdf",
    category: "document",
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
        {/* Certificates Grid */}
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3">
          {CERTIFICATES.map((cert) =>
            cert.kind === "pdf" ? (
              <a
                key={cert.id}
                href={cert.src}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-zinc-400 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                      PDF AUDIT
                    </span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Verified
                    </span>
                  </div>
                  <p className="mt-5 text-base font-bold text-zinc-950 group-hover:text-black transition-colors">
                    {cert.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{cert.issuer}</p>
                </div>
                <div className="mt-8 flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-900 group-hover:text-black transition-colors">
                  <span>View PDF Document</span>
                  <span>→</span>
                </div>
              </a>
            ) : (
              <button
                key={cert.id}
                type="button"
                onClick={() => setActive(cert)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2.5 text-left shadow-sm transition-all duration-300 hover:border-zinc-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                aria-label={`View ${cert.issuer} — ${cert.title}`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100">
                  <Image
                    src={cert.src}
                    alt={`${cert.issuer}: ${cert.title}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 right-2.5 rounded-full bg-emerald-700 px-2.5 py-0.5 font-mono text-[10px] font-black text-white shadow-sm">
                    VERIFIED PASS ✓
                  </div>
                </div>
                <div className="mt-3 p-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-900">{cert.issuer}</span>
                    <span className="font-mono text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Live Verified
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{cert.title}</p>
                </div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Fullscreen Inspector Modal */}
      {active && active.kind === "image" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-zinc-100 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <p id={titleId} className="font-mono text-base font-bold text-zinc-950">
                    {active.issuer}
                  </p>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-800 border border-emerald-300">
                    AUDIT PASS CONFIRMED
                  </span>
                </div>
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
            <div className="relative aspect-[4/3] w-full bg-zinc-100">
              <Image
                src={active.src}
                alt={`${active.issuer}: ${active.title}`}
                fill
                sizes="896px"
                className="object-contain p-2"
                priority
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
