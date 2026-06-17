'use client';

import Link from 'next/link';

/* Official Share Ventures "S" symbol. fill=currentColor so it flips black/white by context. */
export function BrandSymbol({ size = 26 }: { size?: number }) {
  return (
    <svg className="sym" height={size} width={size * 0.889} viewBox="718.9 259.6 482.2 542.7" fill="currentColor" aria-hidden>
      <path d="M 1170.29 386.41 L 980.81 277.01 C 967.97 269.60 952.03 269.60 939.19 277.01 L 746.45 388.29 C 735.62 394.54 728.89 406.19 728.89 418.70 L 728.89 514.41 L 960.00 647.83 L 1030.23 607.29 L 799.12 473.86 L 799.12 438.97 L 960.00 346.09 L 1191.10 479.51 L 1191.10 422.46 C 1191.10 407.63 1183.13 393.82 1170.29 386.41 Z" />
      <path d="M 889.77 456.41 L 1120.88 589.84 L 1120.88 624.74 L 960.00 717.62 L 728.89 584.19 L 728.89 641.25 C 728.89 656.07 736.87 669.89 749.71 677.30 L 939.19 786.69 C 945.61 790.40 952.80 792.25 960.00 792.25 C 967.19 792.25 974.39 790.40 980.81 786.69 L 1177.95 672.88 C 1186.07 668.19 1191.10 659.46 1191.10 650.09 L 1191.10 549.30 L 960.00 415.87 L 889.77 456.41 Z" />
    </svg>
  );
}

/* Product wordmark lockup: shareOS (share medium, OS light) + ™. NEVER the parent SV corporate logo. */
export function Brand({ onDark = false, href = '/', size = 26 }: { onDark?: boolean; href?: string; size?: number }) {
  return (
    <Link href={href} className={`brand${onDark ? ' on-dark' : ''}`} style={{ color: onDark ? '#fff' : '#000' }}>
      <BrandSymbol size={size} />
      {/* spans MUST be adjacent with no whitespace between, or the wordmark renders with a gap */}
      <span className="wm"><span className="s">share</span><span className="b">OS</span><span className="tm">&trade;</span></span>
    </Link>
  );
}

/* Concept glyphs — monochrome inline SVG, stroke=currentColor. Replaces every emoji. */
const PATHS: Record<string, React.ReactNode> = {
  // generic / states
  bot: <><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M12 8V4M9 4h6M8 13h.01M16 13h.01M9 17h6" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  hourglass: <><path d="M6 4h12M6 20h12M8 4c0 4 8 6 8 8s-8 4-8 8M16 4c0 4-8 6-8 8s8 4 8 8" /></>,
  warn: <><path d="M12 4 2 20h20L12 4Z" /><path d="M12 10v5M12 18h.01" /></>,
  check: <path d="M4 12l5 5L20 6" />,
  cross: <path d="M6 6l12 12M18 6 6 18" />,
  bolt: <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />,
  // domains
  chart: <><path d="M4 4v16h16" /><path d="M8 14l3-4 3 3 4-6" /></>,
  bars: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  flask: <><path d="M9 3h6M10 3v6L5 19a1 1 0 0 0 1 1.5h12A1 1 0 0 0 19 19l-5-10V3" /><path d="M8 14h8" /></>,
  money: <><circle cx="12" cy="12" r="8" /><path d="M12 8v8M9.5 9.5c0-1 1-1.7 2.5-1.7s2.5.8 2.5 1.7c0 2-5 1.2-5 3.3 0 1 1 1.7 2.5 1.7s2.5-.7 2.5-1.7" /></>,
  handshake: <path d="M3 12l4-4 3 2 3-2 4 4-3 3-2-2-2 2-2-2-3 3-1-2Z" />,
  people: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M15 20c0-2 1-3.5 3-3.5s3 1.5 3 3.5" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></>,
  star: <path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8L12 3Z" />,
  chat: <path d="M4 5h16v11H9l-5 4V5Z" />,
  speaker: <><path d="M4 10v4h4l6 4V6l-6 4H4Z" /><path d="M18 8a5 5 0 0 1 0 8" /></>,
  doc: <><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>,
  scroll: <><path d="M6 4h11v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Z" /><path d="M9 9h6M9 13h6" /></>,
  clip: <><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4h6v3H9z" /><path d="M9 11h6M9 15h4" /></>,
  folder: <path d="M3 6h6l2 2h10v11H3V6Z" />,
  search: <><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></>,
  refresh: <><path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2" /><path d="M20 4v5h-5M4 20v-5h5" /></>,
  gear: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  crystal: <><path d="M12 3l6 6-6 12-6-12 6-6Z" /><path d="M6 9h12M12 3v18" /></>,
  paint: <><path d="M4 12a8 8 0 1 1 16 0c0 2-2 2-3 2h-2a2 2 0 0 0-1.5 3.3A2 2 0 0 1 12 22 8 8 0 0 1 4 12Z" /><circle cx="8" cy="11" r="1" /><circle cx="12" cy="8" r="1" /><circle cx="16" cy="11" r="1" /></>,
  film: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18M3 15h18M8 5v14M16 5v14" /></>,
  send: <path d="M3 11l18-7-7 18-3-7-8-4Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  pin: <><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  rocket: <><path d="M12 3c3 1 6 4 6 9l-3 3H9l-3-3c0-5 3-8 6-9Z" /><circle cx="12" cy="9" r="1.5" /><path d="M9 15l-2 4M15 15l2 4" /></>,
  fire: <path d="M12 3c1 3-1 4-1 6 0-2-3-2-3 2a4 4 0 1 0 8 0c0-3-2-4-4-8Z" />,
  edit: <><path d="M5 19h14" /><path d="M14 5l4 4-9 9H5v-4l9-9Z" /></>,
  sword: <><path d="M4 20l3-3M14 4l6 6-2 2-6-6 2-2ZM12 6 6 12l2 2 6-6" /></>,
  camera: <><rect x="3" y="7" width="18" height="13" rx="2" /><circle cx="12" cy="13" r="3.5" /><path d="M8 7l2-3h4l2 3" /></>,
  hand: <path d="M12 22c4 0 7-3 7-7v-3a1.5 1.5 0 0 0-3 0V8a1.5 1.5 0 0 0-3 0V4a1.5 1.5 0 0 0-3 0v4a1.5 1.5 0 0 0-3 0v4l-2-2a1.5 1.5 0 0 0-2 2l3 5c.7 1.7 2.5 3 6 3Z" />,
  link: <><path d="M9 15l6-6" /><path d="M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1" /></>,
};

