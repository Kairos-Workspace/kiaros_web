import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";

const notoSansKhmer = localFont({
  src: [
    {
      path: "../fonts/NotoSansKhmer-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/NotoSansKhmer-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/NotoSansKhmer-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/NotoSansKhmer-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/NotoSansKhmer-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-khmer",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  applicationName: "Kiaros Quant Terminal",
  title: {
    default: "Kiaros — Institutional AI Trading Signals & Quant Intelligence",
    template: "%s — Kiaros",
  },
  description:
    "Institutional-grade signal architecture across Crypto, Gold (XAUUSD), and Forex — validated by neural models and algorithmic execution (SMC, ICT, BBMA) with zero repaint.",
  creator: "Kiaros",
  publisher: "Kiaros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ colorScheme: "light" }}
      className={`${notoSansKhmer.variable} ${jetbrains.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.classList.remove("dark");localStorage.setItem("theme","light");}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink selection:bg-black selection:text-white transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
