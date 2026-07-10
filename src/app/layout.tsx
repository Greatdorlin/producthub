import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Roboto_Condensed, Source_Sans_3 } from "next/font/google";
import { siteConfig } from "@/lib/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  preload: false,
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  preload: false,
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: siteConfig.brandName,
  description: siteConfig.brandTagline,
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
    shortcut: "/icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${robotoCondensed.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--ld-color-background)] text-[var(--ld-color-text)]">
        {children}
      </body>
    </html>
  );
}
