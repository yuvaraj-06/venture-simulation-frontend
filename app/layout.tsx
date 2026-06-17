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
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ background: "#F1F4F5", color: "#000000" }}>
        {children}
      </body>
    </html>
  );
}
