'use client';

/**
 * Stat block with count-up on first reveal (components.md §7, motion.md §4).
 * Numbers must be real — never invent metrics.
 *
 *   <div className="sv-stats">
 *     <Stat value={213} label={'New\ncompanies'} />
 *     <Stat value={17} suffix="m" label="Raised" />
 *   </div>
 */

import { useEffect, useRef, useState } from 'react';

export default function Stat({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState('0');
  const done = useRef(false);

  useEffect(() => {
    const nf = new Intl.NumberFormat('en-US');
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(nf.format(value)); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting || done.current) return;
      done.current = true; io.unobserve(el);
      const t0 = performance.now(), dur = 600;
      const tick = (t: number) => {
        const p = Math.min((t - t0) / dur, 1);
        setShown(nf.format(Math.round(value * (1 - Math.pow(2, -10 * p)))));
        if (p < 1) requestAnimationFrame(tick); else setShown(nf.format(value));
      };
      requestAnimationFrame(tick);
    }), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <div className="sv-stat" ref={ref}>
      <span className="sv-stat__value">{shown}{suffix}</span>
      <span className="sv-stat__label">
        {label.split('\n').map((l, i, a) => <span key={i}>{l}{i < a.length - 1 && <br />}</span>)}
      </span>
    </div>
  );
}
