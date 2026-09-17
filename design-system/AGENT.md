# Share Ventures — Agent Design Contract 3.0.0

You are building a landing page, website, or web UI for **Share Ventures™**. This file is a complete, self-contained specification. Follow it exactly; where it is silent, choose the quietest option consistent with it. The deeper references (`foundations.md`, `components.md`, `motion.md`, `graphics-3d.md`, `tokens/`) expand on everything here — read them if available, but this file alone is sufficient and binding.

**Brand in one line:** Human potential, engineered — a restrained, image-led, typographically confident world: high-resolution colour photography with "Share ___" headlines set on top, and at most one rare green accent marking the page's single action.

---

## 1. Hard rules (violating any of these fails the work)

1. **Color:** Brand chrome uses only `#000000`, `#FFFFFF`, `#F1F4F5`, `#E8E6E4`, `#C8CBCC`, `#939799`, `#5E6366`, `#2B3033`, and CTA green `#00D65D`. Photography is deliberately full-colour and high-resolution. Selective graphics/data visualisation may use a justified semantic palette, never as decorative UI chrome. A new venture may add a small, purposeful palette for its product or market when it stays minimal, accessible, and recognisably in the Share family.
2. **Green `#00D65D` is rare.** It marks the single most important action on the page — normally exactly **one green button per page** (usually the closing CTA), never two greens in a viewport. Every other button/control is ink (black on light, white on dark); focus rings and small live indicators are the only other uses. Never headlines, backgrounds, decorations, icons, or the logo. A page with green scattered through it is off-brand even if every use is interactive.
3. **Logo & symbol appear in black or white only** — never recolored, distorted, redrawn, or given effects. **Official logo assets stay exactly as supplied.** For web UI, the brand mark is the composed wordmark: the S logomark followed by live Aeonik Pro text — **lowercase "share" in Bold (700)**, then the descriptor in **Light (300)**. The firm descriptor is specifically lowercase, **share ventures**; product descriptors retain their proper casing, e.g. **share OS**. Lowercasing "ventures" does not create a general lowercase rule for product names. One line, vertically centered; symbol ≈ 1.6× the text size with a ≈ 0.5em gap; the whole mark takes `currentColor` (black or white only, never green or gray). Inline the S paths from `assets/logos/SV_Symbol_*.svg` with `fill: currentColor` — never redraw the S. Use the provided `.sv-wordmark` markup / `Wordmark` component; don't freestyle the weights or spacing. The fixed "Share Ventures™" lockup files (`assets/logos/SV_Logo_*`) remain unchanged for print and document use only. Clear space = the S height on all sides (via layout padding). Min sizes: wordmark text ≥ 16px, symbol-only ≥ 24px.
4. **Typeface: Aeonik Pro** (self-hosted, weights 100/300/400/500/700/900); fallback **Arial** — never a look-alike substitute (no Inter/Helvetica-Now/Neue-Haas).
5. **Radius 0 on everything.** Buttons, inputs, cards, images, video. Sharp corners are a brand signature.
6. **No decorative shadows, no gradient text, no glassmorphism** (single exception: the hero stat panel may use black 35% + `backdrop-filter: blur(12px)`), no icon fonts/emoji-as-icons, no kickers/eyebrow labels above headings, no section numbers unless the sequence carries meaning.
7. **Sentence case everywhere** (headlines, nav, buttons). Caps only for 13px technical labels with +0.04em tracking, sparingly.
8. **Motion:** transform/opacity/filter/clip-path only; signature ease `cubic-bezier(0.16,1,0.3,1)`; one authored moment per viewport; scroll reveals fire once; full `prefers-reduced-motion` support; no scroll-jacking, no bounce, no spin.
9. **Accessibility floor:** WCAG AA contrast (body 4.5:1, large text 3:1 — `#939799` is decorative-only), visible 2px green focus ring offset 2px on every interactive element, semantic HTML, keyboard-complete, `aria-hidden` canvases with meaning in the DOM.
10. **Truth:** never invent metrics, logos, testimonials, or claims. Real numbers only.
11. **Deck routing:** every Share Ventures deck, presentation, slide viewer, deck composer, or deck modification MUST load and follow the `deck-agent` extension. This design system governs identity and supersedes older deck-agent styling where they conflict, but it does not replace the deck-agent content, component, interaction, and delivery workflow.

