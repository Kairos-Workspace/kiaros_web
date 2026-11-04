import { getTranslations } from "@/lib/i18n/server";
import { T } from "@/components/i18n/T";
import Link from "next/link";

import { Footer } from "@/components/shared/Footer";
import { Nav } from "@/components/shared/Nav";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return {
    title: t("Page Not Found"),
    description: t("The page you are looking for does not exist."),
  };
}

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col bg-paper">
        <div className="page-container flex flex-1 flex-col items-center justify-center py-16 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate">
            404
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            <T>{"Page Not Found"}</T>
          </h1>
          <p className="mt-3 max-w-md text-base leading-relaxed text-slate">
            <T>{"The page you are looking for could not be found or has been relocated. Return to the home terminal or explore live signals."}</T>
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="btn-primary">
              <T>{"Back to Home"}</T>
            </Link>
            <Link href="/signals" className="btn-secondary">
              <T>{"Explore Signals"}</T>
            </Link>
            <Link href="/tools" className="btn-ghost text-sm font-semibold text-slate hover:text-ink">
              <T>{"Tools & EAs"}</T>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
