'use client';

/**
 * Share Ventures navigation — the brand-mock pattern (components.md §1):
 * official lockup left, two-line items distributed across the full width,
 * no boxed buttons in the bar, underline-draw hover, solid state after the
 * hero, full-screen black overlay menu on mobile.
 *
 * Usage (items render as two lines split on "\n"):
 *   <Nav items={[
 *     { href: '/labs', label: 'Innovation\nLabs' },
 *     { href: '/work', label: 'Work\nwith us' },
 *     { href: '/connect', label: 'Connect\nwith us' },
 *   ]} heroSelector=".sv-hero" />
 * The brand mark is the composed Wordmark component (currentColor — it
 * crossfades with the bar's ink; no logo files to copy). Pass `product` to
 * brand a product surface: <Nav product="OS" … /> → Share OS.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Wordmark from './Wordmark';

export type NavItem = { href: string; label: string };

export default function Nav({ items, heroSelector = '.sv-hero', product }: { items: NavItem[]; heroSelector?: string; product?: string }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>(heroSelector);
      const limit = (hero?.offsetHeight ?? 300) - 88;
      setSolid(scrollY > limit);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, [heroSelector, pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    (open ? closeRef.current : menuBtnRef.current)?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  const twoLines = (label: string) =>
    label.split('\n').map((l, i, a) => (
      <span key={i}>{l}{i < a.length - 1 && <br />}</span>
    ));

  return (
    <>
      <header className={`sv-nav sv-dark${solid ? ' is-solid' : ''}`}>
        <Link className="sv-nav__brand" href="/" aria-label="Share Ventures home">
          <Wordmark product={product} />
        </Link>
        <nav className="sv-nav__links" aria-label="Primary">
          {items.map(it => (
            <Link key={it.href} href={it.href} aria-current={pathname === it.href ? 'page' : undefined}>
              {twoLines(it.label)}
            </Link>
          ))}
        </nav>
        <button ref={menuBtnRef} className="sv-nav__menu-btn" aria-expanded={open} aria-controls="sv-menu"
          onClick={() => setOpen(true)}>
          Menu
          <svg width="22" height="10" viewBox="0 0 22 10" fill="none" aria-hidden="true">
            <path d="M0 1h22M0 9h22" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </header>

      <div className={`sv-menu${open ? ' is-open' : ''}`} id="sv-menu" role="dialog" aria-modal="true" aria-label="Menu">
        <button ref={closeRef} className="sv-menu__close" onClick={() => setOpen(false)}>
          Close
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <nav className="sv-menu__links" aria-label="Menu">
          {items.map((it, i) => (
            <Link key={it.href} href={it.href} style={{ ['--i' as string]: i }} onClick={() => setOpen(false)}>
              {it.label.replace('\n', ' ')}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
