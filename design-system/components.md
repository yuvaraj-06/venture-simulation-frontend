# Components

Share Ventures Design System 3.0.0 · Released 2026-08-27 · Requires `tokens/tokens.css`. All examples assume the semantic tokens (`--sv-ink`, `--sv-surface`, …) so every component works on light sections and, unchanged, inside `.sv-dark` sections.

Global component rules: radius 0 · hairline borders 1px `--sv-hairline` · no decorative shadows · sentence case · focus-visible ring 2px `--sv-green` with 2px offset on every interactive element.

---

## 1. Navigation bar

Anatomy — taken directly from the brand book's website mocks (PDF §6), which is what makes this nav distinctly Share Ventures rather than a generic logo-left/button-right bar:

- **Composed wordmark left**, then the nav items **distributed across the full remaining width** with generous, even spacing — each item a **two-line stacked label** ("Innovation / Labs", "Work / with us", "Fund + / Foundry", "Connect / with us"). The distribution across the width *is* the design; do not cluster the links in a right-hand corner.
- **No boxed buttons in the nav.** The CTA ("Connect with us") is simply the last two-line item. Boxed buttons — and the page's single green — live in page content, not the bar.
- **Brand mark = the composed wordmark** (`.sv-wordmark`, foundations.md §2): inline S symbol + lowercase **share** in Bold (700) + descriptor in Light (300), 21px text / ~34px symbol on desktop. The web firm mark reads **share ventures**; product casing is preserved, e.g. **share OS**. It renders in `currentColor`, so it transitions with the bar's ink as the surface changes — no white/black image swap.
- Height 88px desktop / 64px mobile. Transparent over hero imagery (white ink), gains `--sv-surface` background + bottom hairline after scrolling past the hero.
- Labels: 15px Medium, sentence case. Hover: a 1px underline draws in from the left (`::after`, `scaleX(0→1)`, `--sv-dur-fast` `--sv-ease-out`). Current page: the underline sits at rest.
- Mobile (<900px): wordmark left at 18px text (symbol alone only below ~360px viewports), a "Menu" text button with a drawn 2-line icon right; opens a **full-screen black overlay** — `clip-path` reveal per motion.md §5 — with display-size links rising in stagger, drawn close X, Escape to close, focus managed.

```html
<header class="sv-nav sv-dark">
  <a class="sv-nav__brand" href="/" aria-label="Share Ventures home">
    <span class="sv-wordmark">
      <svg class="sv-wordmark__symbol" viewBox="125.85 116.8 828.3 933.4" aria-hidden="true"><!-- S paths from SV_Symbol_*.svg, fill:currentColor --></svg>
      <span class="sv-wordmark__text"><b class="sv-wordmark__share">share</b> <span class="sv-wordmark__product">ventures<span class="sv-wordmark__tm">™</span></span></span>
    </span>
  </a>
  <nav class="sv-nav__links" aria-label="Primary">
    <a href="#labs">Innovation<br>Labs</a>
    <a href="#work">Work<br>with us</a>
    <a href="#fund">Fund +<br>Foundry</a>
    <a href="#connect">Connect<br>with us</a>
  </nav>
  <button class="sv-nav__menu-btn" aria-expanded="false" aria-controls="menu">Menu …</button>
</header>
```

```css
.sv-nav__links { display:flex; flex:1; justify-content:space-between;
  margin-left:clamp(3rem, 10vw, 10rem); }
.sv-nav__links a { position:relative; padding-bottom:6px; text-decoration:none; }
.sv-nav__links a::after { content:""; position:absolute; left:0; bottom:0;
  width:100%; height:1px; background:currentColor;
  transform:scaleX(0); transform-origin:left;
  transition:transform var(--sv-dur-fast) var(--sv-ease-out); }
.sv-nav__links a:hover::after, .sv-nav__links a[aria-current="page"]::after { transform:scaleX(1); }
```

## 2. Buttons

