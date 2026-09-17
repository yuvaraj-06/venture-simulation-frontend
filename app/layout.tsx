import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShareOS Venture Simulation",
  description: "Dynamic venture simulation dashboard for ShareOS portfolio companies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Aeonik Pro is the licensed Share Ventures typeface (CoType WebFonts),
            self-hosted from /public/fonts. Arial is the only sanctioned
            fallback; never substitute a look-alike webfont. */}
        <link rel="preload" href="/fonts/aeonikpro-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/aeonikpro-medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/aeonikpro-bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" style={{ background: "#F1F4F5", color: "#000000" }}>
        {children}
      </body>
    </html>
  );
}