const ALIASES: Record<string, string> = {
  '🤖': 'bot', '🔒': 'lock', '⏳': 'hourglass', '⚠': 'warn', '⚠️': 'warn',
  '✓': 'check', '✅': 'check', '✗': 'cross', '✕': 'cross', '⚡': 'bolt',
  '📊': 'bars', '📈': 'chart', '🧪': 'flask', '💰': 'money', '🤝': 'handshake',
  '👥': 'people', '💼': 'briefcase', '⭐': 'star', '✦': 'star', '💬': 'chat',
  '📣': 'speaker', '📄': 'doc', '📜': 'scroll', '📋': 'clip', '📁': 'folder',
  '🔍': 'search', '🔄': 'refresh', '⚙': 'gear', '⚙️': 'gear', '🌐': 'globe',
  '🔮': 'crystal', '🎨': 'paint', '🎬': 'film', '📤': 'send', '✉': 'mail', '✉️': 'mail',
  '📍': 'pin', '🚀': 'rocket', '🔥': 'fire', '✏': 'edit', '✏️': 'edit',
  '⚔': 'sword', '⚔️': 'sword', '📷': 'camera', '📝': 'edit', '👇': 'hand',
  '🔗': 'link', '🔧': 'gear',
};

export function Glyph({ name, size }: { name: string; size?: number | string }) {
  if (!name) return null;
  const fs = size ? (typeof size === 'number' ? `${size}px` : size) : undefined;
  // colored status dots (functional indicators)
  const dot = DOTS[name];
  if (dot) {
    return <span aria-hidden style={{ display: 'inline-block', width: '0.7em', height: '0.7em', borderRadius: '50%', background: dot, verticalAlign: '-0.05em', fontSize: fs }} />;
  }
  if (name === '𝕏') {
    return <span className="glyph" style={fs ? { fontSize: fs } : undefined} aria-hidden><svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4 4 20" /></svg></span>;
  }
  const key = ALIASES[name] || name;
  const path = PATHS[key];
  if (!path) {
    // unknown glyph: render nothing rather than a stray emoji
    return null;
  }
  return (
    <span className="glyph" style={fs ? { fontSize: fs } : undefined} aria-hidden>
      <svg viewBox="0 0 24 24">{path}</svg>
    </span>
  );
}

const DOTS: Record<string, string> = {
  '🔴': '#C0392B', '🟡': '#8A6D3B', '🟢': '#00D65D', '🟠': '#8A6D3B', '🟧': '#8A6D3B',
};

/* Circular stat gauge — the unifying workshop motif. value 0..1 fills the ring. */
export function Gauge({ value, size = 72, label, sub }: { value: number; size?: number; label?: string; sub?: string }) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <span className="gauge" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle className="gauge-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={5} />
        <circle className="gauge-fill" cx={size / 2} cy={size / 2} r={r} strokeWidth={5}
          strokeDasharray={c} strokeDashoffset={c * (1 - v)} />
      </svg>
      <span className="gauge-label" style={{ fontSize: size * 0.32, letterSpacing: '-0.02em' }}>
        {label ?? `${Math.round(v * 100)}%`}
        {sub && <span style={{ display: 'block', fontSize: size * 0.18, fontWeight: 500, color: '#5E6366', textAlign: 'center', marginTop: 0, lineHeight: 1 }}>{sub}</span>}
      </span>
    </span>
  );
}