From the digital style guide (PDF p.31). Rectangular, sharp, 48px tall, 16px Medium, padding 0 24px, min-width 160px where layout allows.

| Variant | Rest | Hover / active |
|---|---|---|
| **Ink (default)** | black bg, white text (on dark: white bg, black text) | transparent bg, 1px ink border, ink text |
| **Primary green (rare)** | `--sv-green` bg, black text, no border | transparent bg, 1px `--sv-green` border, ink text |
| **Tertiary / text link** | underlined ink text, 1px underline, 4px offset | underline color → `--sv-green` |

- **The ink button is the workhorse.** The green primary is reserved for the page's single most important action — normally exactly **one green button per page** (the closing CTA), and never two greens in a viewport. Nav CTAs, form submits, and section links all default to ink.
- Transition: background/color/border `--sv-dur-fast` `--sv-ease-out`.
- Disabled: `--sv-gray-light` bg, `--sv-gray-dark` text, no interaction. Loading: label swaps to a 1px indeterminate bar in ink, width 24px.

```css
.sv-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  height: 48px; padding: 0 24px; border: 1px solid transparent; border-radius: 0;
  font: 500 1rem/1 var(--sv-font-sans); color: var(--sv-accent-ink);
  background: var(--sv-accent); cursor: pointer; text-decoration: none;
  transition: background var(--sv-dur-fast) var(--sv-ease-out),
              color var(--sv-dur-fast) var(--sv-ease-out),
              border-color var(--sv-dur-fast) var(--sv-ease-out);
}
.sv-btn--primary:hover { background: transparent; border-color: var(--sv-green); color: var(--sv-ink); }
.sv-btn--ink { background: var(--sv-ink); color: var(--sv-surface); }
.sv-btn--ink:hover { background: transparent; border-color: var(--sv-ink); color: var(--sv-ink); }
.sv-btn:focus-visible { outline: 2px solid var(--sv-green); outline-offset: 2px; }
```

## 3. Directional link (arrow)

Underlined text link or standalone thin arrow (the brand mocks use long thin arrows). Arrows are **drawn SVG**, 1.5px stroke, currentColor — never a unicode `→` glyph.

```html
<a class="sv-link-arrow" href="#portfolio">
  See the portfolio
  <svg width="32" height="12" viewBox="0 0 32 12" fill="none" aria-hidden="true">
    <path d="M0 6h30M25 1l5 5-5 5" stroke="currentColor" stroke-width="1.5"/>
  </svg>
</a>
```

Hover: arrow translates 6px right, `--sv-dur-fast` `--sv-ease-out`.

## 4. Hero

The signature Share Ventures hero (PDF §6): full-viewport **photography** (film loop or still) with the "Share ___" display headline set directly on the image, optional stat overlay, nav on top. A 3D scene or pure-type hero is the deliberate alternative, not the default — the brand leads with pictures.

- Height: 100svh (min 640px). Content aligned to the lower-left on the grid; nav floats above.
- Headline: Display token, white (dark hero) or ink (light hero), max 2 lines, on the image itself. Add a bottom-up black scrim (≤40%) when the image is busy.
- Optional translucent stat panel right (see §6) with `backdrop-filter: blur(12px)` and black at 35% — the one sanctioned use of glass, taken directly from the brand's website mock.
- Underlined "Learn more" tertiary link bottom-left; long-arrow to advance content right.
- Media: photographic film loop, still, or a 3D canvas per `graphics-3d.md`. Always with a poster/static fallback.

## 5. Editorial split section

The brand book's own page anatomy, reused as the default content section (see foundations.md §5):

```html
<section class="sv-split">
  <aside class="sv-split__rail">
    <h2 class="sv-label">Fund + Foundry</h2>
    <p class="sv-rail-copy">We build and back companies at the
    intersection of AI and human performance.</p>
  </aside>
  <div class="sv-split__main">
    <h3 class="sv-h2">Share Progress</h3>
    <p class="sv-intro">…</p>
  </div>
</section>
```

