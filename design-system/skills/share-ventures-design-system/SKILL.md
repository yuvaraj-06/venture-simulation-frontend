---
name: share-ventures-design-system
description: Apply the official Share Ventures design system to new work and review existing work for brand compliance. Use this skill whenever a user asks to design, build, redesign, polish, or audit a Share Ventures or Share VC website, landing page, web app, web presentation, component, design token, motion treatment, or 3D brand scene—even when they only say “make it on-brand” or refer to the Share design language.
compatibility: Requires access to the Share Ventures design-system repository or a vendored copy of it.
metadata:
  version: "3.0.0"
  released: "2026-08-27"
  repository: "https://github.com/sharevc/design-system"
---

# Share Ventures Design System

## Deck routing, mandatory

For any Share Ventures deck, presentation, slide viewer, deck composer, or deck modification, load and follow the `deck-agent` extension before building. The canonical design-system repository governs identity and supersedes older deck-agent styling where they conflict, but it does not replace the deck-agent content, component, interaction, and delivery workflow. Web and live-text brand marks follow foundations.md §2: **share ventures** for the firm and **share OS** for the product. Official fixed logo assets remain as supplied. Never distort or recolor the S.

Use the repository as the source of truth. The skill routes you to the right files; it does not replace them.

## Find the design-system root

Use the directory that contains all of these entries:

- `AGENT.md`
- `tokens/`
- `nextjs/`
- `demo/index.html`

Common locations are the current repository root or `design-system/` inside a product repository. If the user provides a path, use it. Do not design from memory when the source files are available.

Read `VERSION` before reporting which release governed the work.

## Read in this order

Start every Share Ventures task with `AGENT.md`. It is the compact, binding digital contract.

Then load only the references needed for the task:

| Task | Read next | Use it for |
|---|---|---|
| Brand identity, logo, type, color, layout, imagery, voice | `foundations.md` | Identity rules and visual foundations |
| Navigation, heroes, buttons, forms, cards, stats, footer | `components.md` | Component anatomy and exact behavior |
| Transitions, reveals, interaction, reduced motion | `motion.md` | Motion purpose, timing, and budgets |
| S supergraphics, 3D material, lighting, scene behavior | `graphics-3d.md` | 3D subject, material, staging, and performance |
| Next.js implementation | `nextjs/README.md`, then the relevant file in `nextjs/components/` or `nextjs/styles/` | Production implementation; reuse rather than rebuild |
| Tokens or theme values | `tokens/tokens.css`, then `tokens/tokens.json` and `tokens/tailwind.preset.js` | Canonical values and mirrored formats |
| Visual comparison or system change | `demo/index.html` | Living visual truth and browser verification target |
| Identity dispute not settled by the system | `assets/ShareVentures_Brand_Guidelines.pdf` | Original brand-book authority |

For non-web work, use the identity, typography, color, imagery, voice, and logo rules from `foundations.md`. Do not force the landing-page anatomy or Next.js kit onto a different medium.

## Resolve conflicts

Use this precedence:

1. The brand book controls core identity: logo, approved colors, typeface, and brand intent.
2. `AGENT.md` controls the digital design contract.
3. `tokens/tokens.css` is canonical for implementation values.
4. `demo/index.html` is the visual reference for browser behavior.
5. `nextjs/` is the production implementation for the default stack.

If two files disagree, fix the design-system source instead of inventing a third convention.

## Build workflow

1. Inspect the target surface, framework, existing components, and available content.
2. State the page's job and choose the quietest Share Ventures composition that accomplishes it.
3. Reuse the provided tokens, assets, CSS classes, and Next.js client islands before writing new code.
4. Keep the experience image-led. Use the “Share ___” device only when the activation word carries the page's actual message.
5. Reserve green for the single highest-priority action. Use ink treatments for other interactions.
6. Compose the web wordmark per foundations.md §2 — S logomark, bold lowercase "share", light descriptor — using the provided `.sv-wordmark` markup or `Wordmark` component. Use **share ventures** for the firm and preserve product casing, e.g. **share OS**. Never restyle its weights, spacing, or color, and never substitute fixed lockup files on web UI. Do not modify the supplied official logo assets.
7. Treat the S as a teaching object, not ambient decoration. Before showing it, finish: “Here the S shows ___.” If the answer is only a mood, hide it.
8. Make motion explain state, hierarchy, continuity, or material. The resting state is still.
9. Exercise the result in a browser at desktop and mobile sizes. Check keyboard access and reduced motion when the surface includes interaction.

## Keep the system synchronized

When changing the design system itself:

- Token change: update `tokens.css`, `tokens.json`, and `tailwind.preset.js` together.
- Reusable component change: update the living demo and the matching `nextjs/` implementation.
- Motion or 3D behavior change: update the implementation and its governing reference document.
- Binding rule change: update `AGENT.md` and the deeper reference that explains the rule.
- Release change: update `VERSION`, `package.json`, the README release line, and `CHANGELOG.md`; tag the same SemVer version.

Do not bump the version for work in a consuming product that does not modify this design-system repository.

## Non-negotiable review checks

Reject or correct work that contains any of these:

- A recolored, distorted, or effect-treated logo, or a wordmark that breaks the composed pattern (bold lowercase "share" + light descriptor, black or white only).
- A typeface other than Aeonik Pro or the sanctioned Arial fallback.
- Rounded cards, generic shadows, gradient text, or decorative glass effects.
- Green used as a general accent instead of the single action signal.
- Invented claims, metrics, portfolio logos, or testimonials.
- Decorative 3D movement, autoplay rotation, idle drift, or scene geometry crossing reading content.
- A slide counter or progress strip on a website scene readout.
- Missing focus styles, insufficient contrast, inaccessible controls, or ignored reduced-motion preferences.

## Delivery format

When implementing, finish with:

- Files changed.
- Design-system release used.
- Rules applied or deliberately not applicable.
- Exact browser sizes and interactions exercised.
- Any missing licensed assets or real content that prevented full fidelity.

When auditing, report concrete violations with file or element locations, the governing design-system rule, and the smallest source-level correction.
