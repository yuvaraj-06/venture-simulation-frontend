# Motion

Share Ventures Design System 3.0.0 · Released 2026-08-27 · Animation guidelines for landing pages and websites.

Motion here is **cinematic restraint**: few moments, decisively authored, physically confident. The brand never bounces, wobbles, spins, or sparkles. If an animation could appear in a template marketplace, it doesn't belong here.

---

## 1. Principles

1. **One authored moment per view.** Each viewport gets a single deliberate motion idea (a hero build-in, one section reveal, one media zoom). Everything else is instant or near-instant state feedback.
2. **Exponential ease-out is the signature.** Things arrive fast and settle softly — like a precision instrument locking into place. Nothing eases in slowly from zero.
3. **Motion explains, never decorates.** Every animation must answer "what does this clarify?" — hierarchy (staggered reveal), causality (button feedback), continuity (page transitions), or materiality (3D light response).
4. **Start from visible.** Default state is legible; JS enhances. Reveal offsets are small (24px). A user with JS disabled, a crawler, or a screen reader sees the complete page.
5. **Respect the visitor.** `prefers-reduced-motion` collapses all movement to opacity (tokens handle this automatically). Nothing autoplays with sound; nothing loops aggressively in reading zones.

## 2. Tokens (from `tokens/tokens.css`)

