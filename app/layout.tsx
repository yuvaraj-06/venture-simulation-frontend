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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