## 2. Tokens (use these exact values; via `tokens/tokens.css` when available)

```css
:root{
  --sv-black:#000; --sv-white:#fff; --sv-off-white:#e8e6e4; --sv-home-bg:#f1f4f5;
  --sv-gray-light:#c8cbcc; --sv-gray-mid:#939799; --sv-gray-dark:#5e6366; --sv-gray-xdark:#2b3033;
  --sv-green:#00d65d;
  /* semantic (light default) */
  --sv-surface:var(--sv-home-bg); --sv-surface-raised:var(--sv-white);
  --sv-ink:var(--sv-black); --sv-ink-secondary:var(--sv-gray-dark); --sv-ink-tertiary:var(--sv-gray-mid);
  --sv-hairline:var(--sv-gray-light); --sv-accent:var(--sv-green); --sv-accent-ink:var(--sv-black);
  --sv-font-sans:var(--font-aeonik,"Aeonik Pro"),"Aeonik",Arial,"Helvetica Neue",Helvetica,sans-serif;
  --sv-text-display:clamp(3rem,8vw,6rem);   /* w400 lh1.02 ls-0.02em */
  --sv-text-h1:clamp(2.5rem,5vw,3.5rem);    /* w500 lh1.1  ls-0.01em */
  --sv-text-h2:clamp(2rem,3.5vw,2.5rem);    /* w500 */
  --sv-text-h3:1.75rem; --sv-text-h4:1.25rem; --sv-text-intro:1.5rem;
  --sv-text-body:1.125rem;                  /* w400 lh1.6 */
  --sv-text-small:.9375rem; --sv-text-caption:.8125rem;
  --sv-text-stat:clamp(4rem,10vw,8rem);     /* w400 lh1 */
  --sv-space-1:4px;  --sv-space-2:8px;  --sv-space-3:12px; --sv-space-4:16px;
  --sv-space-6:24px; --sv-space-8:32px; --sv-space-12:48px; --sv-space-16:64px;
  --sv-space-24:96px;--sv-space-32:128px;--sv-space-48:192px;
  --sv-container:90rem; --sv-rail:18rem; --sv-gutter:clamp(1.25rem,4vw,4rem); --sv-radius:0;
  --sv-ease-out:cubic-bezier(.16,1,.3,1); --sv-ease-inout:cubic-bezier(.76,0,.24,1);
  --sv-dur-instant:100ms; --sv-dur-fast:200ms; --sv-dur-base:300ms; --sv-dur-slow:600ms; --sv-dur-cine:1000ms;
  --sv-stagger:80ms; --sv-reveal-distance:24px;
}
/* dark sections: add class sv-dark and flip semantics.
   color AND background applied here so dark elements never inherit
   black-on-black text or sit transparent over a light page
   (transparent-context elements like the nav override background) */
.sv-dark{--sv-surface:#000;--sv-surface-raised:#2b3033;--sv-ink:#fff;
  --sv-ink-secondary:#c8cbcc;--sv-ink-tertiary:#939799;--sv-hairline:#5e6366;
  color:var(--sv-ink);background:var(--sv-surface)}
@media (prefers-reduced-motion:reduce){:root{--sv-dur-instant:1ms;--sv-dur-fast:1ms;
  --sv-dur-base:1ms;--sv-dur-slow:1ms;--sv-dur-cine:1ms;--sv-reveal-distance:0px}}
```

Fonts: Aeonik Pro is licensed software and is not distributed in this repository. Load it only from an authorized, licence-managed deployment source for a covered domain, with `font-display: swap`; otherwise Arial renders — do not substitute another webfont.

## 3. Page anatomy (default landing page)

