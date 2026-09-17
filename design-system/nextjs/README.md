# Share Ventures × Next.js

**Next.js (App Router) is the default stack for all Share Ventures sites.** This kit maps the design system onto it with drop-in files. The design rules themselves live in `../AGENT.md` (binding) and the deeper docs; `../demo/index.html` remains the visual truth — a vanilla build of the exact same system, kept so the design language never depends on a framework.

## Setup

```bash
npx create-next-app@latest my-site --ts --app --no-tailwind   # Tailwind optional, see below
cd my-site
npm i three @types/three
```

1. **Vendor the design system into the repo** (recommended — agents and humans see everything in-repo):
   ```bash
   cp -R ~/Work/share/design-system ./design-system
   rm -rf ./design-system/demo/agent-test.html   # test artifact, not needed in products
   ```
2. **Styles:** copy `nextjs/app/globals.example.css` → `app/globals.css` (fix the two `@import` paths). This pulls in `tokens/tokens.css` + `nextjs/styles/sv-base.css`.
3. **Fonts:** `layout.example.tsx` is portable and uses the sanctioned Arial fallback. Use Aeonik Pro only when its licence-managed source covers the deployment domain; configure that source in the consuming app. Do not copy or commit font files from this repository.
4. **Components:** copy `nextjs/components/*` → `components/sv/` in your project. Small client islands: `Nav`, `Scene`, `RevealObserver`, `WordCycle`, `Stat` — plus `Wordmark`, the composed brand mark (no client JS; Nav renders it for you, `<Nav product="OS" …/>` brands a product surface). Everything else stays server components using the `sv-*` CSS classes.
5. **Logos:** the wordmark is self-contained (inline S paths, currentColor) — no logo files needed for the nav or footer. Copy `design-system/assets/logos/SV_Symbol_*.svg` → `public/logos/` only for favicons or supergraphics.
6. **Images:** allow your stock/CDN hosts in `next.config.mjs`:
   ```js
   const nextConfig = {
     images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
   };
   export default nextConfig;
   ```

## How the system maps to Next.js

| System concept | Next.js expression |
|---|---|
| Tokens | `tokens.css` imported once in `app/globals.css`. Never re-declare values in JS/CSS-in-JS |
| Aeonik Pro | The token stack falls back to Arial. A covered production app may add its own authorised `next/font/local` source and map it to `--font-aeonik`. |
| Photography | `next/image` — `fill` + `style={{objectFit:'cover'}}` inside the `.sv-band`/`.sv-tile__media` containers, honest `sizes`, `priority` only on the hero |
| Components | Server components with `sv-*` classes (buttons, splits, bands, tiles, forms, footer are plain markup — see JSX snippets below) |
| Motion | Client islands only: `<RevealObserver/>` activates `[data-reveal]`; `<WordCycle/>`; `<Stat/>` count-ups. CSS handles all hovers |
| Scene mode | `<Scene/>` is mounted once in `app/layout.tsx`, but the S appears only where it teaches a section rule. `split:1` separates its two production paths; `split:0` interlocks them. Give those paired sections `sv-scene-chapter` so each state gets one viewport. Use `o:0` everywhere the mark has no job |
| Dark sections | `className="sv-dark"` — tokens flip and apply their own ink color |
| Reduced motion | Handled inside the tokens + each island; nothing extra to wire |

## Section snippets (server components)

```tsx
{/* Hero (photographic default) */}
<section className="sv-hero sv-dark" data-scene='{"x":0.36,"y":-0.31,"s":0.68,"o":1,"tone":0}' data-scene-label="Overview">
  <Image src="…" alt="" fill priority style={{ objectFit: 'cover' }} sizes="100vw" />
  <div className="sv-band__scrim" />
  <div className="sv-hero__content sv-container">
    <h1 className="sv-display">
      <span className="sv-hero__share">Share</span><br />
      <WordCycle words={['Potential', 'Progress', 'Innovation']} />
    </h1>
  </div>
</section>

{/* Editorial split */}
<section className="sv-section" data-scene='{"x":0.38,"y":0.3,"s":0.24,"o":0.9,"tone":1,"ry":0,"rx":0}' data-scene-label="The model">
  <div className="sv-container sv-split">
    <aside>
      <h2 className="sv-label">The model</h2>
      <p className="sv-rail-copy">…</p>
    </aside>
    <div className="sv-stack" data-reveal>
      <h3 className="sv-h2">One firm, two engines</h3>
      <p className="sv-intro sv-measure">…</p>
    </div>
  </div>
</section>

{/* Image band */}
<section className="sv-band" aria-label="Share Progress" data-scene='{"x":0,"y":-0.1,"s":0.5,"o":0,"tone":0}' data-scene-label="Progress">
  <Image src="…" alt="" fill loading="lazy" style={{ objectFit: 'cover' }} sizes="100vw" />
  <div className="sv-band__scrim" />
  <div className="sv-band__content sv-container">
    <h2 className="sv-display"><span className="sv-hero__share">Share</span><br /><span className="sv-hero__word">Progress</span></h2>
  </div>
</section>

{/* Buttons — ink is the default; ONE green per page (the closing CTA) */}
<a className="sv-btn sv-btn--ink" href="/work">Work with us</a>
<a className="sv-btn sv-btn--primary" href="/connect">Connect with us</a>
```

## Tailwind (optional)

The system is plain CSS first. If a project wants Tailwind utilities for layout plumbing:

```js
// tailwind.config.js
module.exports = {
  presets: [require('./design-system/tokens/tailwind.preset')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
};
```

Utilities may handle spacing/layout; brand-visible styling (buttons, type styles, bands) stays on the `sv-*` classes so every site renders identically.

## Rules that still bind (framework changes nothing)

Green rare (one element per page) · composed wordmark only (bold lowercase "share" + light descriptor, provided component) · Aeonik→Arial only · radius 0 · image-led with "Share ___" on photography ("Share" prominent) · one authored motion moment per viewport · WCAG AA · no invented metrics. Full contract: `../AGENT.md`.