- Rail label: 15px Bold. Rail copy: 15px Regular, `--sv-ink-secondary`.
- Grid: `grid-template-columns: var(--sv-rail) 1fr; gap: var(--sv-space-16);` stacking below 900px.

## 6. Image band — the "Activating Share" section

Straight from the brand book's activation pages (and the required rhythm of every landing page): a full-bleed or grid-bleed photograph with a "Share ___" headline set on top. Use at least one between content sections; long pages alternate editorial splits with image bands.

```html
<section class="sv-band" aria-label="Share Innovation">
  <img src="/img/lab.avif" alt="" width="2400" height="1350" loading="lazy">
  <div class="sv-band__scrim"></div>
  <h2 class="sv-display">Share<br>Innovation</h2>
</section>
```

- Height 60–85vh (min 420px). Image `object-fit: cover`; grade per foundations.md §6.
- Headline left-center or lower-left on the container grid; white on dark imagery, ink on pale imagery. "Share" is the prominent word — full ink, Medium 500; the activation word may step back to `--sv-ink-secondary` Regular 400 (never the reverse).
- Scrim: `linear-gradient(to top, rgb(0 0 0 / .4), transparent 55%)` (or left-in) — only as strong as contrast requires.
- Optional: one underlined link or arrow link under the headline. No buttons, no body copy — the band is a statement, not a section of prose.
- Image tiles in grids may use the same treatment at H3 scale (title over image, scrim, whole tile linked).

## 7. Stat block

Brand-native data pattern: oversized numeral + small label beside the baseline.

```html
<div class="sv-stat">
  <span class="sv-stat__value" data-count="213">213</span>
  <span class="sv-stat__label">New<br>companies</span>
</div>
```

- Value: `--sv-text-stat`, weight 400, tracking −0.02em. Label: 15px Regular, two lines, `--sv-ink-secondary`, aligned to the numeral's baseline area.
- Count-up on first reveal only (see motion.md §4). Numbers must be real — no invented metrics.
- Cluster 2–3 stats max; separate with hairlines or space, never boxes.

## 8. Cards & media tiles

Cards are used sparingly (the brand prefers open layouts with hairline separation). When needed (portfolio grids, news):

- Bare photographic tile by default (the brand prefers pictures over boxes), radius 0, no shadow, optional 1px hairline when a flat `--sv-surface-raised` card is unavoidable.
- Image: 3:2 or 4:5, `object-fit: cover`, cool grade. Title may sit below the image, or on it per the image-band treatment (§6). Hover: image scales to 1.03 over `--sv-dur-slow` (see motion.md §3); title underlines.
- Text block: H4 title, small `--sv-ink-secondary` meta line. Entire card is the link.
- Never nest cards; never equal-height icon+heading+text triptychs.

## 9. Forms

From the digital style guide: rectangular fields, 1px `--sv-hairline` border, `--sv-surface-raised` fill, 48px tall, 16px Regular, 16px side padding.

- Label above the field: 15px Medium, ink. Placeholder: `--sv-gray-dark` (light) / `--sv-gray-light` (dark) — never the only label.
- Focus: border-color → ink + focus-visible ring. Error: 1px black border + 13px error line naming the problem and fix; no red exists in this system — errors are typographic.
- Newsletter/contact rows: field + ink button flush-joined (button overlaps the field's right edge, both 48px).

## 10. Footer

Black (`.sv-dark`) full-bleed section: composed wordmark left (24px text), two-line nav columns, legal line in 13px Light `--sv-gray-light`, hairline `--sv-gray-dark` above the legal row. Optional cropped outline-S supergraphic bleeding off the right edge.

## 11. Iconography

The brand defines no icon set — keep interfaces nearly icon-free. When unavoidable (menu, close, arrows, external link): author 24px SVGs, 1.5px stroke, square terminals, currentColor, geometry echoing the symbol's 60° angles. No icon libraries with rounded/filled styles, no emoji.
