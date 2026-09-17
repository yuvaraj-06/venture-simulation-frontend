'use client';

/**
 * Activates the [data-reveal] scroll reveals (motion.md §3.2).
 * Mount once in app/layout.tsx. Server components stay in charge of
 * markup — any element with data-reveal (and optional style={{'--i': n}}
 * for stagger) reveals once at 20% visibility. Without JS the content
 * is simply visible (the CSS gates on html.sv-js).
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.classList.add('sv-js');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }), { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
