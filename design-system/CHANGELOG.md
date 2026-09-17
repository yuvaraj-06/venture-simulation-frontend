# Changelog

All notable changes to the Share Ventures Design System are recorded here. Releases follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-08-27

### Changed

- **Breaking — web firm wordmark casing.** The composed web wordmark now reads **share ventures**, with lowercase "share" in Bold (700) and lowercase "ventures" in Light (300).
- Product descriptors retain their proper casing, so the Share OS product mark remains **share OS**. Lowercasing "ventures" does not create a global lowercase transform for product names.
- Updated the `Wordmark` component default and canonical examples. A case-insensitive `Ventures` product input is normalized to the lowercase web firm mark for compatibility.

### Unchanged

- Official fixed logo assets remain exactly as supplied. They are not recased, redrawn, or modified.

## [2.0.1] - 2026-08-17

### Changed

- Corrected photography guidance: Share photography is high-resolution colour imagery with real colour, material, and human warmth.
- Clarified that black, white, and gray restrain brand chrome while colour belongs in photography and justified semantic graphics/data visualisation.
- Clarified that new ventures may extend the family with a minimal, justified palette, including tasteful semantic graphics and data visualisation.

## [2.0.0] - 2026-08-06

### Changed

- **Breaking — new brand mark.** The wordmark is now composed live: the S logomark followed by lowercase "share" in Aeonik Pro Bold (700) and the descriptor in Light (300) — share Ventures for the firm, share OS (etc.) for products. The fixed "Share Ventures™" lockup files are demoted to print/document use.
- Navigation and footer render the composed wordmark in `currentColor`, so the mark crossfades with the bar's surface instead of swapping white/black image files.
- `AGENT.md` hard rule 3, `foundations.md` §2, `components.md` §1/§10, and the agent skill's build/review checks now specify the composed wordmark instead of forbidding recomposition.

### Added

- `.sv-wordmark` styles in the living demo and `nextjs/styles/sv-base.css` (size via `--sv-wordmark-size`).
- `nextjs/components/Wordmark.tsx` — the composed mark as a reusable component; `Nav` accepts a `product` prop (`<Nav product="OS" …/>` → share OS).
- `demo/wordmark-explorations.html` — decision sheet comparing case and weight treatments for the wordmark (firm + product marks on dark/light surfaces). The final case/weight selection is pending; the sheet will be deleted once a direction is locked in.

### Removed

- `.sv-lockup--w` / `.sv-lockup--b` white/black image-swap classes; `Nav` no longer needs logo files copied into `public/logos/`.

## [1.0.2] - 2026-08-06

### Changed

- Added mandatory routing from every Share Ventures deck, presentation, slide viewer, and deck composer into the `deck-agent` extension.
- Clarified precedence: the canonical design system governs identity while Deck Agent governs deck content, components, interaction, and delivery.

## [1.0.1] - 2026-08-05

### Changed

- Moved the canonical Agent Skill from the Claude-specific `.claude/skills/` path to the agent-neutral `skills/` directory.
- Updated installation guidance so any file-capable agent can consume the same pinned `SKILL.md`, while tool-specific discovery remains an optional adapter.

## [1.0.0] - 2026-08-05

### Added

- Brand foundations, component rules, motion language, and 3D guidance derived from the Share Ventures brand book.
- Canonical CSS tokens with matching W3C design tokens and Tailwind preset.
- Next.js App Router kit with reusable navigation, reveal, word-cycle, statistics, and semantic 3D scene components.
- Living browser reference covering typography, color, photography, components, motion, and the Share Ventures S.
- Share Ventures design-system skill for agent discovery, document routing, implementation, and review.

### Established

- The production S as a still, physically metallic teaching object whose movement must explain a section rule.
- Layering and no-fly-zone rules that keep the 3D scene clear of reading content, navigation, and the footer.
- Website scene readout as a section title only, without slide pagination or a progress strip.

[3.0.0]: https://github.com/sharevc/design-system/releases/tag/v3.0.0
[2.0.1]: https://github.com/sharevc/design-system/releases/tag/v2.0.1
[2.0.0]: https://github.com/sharevc/design-system/releases/tag/v2.0.0
[1.0.2]: https://github.com/sharevc/design-system/releases/tag/v1.0.2
[1.0.1]: https://github.com/sharevc/design-system/releases/tag/v1.0.1
[1.0.0]: https://github.com/sharevc/design-system/releases/tag/v1.0.0
