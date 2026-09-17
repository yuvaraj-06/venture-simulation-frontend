# Share Ventures Design System

**3.0.0 · Released 2026-08-27** · Derived from `assets/ShareVentures_Brand_Guidelines.pdf` (Brand Guidelines v1.0, Studio Michael Collinge) and the official logo pack.

A replicable design language for every Share Ventures landing page and website. Agents should start with the bundled `share-ventures-design-system` skill; `AGENT.md` remains the compact, binding contract.

---

## The system in one paragraph

Restrained, timeless, and image-led: black, white, and gray give the interface quiet structure while high-resolution colour photography supplies the energy. The signature move is a "Share Progress" / "Share Innovation" headline set directly on a full-bleed image. Aeonik Pro carries huge, quiet type; green (`#00D65D`) is rare — one element per page, the single action that matters. The hexagonal S is logo, texture, and the only 3D object. Surfaces are flat and sharp-cornered; motion is rare, fast-in/soft-landing, and always earns its place.

## Contents

| File | What it is |
|---|---|
| **`AGENT.md`** | **Start here for building.** Self-contained agent contract: hard rules, inline tokens, component specs, motion recipes, QA checklist. Paste it into any agent's context to get consistent output |
| **`skills/share-ventures-design-system/`** | **Start here with any agent.** Portable Agent Skill that routes each task to the relevant rules, tokens, implementation kit, and verification path |
| `foundations.md` | Brand essence, logo rules, color, typography, layout/grid, imagery, voice |
| `components.md` | Nav, hero, buttons, links, editorial split, stats, cards, forms, footer, icons |
| `motion.md` | Animation guidelines: principles, tokens, hero build, scroll reveals, micro-interactions, budgets |
| `graphics-3d.md` | Supergraphics, 3D visualization rules (subjects, materials, lighting, three.js stack, perf budgets) |
| **`nextjs/`** | **Next.js kit (the default stack):** setup guide, `sv-base.css` component styles, and client islands — `Nav`, `Scene` (persistent 3D teaching object + current-section readout), `RevealObserver`, `WordCycle`, `Stat` — plus example `layout.tsx`/`globals.css` |
| `tokens/tokens.css` | **Canonical tokens** — CSS custom properties incl. `.sv-dark` context + reduced-motion |
| `tokens/tokens.json` | W3C design-tokens format (for Figma/Style Dictionary pipelines) |
| `tokens/tailwind.preset.js` | Tailwind preset mirroring the tokens |
| `assets/logos/` | Web-ready SVG/PNG logo + symbol (black/white) · `print/` EPS masters |
| `assets/fonts/` | Licence terms and secure deployment guidance for Aeonik Pro, no font binaries |
| `assets/ShareVentures_Brand_Guidelines.pdf` | The source brand book |
| `demo/index.html` | Living reference page: tokens, type, components, motion, and a real-time 3D extrusion of the S symbol. Open directly in a browser |
| `VERSION` / `package.json` / `CHANGELOG.md` | Canonical release number, machine-readable package metadata, and dated release history |

## Quickstart

**Next.js site (the default)** — follow `nextjs/README.md`: vendor this `design-system/` directory into the repo, copy the example `layout.tsx`/`globals.css`, copy `nextjs/components/*` to `components/sv/`, logos to `public/logos/`.

**Static/vanilla page (one-offs only)**

```html
<link rel="stylesheet" href="design-system/tokens/tokens.css">
<link rel="stylesheet" href="design-system/nextjs/styles/sv-base.css">
<!-- then build per AGENT.md / components.md; demo/index.html is the reference -->
```

**Tailwind project**

```js
// tailwind.config.js
module.exports = {
  presets: [require('./design-system/tokens/tailwind.preset')],
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
}
```

**With an AI agent**

> "Use `design-system/skills/share-ventures-design-system/SKILL.md` and release 3.0.0. Build the [X] page in Next.js from the vendored design system; follow its routing and verification workflow."

**Fonts** — Aeonik Pro is a commercial face from [CoType Foundry](https://cotypefoundry.com). This repository does not distribute font files. Use only an authorized, licence-managed deployment source for a covered domain; otherwise Arial is the sanctioned fallback.

## Give the system to agents

Keep the design system in the product repository so the agent can inspect the real tokens, components, assets, and visual reference. Pin it as a private Git submodule:

```bash
git submodule add https://github.com/sharevc/design-system.git design-system
git -C design-system checkout v3.0.0
git add .gitmodules design-system
```

Expose the bundled portable Agent Skill from an agent-neutral project path:

```bash
mkdir -p skills
ln -sfn ../design-system/skills/share-ventures-design-system \
  skills/share-ventures-design-system
git add skills/share-ventures-design-system
```

The submodule records the exact design-system commit. The symlink keeps the
project skill on that same release. To upgrade, fetch a newer tag inside
`design-system/`, check it out, review the changelog, and commit the new
submodule pointer.

The skill uses the portable `SKILL.md` format and has no dependency on Claude
Code or another agent runtime. Any file-capable agent can consume it directly by
path or as a packaged `.skill` file. A product may additionally link the same
folder into a tool-specific discovery directory without copying or forking it.

Agents without skill discovery should receive
`skills/share-ventures-design-system/SKILL.md` in context plus the path to the
checked-out design-system root. The skill routes them to identity, components,
motion, 3D, tokens, Next.js, and verification references instead of loading
every file.

This repository contains no licensed font binaries. Keep the CoType licence terms and secure deployment guidance intact; never vendor, commit, or redistribute Aeonik Pro files with it.

## Versioning

The system follows Semantic Versioning:

- **Patch** (`1.0.x`): corrections that do not change existing token, class, asset, or component contracts.
- **Minor** (`1.x.0`): additive tokens, components, patterns, or optional behavior.
- **Major** (`x.0.0`): incompatible changes to tokens, classes, assets, component APIs, or binding design rules.

Every release updates `VERSION`, `package.json`, this README, and `CHANGELOG.md`, then receives a matching Git tag and GitHub release.


## Non-negotiables (the 5-second version)

1. Brand chrome uses the 9 brand hexes; colour photography and a minimal, purposeful venture/semantic palette are permitted. Green `#00D65D` is rare — at most one green element per page, all other buttons ink.
2. Logo in black or white only. Official logo assets stay as supplied. The web brand mark is composed — S logomark + bold lowercase "share" + light descriptor: **share ventures** for the firm, **share OS** for the product; clear space = S height.
3. Aeonik Pro → Arial. No look-alike substitutes.
4. Image-led: photography with headlines on top is the core theme. Radius 0. No decorative shadows. Sentence case.
5. One authored motion moment per viewport; full reduced-motion support; WCAG AA.

## Governance

- `tokens/tokens.css` is the single source of truth for values; `tokens.json` and the Tailwind preset mirror it — update all three together.
- Release metadata must agree across `VERSION`, `package.json`, this README, `CHANGELOG.md`, and the Git tag.
- The brand book PDF wins on identity questions (logo, color roles, type); this system wins on digital execution details it defines (exact scales, motion, 3D), which extend the book.
- Known erratum: brand book p.21 labels the CTA green "#0038C7" (a blue) — typo. Canonical green is `#00D65D` per the digital style guide page (p.31).
