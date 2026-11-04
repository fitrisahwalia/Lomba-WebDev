import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geologica, Figtree, Plus_Jakarta_Sans, Instrument_Sans } from "next/font/google";
import "./globals.css";

const heading = Geologica({ subsets: ["latin"], variable: "--font-geologica", display: "swap" });
const sub = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const logo = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  title: "JalaLink",
  description: "Ikan segar langsung dari nelayan lokal",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${heading.variable} ${sub.variable} ${logo.variable} ${body.variable}`}>
      <body className="bg-white font-body text-ink antialiased">{children}</body>
    </html>
  );
}