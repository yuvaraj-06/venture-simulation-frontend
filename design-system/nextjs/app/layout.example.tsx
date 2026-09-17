/**
 * Example app/layout.tsx for a Share Ventures Next.js site.
 * Copy into your project's app/ directory as layout.tsx and adjust paths.
 * See nextjs/README.md for full setup.
 */

import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/sv/Nav';
import Scene from '@/components/sv/Scene';
import RevealObserver from '@/components/sv/RevealObserver';

/* Aeonik Pro is supplied only through an authorized, licence-managed deployment source.
   The token stack already falls back to Arial, so this portable example deliberately
   has no local-font dependency. A covered production app may add its own localFont
   configuration pointing at its authorised deployment assets. */

export const metadata: Metadata = {
  title: 'Share Ventures™',
  description: 'A technology-enabled venture firm building companies at the intersection of AI and human performance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav items={[
          { href: '/labs', label: 'Innovation\nLabs' },
          { href: '/work', label: 'Work\nwith us' },
          { href: '/fund', label: 'Fund +\nFoundry' },
          { href: '/connect', label: 'Connect\nwith us' },
        ]} />
        {children}
        {/* Scene mode (optional, flagship sites): the companion persists
            across route changes because this layout never remounts. */}
        <Scene />
        <RevealObserver />
      </body>
    </html>
  );
}
