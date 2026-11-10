import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { getTranslations } from "@/lib/i18n/server";

import "./globals.css";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    applicationName: "Kiaros Quant Terminal",
    title: {
      default: t("Kiaros — Institutional AI Trading Signals & Quant Intelligence"),
      template: "%s — Kiaros",
    },
    description:
      t("Institutional-grade signal architecture across Crypto, Gold (XAUUSD), and Forex — validated by neural models and algorithmic execution (SMC, ICT, BBMA) with zero repaint."),
    creator: "Kiaros",
    publisher: "Kiaros",
    // Temporarily hide the undecided logo; original icons are preserved in src/assets/brand-pending.
    icons: {
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3C/svg%3E",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale } = await getTranslations();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      style={{ colorScheme: "light" }}
      className={`${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.classList.remove("dark");localStorage.setItem("theme","light");}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink selection:bg-black selection:text-white transition-colors duration-200">
        <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
