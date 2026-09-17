'use client';

/**
 * "Share ___" hero word cycle (motion.md §3.4). The activation word cycles
 * inside an overflow-hidden mask; "Share" itself stays put and prominent.
 * Static first word under reduced motion; pauses on hover and hidden tabs.
 *
 *   <h1 className="sv-display">
 *     <span className="sv-hero__share">Share</span><br />
 *     <WordCycle words={['Potential', 'Progress', 'Innovation', 'Vision']} />
 *   </h1>
 */

import { useEffect, useRef, useState } from 'react';

export default function WordCycle({ words, holdMs = 3000 }: { words: string[]; holdMs?: number }) {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const paused = useRef(false);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || words.length < 2) return;
    const t = setInterval(() => {
      if (paused.current || document.hidden) return;
      setIdx(i => { setPrev(i); return (i + 1) % words.length; });
      setTimeout(() => setPrev(null), 650);
    }, holdMs);
    return () => clearInterval(t);
  }, [words.length, holdMs]);

  return (
    <span className="sv-word-cycle sv-hero__word" aria-live="off"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}>
      {prev !== null && <span className="is-exit">{words[prev]}</span>}
      <span key={idx} className={prev !== null ? 'is-entering' : undefined}>{words[idx]}</span>
      <style jsx>{`
        .sv-word-cycle { position: relative; display: inline-block; overflow: hidden; vertical-align: bottom; }
        .sv-word-cycle span { display: block; }
        .is-exit { position: absolute; inset: 0; animation: sv-word-out var(--sv-dur-slow) var(--sv-ease-out) forwards; }
        .is-entering { animation: sv-word-in var(--sv-dur-slow) var(--sv-ease-out); }
        @keyframes sv-word-out { to { transform: translateY(-100%); opacity: 0; } }
        @keyframes sv-word-in { from { transform: translateY(100%); opacity: 0; } }
      `}</style>
    </span>
  );
}