1. **Nav** (88px, transparent over hero → surface + 1px hairline after scroll): composed wordmark left (`.sv-wordmark`: S symbol + **share** Bold + descriptor Light, 21px text / ~34px symbol desktop, 18px text mobile; `currentColor` flips it with the bar — no image swap), then two-line stacked labels (15px Medium) **distributed evenly across the full remaining width** — the brand-mock pattern; never cluster links in a corner. **No boxed buttons in the nav**: the CTA ("Connect with us") is the last two-line text item; hover draws a 1px underline in from the left (scaleX, 200ms ease-out). Mobile: "Menu" text button with drawn icon → full-screen black overlay (clip-path reveal), display-size links in stagger, Escape closes.
2. **Hero** (100svh, usually `.sv-dark`): **full-bleed photography by default** (film loop or still; 3D/pure-type is the deliberate exception) with the display headline set directly on the image, lower-left, using the **"Share ___" device** (Share Progress / Share Innovation / Share Potential — **"Share" is always the prominent word**: full ink, Medium 500; the activation word may step back to `--sv-ink-secondary` Regular 400, never the reverse, never green); bottom-up black scrim ≤40% when the image is busy; optional glass stat panel right; underlined "Learn more" link.
3. **Editorial split sections** (the signature text rhythm): 288px left rail (15px Bold label + 15px `--sv-ink-secondary` supporting copy) + main content right (H2/H3 heading, 24px intro, 18px body max 70ch). Stacks below 900px. Section spacing 96–192px.
4. **Image bands** (the signature image rhythm — use at least one, alternate with editorial splits): full-bleed photograph, 60–85vh, with a "Share ___" display headline set on the image (white on dark imagery + scrim as needed; "Share" full ink Medium, activation word may be quieter). No buttons or body copy in a band — it is a statement. The page overall should feel image-rich: photography in heroes, bands, and tiles, with text on top.
5. **Stat row:** 2–3 oversized Regular numerals (`--sv-text-stat`) with small two-line labels beside the baseline; hairline separators; count-up once on reveal.
6. **Media/portfolio tiles:** photographic, radius 0, no shadow; title below the image or overlaid per the band treatment; image zoom 1→1.03 on hover; whole tile is the link.
7. **CTA section:** black, display-size "Share ___" headline, one green primary button — **the page's one green element**.
8. **Scene mode (optional, flagship pages only):** one persistent 3D S on a fixed `pointer-events:none` canvas teaches section rules. Each section declares `data-scene='{"x":…,"y":…,"s":…,"o":…,"tone":0|1,"ry":rad,"rx":rad,"split":0|1}'` + `data-scene-label`; the driver smoothstep-mixes surrounding states at `scrollY + 35% viewport` and damps toward them (×0.08/frame). Before showing it, finish "Here the S shows ___" with a section rule; otherwise use `o:0`. Components may separate the production paths (`split:1`), Motion interlocks them (`split:0`), and the mark then holds. No idle drift, autoplay rotation, or viewport-wide pointer parallax. Keep the canvas below reading content; mask it at the footer. Pair it with one bottom-left current-section label only — no progress hairline or numeric position index. Static fallback and reduced-motion pinning are required.
9. **Footer:** black; composed wordmark (24px text); two-line nav columns; 13px Light legal in `#c8cbcc`; hairline `#5e6366` above legal; optional outline-S supergraphic bleeding off an edge.

Alternate section surfaces deliberately (`#f1f4f5` default, black for cinematic moments); don't zebra-stripe.

## 4. Components (exact specs)

- **Ink button (default for everything):** 48px tall, 0 24px padding, ink bg, surface text, 16px Medium → hover: transparent, 1px ink border, ink text (200ms ease-out).
- **Primary green button (max one per page):** green bg, black text → hover: transparent bg, 1px green border, ink text. Reserved for the single most important action — usually the closing CTA.
- **Text link:** ink, 1px underline, 4px offset → hover: green underline.
- **Arrow link:** text + drawn SVG long arrow (1.5px stroke, currentColor, square terminals); arrow shifts 6px right on hover. Never a unicode →.
- **Input:** 48px, `--sv-surface-raised` fill, 1px hairline border, 16px text, label above (15px Medium); focus: ink border + green ring; errors typographic (no red).
- **Focus ring (everything):** `outline: 2px solid var(--sv-green); outline-offset: 2px`.
- **Icons:** avoid where possible; else authored 24px SVG, 1.5px stroke, 60° hexagon-echoing geometry, currentColor.

## 5. Motion recipes

