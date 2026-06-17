# Share Ventures Design System — Venture Simulation Frontend

Canonical reference for this app. Source of truth: `/home/ubuntu/.hermes/workspace/brand/SHARE_VENTURES_DESIGN_SYSTEM.md`.

## Mode
Light editorial. Background `#F1F4F5` / `#FFFFFF`, text `#000000`. Dark emphasis bands `#2B3033` on hero sections only (never dark whole-body).

## Greyscale tokens
```
--black     #000000
--white     #FFFFFF
--xdark     #2B3033   /* dark band / emphasis bg */
--dark      #5E6366
--mid       #939799
--light     #C8CBCC
--offwhite  #E8E6E4   /* hairline borders */
--bg        #F1F4F5   /* canvas */
```

## Functional colors (use ONLY for meaning, never decoration)
- `--cta: #00D65D` — live / active / CTA button fill / "answer" cells.
- `--ink: #0A7D3C` — green-as-text on white (positive metrics, links).
- `--accent-orange: #8A6D3B` — restrained warning.
- `--accent-red: #C0392B` — error / no-go.

Green is reserved for actual signal. Never apply it as a decorative accent.

## Hard bans
- No blue `#2335CC` or any blue.
- No em dashes `—` or en-dashes `–` in body copy (numeric ranges like `12-14x` are fine).
- No emojis in UI — every glyph goes through `<Glyph name="..." />` (concept SVG).
- No `#111111` — use pure `#000000`.
- No bg-on-bg borders (border same color as page bg reads invisible). Use `--offwhite #E8E6E4` for hairlines on `--bg`.
- No parent Share Ventures corporate logo on product surfaces. Always the **shareOS** product wordmark lockup.
- No decorative stock photography. Real photos only when subject IS a real person/product/place.

## Typography
Stack: `'Aeonik Pro', 'General Sans', Arial, sans-serif`. General Sans (Fontshare) is the approved Aeonik stand-in — already wired in `layout.tsx`.

- Display/hero: 56–72px, weight 600, line-height ~1.05, letter-spacing -0.02em, **lowercase preferred**.
- H1: 32–44px, weight 600.
- Body: 14–16px, weight 400, line-height 1.6.
- Caption / eyebrow: 11px, weight 600, letter-spacing 0.12em, UPPERCASE.

## Components
- `<Brand />` — product wordmark lockup: hexagon-S symbol + `shareOS™`. `on-dark` flips to white.
- `<Glyph name="..." />` — monochrome inline SVG, stroke=currentColor. Maps every emoji we used.
- `<Gauge value={0..1} />` — circular stat gauge, the unifying workshop motif.
- `.dark-band` — emphasis hero band with ghost-S at 3% opacity.

## Layout grammar (workshop visualization-first)
- Hairline card grids: `display: grid; gap: 1px; background: var(--offwhite);` — cells fill white, the 1px gap reads as a divider.
- Stat-gauge row over plain numbers wherever you have a 0..100% or n-of-N value.
- 7-stage journey strip (`Explore → Exit`) as filled segments on every venture card.
- Section eyebrow + thin divider, not big white space.

## Visualization priority (per Hamet, workshop canon)
1. Concept-explaining SVG diagram
2. Chart / data viz
3. Real photo (subject only, never decorative)

Never use AI-generated illustrations or stock decorative imagery.
