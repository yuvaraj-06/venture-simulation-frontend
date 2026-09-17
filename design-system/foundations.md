# Foundations

Share Ventures Design System 3.0.0 · Released 2026-08-27 · Source of truth: `assets/ShareVentures_Brand_Guidelines.pdf` (Brand Guidelines v1.0, Studio Michael Collinge)

This file defines the non-negotiable base layer: brand, logo, color, typography, layout, and imagery. Components, motion, and 3D build on top of it and may never contradict it.

---

## 1. Brand essence

Share Ventures is about **human potential** — creativity, growth, endeavour, advancement. A technology-enabled venture firm operating a foundry and a fund at the intersection of AI and human performance.

**Brand values:** Visionary · Performance · Quality · Best of the best.

Every design decision should read as: *confident, timeless, precise, quietly premium*. The identity is deliberately restrained so the work (imagery, stories, numbers, products) provides the color and energy.

### Design principles (derived for digital)

1. **Restrained chrome, vivid content.** The brand expresses its UI in black, white, and gray. High-resolution colour photography and film provide the page’s energy; selective graphics and data visualisation may use a justified semantic palette. The green CTA accent is rare — a page usually earns exactly one green element.
2. **Image-led storytelling.** The signature move of the identity is a striking full-bleed image with a "Share ___" headline set directly on top of it. Pages should be rich with photography; type-on-image is the default hero and section-opener treatment, not the exception.
3. **Type does the talking.** Large, unadorned Aeonik headlines and generous whitespace carry the hierarchy. No decorative devices, no gradient text, no ornaments.
4. **The S is the world.** The hexagonal S symbol is the hero — as logo, as cropped supergraphic texture, as outline, and as the only sanctioned 3D brand object.
5. **Quiet surfaces, cinematic content.** Flat, sharp-cornered surfaces and hairline rules frame the imagery; the UI recedes so the pictures and words can lead.
6. **Confident restraint in motion.** Few, authored moments with exponential ease-outs. Nothing bounces, nothing spins, nothing begs.
7. **Spatial continuity (scene mode, opt-in).** Flagship pages may behave like one continuous scene: a single persistent 3D object travels with the visitor and re-stages itself per section, framed by a quiet HUD readout — game-like presence, brand-grade restraint. Spec in `graphics-3d.md` §6.
8. **Venture latitude.** New ventures may introduce a small, purposeful colour palette when it expresses their product or market. It must remain minimal, accessible, and coherent with Share’s quiet, image-led family resemblance; it does not recolour the Share mark or turn UI chrome into decoration.

### The "Share ___" headline device

To build recognition, headlines activate the word **Share** as a verb: *Share Progress. Share Innovation. Share Vision. Share Ideas. Share Potential.*

- Typeset on one or two lines, sentence case.
- **"Share" is always the prominent word:** full ink (`--sv-ink`) at Medium (500), never muted. The activation word may step back to `--sv-ink-secondary` at Regular (400) — or both words can sit in full ink. Never the reverse (a muted "Share" with a louder second word), and never green.
- Use it for heroes and section openers, not for every heading on the page.

---

## 2. Logo

Files live in `assets/logos/` (web SVG/PNG) and `assets/logos/print/` (EPS).

| Asset | Use |
|---|---|
| `SV_Symbol_Black.svg` / `SV_Symbol_White.svg` | The S symbol alone — favicons, supergraphics, merchandise, tight square spots — **and the source of the S paths inlined in the composed wordmark** |
| `SV_Logo_2Lines_H_*_web.svg` | Legacy fixed "Share Ventures™" lockup tight-cropped to its bounds (viewBox `356.87 359.64 1224.04 360.72`, ratio ≈ 3.39:1) — documents and surfaces that cannot run live text; **not the web UI brand mark** |
| `SV_Logo_2Lines_H_Black.svg` / `SV_Logo_2Lines_H_White.svg` | Same fixed lockup on its original padded canvas (clear space built in) |
| `print/*.eps` | 1-line and vertical lockups + all print masters |

### The composed wordmark (the brand mark for web UI)