- **Hero build (once, ≈1.2s total):** media fades/settles (scale 1.04→1, 1000ms) → headline lines rise from overflow-hidden masks with blur(6px)→0 (1000ms, 80ms stagger) → copy/buttons/stats fade up together (600ms) → nav fades last.
- **Scroll reveal:** IntersectionObserver at 0.2, once; opacity 0→1 + translateY 24px→0, 600ms ease-out, ≤5 stagger steps. Vary which elements reveal; don't animate every section identically.
- **Word cycle (optional):** hero's second word cycles every ≥2.5s via vertical mask slide; static under reduced motion.
- **Hovers:** color/opacity 100–200ms; media zoom 600ms; nothing scales buttons or lifts cards.
- **3D (if used):** extrude the real S SVG as machined metal, graphite→aluminum. Use metalness 1, roughness 0.20–0.24 on faces and 0.10–0.14 on bevels, clearcoat 0, plus neutral studio environment/key/rim reflections; coated highlights read as plastic. The rest pose is still; movement must answer scroll or direct input and settle. Pixel ratio ≤2; poster fallback; pause when hidden; `aria-hidden` canvas.

## 6. Framework: Next.js (App Router) is the default stack

Build Share Ventures sites in Next.js unless told otherwise; plain HTML is only for isolated one-offs. The design rules above are framework-agnostic — map them like this (drop-in files in `nextjs/`, full guide in `nextjs/README.md`):

- Tokens: import `tokens/tokens.css` + `nextjs/styles/sv-base.css` once in `app/globals.css`. Never re-declare token values in JS or CSS-in-JS; never inline-style brand hexes.
- Fonts: the portable kit uses the sanctioned Arial fallback. A covered production deployment may supply Aeonik Pro through its own authorised, licence-managed source and map it to `--font-aeonik`; this repository distributes no font binaries.
- Photography: `next/image` (`fill` + object-fit cover inside `.sv-band`/`.sv-tile__media`, honest `sizes`, `priority` on the hero only; `remotePatterns` for stock hosts).
- Markup stays server components using `sv-*` classes; the brand mark is the provided `Wordmark` server component (`<Wordmark />` → share ventures, `<Wordmark product="OS" />` → share OS); interactivity is ONLY these client islands (use the provided ones, don't rebuild them): `Nav`, `RevealObserver`, `WordCycle`, `Stat`, `Scene`.
- Scene mode: mount `<Scene/>` once in `app/layout.tsx` — it persists across route transitions; sections declare `data-scene`/`data-scene-label` exactly as in §3.8.
- If `design-system/nextjs/` exists in the repo, import from it rather than re-implementing anything.

## 7. Imagery

Imagery is the core theme — pages are image-rich, and text-on-image is the signature treatment (heroes, bands, tiles). The brand book defines four photostyle categories; pick from them: **Human** (people meeting technology — headsets, bionics, silhouettes, dramatic light), **Aspirational** (achievement at the frontier — rocket launches, earth from orbit, summit moments), **Forward-looking** (what's not yet imagined — robotics, AI, concept hardware, Mars/planetary scenes), **Quality** (precision — engineering macro, cleanrooms, machined detail). The register is **futuristic and cinematic**: dark or high-key colour frames, dramatic light, cool/neutral grade, restrained saturation. Photography retains real, full colour. Never ordinary business stock (offices, handshakes, smiling headshots, daylight product shots), never oversaturation. Curated premium stock is fine when it meets this register (confirm commercial license). White text over imagery gets a bottom black gradient scrim ≤40% before you ever shrink the text. AVIF/WebP, lazy-load below fold, explicit dimensions.

## 8. Voice

Confident, concise, forward-looking; short declaratives ("We build what's next."). Buttons name actions ("Connect with us"). Real numbers only. ™ superscript on first prominent "Share Ventures".

## 9. Before delivering, verify

- [ ] Brand chrome uses only §1.1 tokens; photography retains full colour; any venture palette or semantic graphic colour is purposeful, minimal, accessible, and not decorative chrome; green appears on at most ONE element on the whole page (+ focus rings)
- [ ] Wordmark is composed per §1.3 (S logomark + bold lowercase "share" + light descriptor, provided markup/component), black/white only, clear space respected; radius 0 everywhere; no decorative shadows
- [ ] Type scale matches §2; body ≤75ch; sentence case; Aeonik→Arial stack intact
- [ ] Hero has the one authored motion moment; reveals fire once; reduced-motion collapses all movement; no layout-property animation
- [ ] AA contrast (no `#939799` body text); visible green focus rings; keyboard-complete; canvas `aria-hidden`
- [ ] Mobile 375px: nav overlay works, display type wraps ≤3 lines, editorial splits stack, tap targets ≥44px
- [ ] Page is image-led: photography in the hero and at least one image band/tile group, headlines set on the images
- [ ] No invented metrics/claims/logos; all links and buttons act or state where they lead