| Token | Value | Use |
|---|---|---|
| `--sv-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, reveals, hovers — the signature curve |
| `--sv-ease-inout` | `cubic-bezier(0.76, 0, 0.24, 1)` | Position/size changes, overlay panels |
| `--sv-ease-linear` | `linear` | Marquees, progress tracks, explicitly scroll-scrubbed motion |
| `--sv-dur-instant` | 100ms | Color/opacity hover feedback |
| `--sv-dur-fast` | 200ms | Buttons, links, small UI state |
| `--sv-dur-base` | 300ms | Menus, accordions, tabs |
| `--sv-dur-slow` | 600ms | Section reveals, image zooms, count-ups |
| `--sv-dur-cine` | 1000ms | Hero builds, 3D camera moves, page transitions |
| `--sv-stagger` | 80ms | Max delay step between sibling reveals |
| `--sv-reveal-distance` | 24px | translateY for scroll reveals |

Hard rules: animate only `transform`, `opacity`, `filter`, `clip-path`, and `background-color`/`color`/`border-color` (fast UI state). Never animate layout properties (width/height/top/margin). Everything targets 60fps; add `will-change` only during an active animation.

## 3. Core patterns

### 3.1 Hero build-in (page load — the one big moment)

Sequence, total ≈ 1.2s, all `--sv-ease-out`:

1. Media/3D scene: opacity 0→1 + scale 1.04→1, `--sv-dur-cine`.
2. Headline lines (each line wrapped in an overflow-hidden span): translateY 100%→0 + slight blur `filter: blur(6px)→0`, `--sv-dur-cine`, staggered `--sv-stagger` per line, starting 150ms after media.
3. Supporting copy, buttons, stats: opacity 0→1 + translateY 24px→0, `--sv-dur-slow`, one shared delay (no per-element cascade).
4. Nav: opacity 0→1, `--sv-dur-slow`, last.

Never replay on subsequent in-page navigation.

```css
.sv-hero__line { display: block; overflow: hidden; }
.sv-hero__line > span {
  display: block; transform: translateY(110%); filter: blur(6px); opacity: 0;
  animation: sv-rise var(--sv-dur-cine) var(--sv-ease-out) forwards;
  animation-delay: calc(150ms + var(--i, 0) * var(--sv-stagger));
}
@keyframes sv-rise { to { transform: none; filter: none; opacity: 1; } }
```

### 3.2 Scroll reveal (sections)

IntersectionObserver, threshold 0.2, fires **once**. Elements marked `data-reveal` get opacity 0→1 + translateY `--sv-reveal-distance`→0, `--sv-dur-slow` `--sv-ease-out`; siblings within one section stagger by `--sv-stagger`, capped at 5 steps (later elements share the last delay).

Do not attach the identical reveal to every section — alternate targets (a headline here, a media block there) or let quiet sections simply be there. Rails and hairlines never animate.

```js
const io = new IntersectionObserver((es) => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('is-in'); io.unobserve(e.target);
}), { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
```

```css
[data-reveal] { opacity: 0; transform: translateY(var(--sv-reveal-distance));
  transition: opacity var(--sv-dur-slow) var(--sv-ease-out),
              transform var(--sv-dur-slow) var(--sv-ease-out);
  transition-delay: calc(min(var(--i, 0), 5) * var(--sv-stagger)); }
[data-reveal].is-in { opacity: 1; transform: none; }
```

### 3.3 Micro-interactions

- **Buttons:** background/border/color swap, `--sv-dur-fast`. No scale, no lift.
- **Arrow links:** arrow translateX 6px, `--sv-dur-fast`.
- **Media tiles:** image scale 1→1.03 over `--sv-dur-slow` inside an overflow-hidden frame; title underline draws in.
- **Nav:** links dim to 60% opacity `--sv-dur-instant`; bar gains surface + hairline over `--sv-dur-base` after leaving the hero (toggle a class at `scrollY > heroHeight - navHeight`).
- **Inputs:** border-color `--sv-dur-fast`.

### 3.4 "Share ___" word cycle (hero headline)

The second word of the hero headline may cycle through brand words (Progress, Innovation, Vision, Potential…): current word exits translateY −100% + opacity 0, next enters from +100%, both `--sv-dur-slow` `--sv-ease-out`, inside an overflow-hidden line. Hold each word ≥ 2.5s; pause the cycle on hover/focus and under reduced motion (show the first word statically). `aria-live="off"` — it's decorative; the static word carries the meaning.

## 4. Data & number motion

Stat count-up on first reveal: animate the number from 0 (or from a nearby value for large numbers) over `--sv-dur-slow` with `--sv-ease-out` math (`v = target * (1 - Math.pow(2, -10 * t))`), rendering with `Intl.NumberFormat`. Fires once; reduced motion shows the final value immediately. Suffixes (m, %, +) don't animate.

## 5. Overlays & page transitions

- **Mobile menu:** full-screen black panel, `clip-path: inset(0 0 100% 0)` → `inset(0)`, `--sv-dur-base` `--sv-ease-inout`; links then rise like hero lines (3.1) with tighter timing. Focus is trapped; Escape closes.
- **Page-to-page (optional, SPA/View Transitions):** outgoing view fades to black over `--sv-dur-base`, incoming hero builds per 3.1. Never slide entire pages horizontally.
- **Dialogs:** opacity + translateY 16px, `--sv-dur-base`; backdrop black 60%.

## 6. Scroll-linked & 3D motion

- **Supergraphic parallax:** background S moves at 0.85× scroll speed (translateY driven by scroll progress, `transform` only, applied via rAF or CSS scroll-driven animations). Max drift ±6% of its height.
- **3D scenes:** hold still at rest. Scroll may reveal assembly, material, scale, or pose only when the change teaches the section; a rotation is not a lesson by itself. No ambient camera drift, autoplay rotation, float loops, or viewport-wide pointer parallax. Full rules in `graphics-3d.md` §5.
- **Scene mode (persistent teaching object):** the object appears only in sections with a named teaching role and hides everywhere else. Damped interpolation (factor ≈ 0.08) preserves continuity between those states. Full spec in `graphics-3d.md` §6.
- **Pinned sequences** (scrollytelling a product story): max one per page, 2–3 viewport-heights long, always skippable by continued scrolling. Content within the pin follows pattern 3.2.
- No scroll-jacking: native scroll speed and direction are never overridden.

## 7. Performance & accessibility budget

- ≤ 2 concurrently animating layers outside the hero moment; compositor-only properties.
- JS animation runs only while a bounded transition is active. Scroll-linked 3D renders on demand, and any remaining loop stops when offscreen or `document.hidden`.
- Total motion-related JS ≤ 10KB gzipped on a landing page (excluding a 3D scene, which has its own budget in graphics-3d.md).
- `@media (prefers-reduced-motion: reduce)`: tokens collapse durations to 1ms and reveal distance to 0 — verify no content is hidden behind never-firing animations; autoplaying video pauses; 3D falls back to poster.
- Motion never blocks interaction: content is clickable before its entrance finishes.