The web wordmark keeps the S logomark and sets the name in live Aeonik Pro text: **lowercase "share" in Bold (700)**, then the descriptor in **Light (300)**. The firm mark is specifically **share ventures**, with both words lowercase. Product descriptors retain their proper casing, e.g. **share OS**. Lowercasing "ventures" is a firm-wordmark rule, not a transform applied to product names. The bold/light contrast *is* the mark; never equalize the weights, reverse them, capitalize "share", or restyle the spacing. Official fixed logo assets remain exactly as supplied and are not recased or altered.

- One line, sentence case, symbol and text vertically centered; symbol height ≈ 1.6× the text size, gap ≈ 0.5em, letter-spacing −0.01em.
- The whole mark renders in `currentColor` — black or white only, inherited from its surface (so it crossfades with the nav's solid state instead of swapping image files).
- The S is the official artwork: inline the two S paths from `SV_Symbol_*.svg` with `fill: currentColor`; never redraw, distort, or re-proportion them. The file's small ™ glyphs are omitted at wordmark scale (illegible); ™ is handled typographically — a superscript ™ follows "Ventures" in the firm mark, product marks carry none.
- Use the provided implementations: `.sv-wordmark` (demo / `nextjs/styles/sv-base.css`) or the `Wordmark` server component (`nextjs/components/Wordmark.tsx`).
- Minimums: wordmark text ≥ 16px; symbol alone ≥ 24px. Below ~360px viewports the symbol may stand alone.

```html
<span class="sv-wordmark">
  <svg class="sv-wordmark__symbol" viewBox="125.85 116.8 828.3 933.4" aria-hidden="true"><!-- S paths from SV_Symbol_*.svg (tight-cropped to the S ink) --></svg>
  <span class="sv-wordmark__text"><b class="sv-wordmark__share">share</b> <span class="sv-wordmark__product">ventures<span class="sv-wordmark__tm">™</span></span></span>
</span>
```

### Rules (from the brand book — treat as hard constraints)

- The logo, symbol, and wordmark are reproduced in **black or white only**. Never green, never gray, never any other color. Pick whichever gives the strongest contrast against the background.
- **Clear space** on all sides = the height of the S symbol in the mark. Nothing enters this zone.
- **Minimum widths (fixed lockup artwork, print/document use)** — 2-line horizontal: 120px / 18mm · 2-line vertical: 80px / 12mm · 1-line horizontal: 180px / 24mm · 1-line vertical: 120px / 16mm. Composed wordmark minimums are listed above.
- **Positioning:** the wordmark sits left-aligned (top-left or bottom-left of the layout); vertical print lockups sit centered. In practice for web: composed wordmark top-left in navigation.
- Never distort, recolor, outline (except the sanctioned supergraphic outline treatment), add effects to, or re-draw the logo.

### Supergraphic (the S as texture)

The S symbol may be scaled up and cropped to become a secondary background graphic:

- **Tint fill:** a soft tint of the background color — e.g. `--sv-gray-xdark` S on a black section, `#e3e6e7`-range tint on a light section. It should read as texture, not as a second logo. Keep contrast with the background low (roughly 3–8% luminance difference).
- **Outline:** a 1px (hairline) outlined S for a more technical, subtle tonality — used over photography or flat fields.
- Crop confidently: showing 30–70% of the symbol at 1.5–4× viewport height is the signature move. Anchor it to a corner or edge; let it bleed off-canvas.
- One supergraphic per viewport, maximum. Body text never sits on top of high-contrast supergraphic edges.

---

## 3. Color

Tokens: `tokens/tokens.css` (canonical), `tokens/tokens.json`, `tokens/tailwind.preset.js`.

### Palette

| Token | Hex | Role |
|---|---|---|
| `--sv-black` | `#000000` | Core brand color. Text on light; surface for dark sections |
| `--sv-white` | `#ffffff` | Core brand color. Text on dark; raised surfaces on light |
| `--sv-home-bg` | `#f1f4f5` | Default digital page background (cool) |
| `--sv-off-white` | `#e8e6e4` | Warm alternative surface (editorial/print-leaning) |
| `--sv-gray-light` | `#c8cbcc` | Hairlines on light; secondary text on dark |
| `--sv-gray-mid` | `#939799` | Tertiary/decorative text only — fails contrast for body |
| `--sv-gray-dark` | `#5e6366` | Secondary text on light; hairlines on dark; mid surfaces |
| `--sv-gray-xdark` | `#2b3033` | Dark surfaces; raised surfaces on black |
| `--sv-green` | `#00d65d` | **CTA green. Interactive elements only** |

> ⚠️ The brand PDF (p.21) prints "RGB 0/56/199 · #0038C7" beside the green swatch — that hex is a blue and is a typo. The digital style guide (p.31) gives **`#00D65D` (RGB 0 214 93)**, which matches the printed swatch and is canonical for this system.

### Usage rules

- **Green is rare.** It exists for the single most important action on the page — the one conversion moment (e.g. "Connect with us" in the closing CTA). Everything else interactive is ink: black buttons on light, white buttons on dark, underlined links. As a rule: **one green element per page**, never more than one per viewport; focus rings and small live indicators are the only other sanctioned uses. Green never colors headlines, icons-as-decoration, backgrounds, illustrations, or the logo. A page dripping with green reads as off-brand even if every use is a button.
- Sections are **light by default** (`--sv-home-bg`), with black (`#000`) used for cinematic/hero moments. Alternate deliberately; avoid zebra-striping every section.
- `--sv-gray-mid` (#939799) is below 4.5:1 on both white and black — restrict it to large decorative type (≥24px) or non-essential labels.
- Apply the `.sv-dark` class (see tokens.css) to dark sections so all semantic tokens flip together. Never hand-pick one-off grays.
- Everything else on the page is content: photography, film, and 3D renders carry the color.

### Contrast floors (WCAG AA)

Body and UI text ≥ 4.5:1; large text (≥24px or 18.66px bold) ≥ 3:1; interactive boundaries ≥ 3:1 against adjacent colors. Verified-safe pairs: black on all light surfaces; white on black and `--sv-gray-xdark`; `--sv-gray-dark` on light surfaces; `--sv-gray-light` on black/x-dark; black on green.

---

## 4. Typography

**Typeface:** Aeonik Pro (CoType Foundry) — a neo-grotesque with a subtle technical edge. **Fallback:** Arial (explicitly sanctioned by the brand book). Do not substitute look-alike fonts (Inter, Helvetica Now, Neue Haas) — if Aeonik Pro is unavailable, use Arial.

Aeonik Pro is licensed software and is not distributed in this repository. Use it only from an authorized, licence-managed deployment source for a covered domain; otherwise use the sanctioned Arial fallback. See `assets/fonts/README.md`.

### Weights

| Weight | Value | Role |
|---|---|---|
| Thin | 100 | Oversized decorative numerals only, sparingly |
| Light | 300 | Technical copy, captions, data labels |
| Regular | 400 | Body copy, intro copy, **XL display headlines**, stat numerals |
| Medium | 500 | H1–H3 headings, nav, buttons |
| Bold | 700 | Subheads and inline emphasis inside body copy |
| Black | 900 | Rare, short, loud statements only — never long text |

Heavier weights are reserved for short, large text. Light weights never go below 13px.

### Scale (tokens)

| Style | Size | Weight | Leading | Tracking |
|---|---|---|---|---|
| Display / XL headline | `clamp(3rem, 8vw, 6rem)` | 400 | 1.02 | −0.02em |
| H1 | `clamp(2.5rem, 5vw, 3.5rem)` | 500 | 1.1 | −0.01em |
| H2 | `clamp(2rem, 3.5vw, 2.5rem)` | 500 | 1.1 | −0.01em |
| H3 | 28px | 500 | 1.15 | −0.01em |
| H4 | 20px | 400 | 1.3 | 0 |
| Intro | 24px | 400 | 1.35 | 0 |
| Body | 18px | 400 | 1.6 | 0 |
| Small | 15px | 400 | 1.5 | 0 |
| Caption / technical | 13px | 300–400 | 1.45 | 0 or 0.04em caps |
| Stat numeral | `clamp(4rem, 10vw, 8rem)` | 400 | 1 | −0.02em |

### Rules

- Sentence case everywhere — headlines, nav, buttons. The brand never shouts in caps except tiny technical labels (13px, +0.04em tracking), used sparingly.
- Body measure 65–75ch. Left-aligned, ragged right. No justified text, no centered body copy (centered display headlines are allowed in symmetric hero moments).
- Stat pattern: oversized Regular numeral with a small two-line label set beside its baseline (e.g. **213** / "New companies"). Numerals show Aeonik's technical drawing — never use a different font for numbers.
- One display moment per viewport. If everything is big, nothing is.

---

## 5. Layout & grid

- **Grid:** 12 columns, fluid, `--sv-gutter` (clamp 20–64px) side margins, content max-width `--sv-container` (1440px). Full-bleed imagery and supergraphics may escape the container; text never does.
- **The editorial split** (signature layout, straight from the brand book): a narrow left rail (`--sv-rail`, 288px) carrying a small bold label + supporting Light/Regular copy, with the main content in the remaining columns to the right. Use it for section after section of a landing page; it is the brand's most recognizable page rhythm. Collapses to stacked layout below 900px.
- **Spacing:** 4px base scale (`--sv-space-*`). Between major sections: 96–192px (`--sv-space-24` to `--sv-space-48`). Heading gets more space above than below (roughly 2:1). Related elements cluster tightly (8–24px).
- **Corners:** radius 0 on every element — buttons, inputs, cards, images, video frames. Sharpness is a brand signature. (The only rounded thing in the identity is the symbol's own corner geometry.)
- **Rules & borders:** 1px hairlines in `--sv-hairline`. No drop shadows on flat UI; elevation is expressed with surface tone shifts (white on `#f1f4f5`, `#2b3033` on black). Shadows are permitted only under genuinely floating elements (menus, dialogs): soft, offset, low-alpha black.
- **Breakpoints:** 600 (sm), 900 (md), 1200 (lg), 1440 (xl). Design desktop-first for cinematic heroes but verify every layout at 375px width.

---

## 6. Imagery & photography

Photography direction (brand book §5): **Human · Aspirational · Forward-looking · Quality.**

**Imagery is the core theme, not garnish.** The brand book's own applications — and the websites built from it — are dense with high-resolution colour photography: full-bleed heroes, image bands with "Share ___" headlines set on top, image tiles, portraits fading into flat color. A Share Ventures page with no photography should be the deliberate exception (a pure type statement), never the default. The images supply the colour system.

- **Text on image is the signature treatment.** Display or H1 headlines sit directly on photography — lower-left or left-center, white on dark imagery, black on pale imagery. Use a black gradient scrim (bottom-up or left-in, ≤40% alpha) whenever the image is busy; maintain the 4.5:1 floor by strengthening the scrim, not shrinking the type.
- Subjects: people achieving or working with innovative technology; frontier hardware; labs; earth-from-space and scale imagery. Natural, unstaged moments.
- Grade: high quality, clean, uncluttered, elegantly simple. Use a cool or neutral colour grade and restrained saturation, but retain real colour, material and human warmth. Never desaturate photography, never oversaturate, and never "cheap stock" (forced smiles, office-handshake clichés, white-void product shots).
- Sourcing: premium stock is fine — Unsplash/licensed libraries work when curated to the grade above (the brand book's own examples are stock). Prefer dark, cinematic, texture-rich frames that can hold white type. Always confirm license for commercial web use.
- Silhouette treatments may be used for abstract "human potential" moments, while retaining the colour and tonal character of the surrounding image.
- AI-generated imagery is acceptable if it meets the same bar: photoreal, uncluttered, aspirational, and free of artifacts. It must never depict identifiable real people or fake product claims.
- Delivery: AVIF/WebP, `object-fit: cover`, explicit dimensions, lazy-load below the fold.

---

## 7. Voice (for UX copy)

- Confident, concise, forward-looking. Short declarative sentences. No hype adjectives; let numbers and imagery carry proof.
- Buttons name the action: "Connect with us", "See the portfolio", "Read the thesis".
- Errors name the problem and the fix, in plain language.
- The ™ mark follows "Share Ventures" in lockups and first prominent use, superscripted, not repeated in running text.
