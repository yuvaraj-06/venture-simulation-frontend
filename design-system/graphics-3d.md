# Graphics & 3D

Share Ventures Design System 3.0.0 · Released 2026-08-27 · Rules for supergraphics, generative texture, and 3D visualization on landing pages.

3D exists to make "human potential meets precision engineering" tangible. Every scene should look like a **product-studio shoot of a machined object**, not a tech-demo. If a render would look at home on a crypto landing page, it's off-brand.

---

## 1. The subject hierarchy

What may be rendered in 3D, in order of preference:

1. **The S symbol** — extruded from its exact SVG geometry (assets/logos/SV_Symbol_*.svg), as a machined/monolithic object. The hero use.
2. **Hexagonal derivatives** — prisms, frames, and lattices using the symbol's 60° hexagon geometry (abstract fields, backgrounds, section accents).
3. **Abstract precision fields** — particle grids, wireframe topographies, light lines; restrained and architectural. A small semantic colour set is permitted when it encodes meaning rather than decoration.
4. **Product/scene renders** — photoreal renders of portfolio hardware or environments, following photography rules (foundations.md §6).

Never: mascots, blobs/metaballs, iridescent chrome swirls, glass morphing shapes, low-poly "startup" illustrations, or any second logo-like mark.

## 2. Material language

| Material | Spec | Use |
|---|---|---|
| **Matte monolith** | near-black `#111` – `#2b3033`, roughness 0.6–0.8, metalness 0–0.2 | Static S renders when the silhouette should stay quiet |
| **Machined metal** | graphite `#2b3033` ↔ aluminum `#c8cbcc`, metalness 1.0, face roughness 0.20–0.24, bevel/edge roughness 0.10–0.14, strong neutral studio reflections | Default live 3D S and interactive precision objects |
| **Frosted glass** | white, transmission 0.9, roughness 0.35, thickness ~1 | Light sections; echoes the brand's translucent-panel photography |
| **Paper/ceramic white** | `#e8e6e4`–white, roughness 0.9 | Light heroes, editorial scenes |
- For machined metal, use separate face and bevel materials. Keep clearcoat at 0: a dielectric coat makes the S read as painted plastic. Material recognition comes from sharp edge reflections against broader, rougher face reflections.

- The default material palette is neutral. A restrained, purposeful colour may appear when it carries product or data meaning; it must not recolour the Share mark, compete with the primary CTA, or create decorative UI chrome. **Green appears only as a ≤2% emissive accent** (an edge light, a status line) and only when the object represents something interactive/alive.
- No rainbow gradients, no iridescence, no neon rim-glow.

## 3. Lighting & staging

- **Studio setup:** one large soft key (top-front, slightly camera-left), one dim fill, and one rim/edge light. Use a neutral studio environment with broad bright panels; on the live S, `envMapIntensity` 1.6–2.2 and PMREM blur ≈0.02 preserve readable metal reflections.
- Background always matches a surface token (`#000`, `#2b3033`, `#f1f4f5`, `#e8e6e4`) so the canvas composites seamlessly into the page — the object floats in the page, not in a separate "3D window."
- Shadows: soft contact shadow only (radius large, opacity ≤ 0.35). No hard cast shadows across layout.
- Composition follows the logo-positioning logic: object anchored right-of-center or bleeding off an edge, headline in the clear zone. Keep the symbol's silhouette readable — it is still the logo; don't melt, shatter, or interpenetrate it with other geometry.

## 4. Recommended stack

| Need | Tool |
|---|---|
| Interactive hero scene | Three.js (r160+) — `SVGLoader` → `ExtrudeGeometry` for the S (see demo/index.html for a working reference), or React Three Fiber in React projects |
| Designed static/looping renders | Blender or Cinema 4D + Redshift/Octane, exported as MP4 (H.265/VP9) or AVIF/WebP poster |
| Designer-owned interactive scenes | Spline exports are acceptable if they follow this material/lighting spec and pass the performance budget |
| Scroll-scrubbed cinematic sequences | Pre-rendered image-sequence/video scrub (keeps runtime cost near zero) |

Prefer **pre-rendered video for cinematic fidelity** and **live WebGL only when the scene responds to the user** (pointer, scroll, real data). A 4MB silent loop beats a 4MB JS bundle.

## 5. Motion in 3D (extends motion.md)

- **Rest pose:** still. No autoplay rotation, floating, breathing, or camera drift. A 3D object earns movement only when it demonstrates a state change or answers direct visitor input.
- **Pointer:** no viewport-wide pointer parallax. Pointer motion is allowed only on an explicitly interactive canvas with a visible affordance (for example, drag-to-orbit), and stops on pointer exit or release.
- **Scroll:** use scroll to reveal assembly, material, scale, or pose only when the change teaches the current section. A turn is not a motion concept by itself.
- **Entrance:** scene fades/scales in with the hero build (motion.md §3.1). The S may assemble from its two production paths only when the page introduces those parts as a system, ≤ 1.2s.
- Reduced motion: pin each scene to its representative pose without smooth interpolation, or use the poster where static WebGL adds no value.

## 6. Persistent teaching object — "scene mode"

On a design-system reference, the fixed S can connect sections, but it is not a mascot that follows the viewer. Use it for four jobs only: the complete brand mark, a flat glyph specimen, a metal/material specimen, and the two-part assembly demonstration. Set `o:0` for sections where none of those jobs belongs. A working reference is `demo/index.html`.

### Architecture

- **Layer contract:** section backgrounds < scene (`z-index:50`) < reading content (`z-index:55`) < section readout (`z-index:60`) < navigation (`--sv-z-nav`, 100). At the footer, an opaque mask at 62 and footer content at 65 cover both scene and readout. The canvas may pass behind a content region but must never paint over text, controls, or logos. Keep it `pointer-events:none` and `aria-hidden="true"`.
- **Sections declare their scene state** in markup, so the choreography is content-owned and agent-readable:
  ```html
  <section data-scene='{"x":0.38,"y":0.30,"s":0.24,"o":0.9,"tone":1}' data-scene-label="Type system">
  ```
- `x/y` = viewport-fraction offset from center (+y down) · `s` = scale multiplier · `o` = layer opacity (0 hides it) · `tone` = 0 graphite ↔ 1 aluminum · `ry`/`rx` = authored pose in radians (defaults 0 / 0.18) · `split` = separation of the two production S paths, from interlocked (0) to apart (1).
- **Driver:** on scroll, resize, or an explicit interaction, compute a reference line (`scrollY + 35% viewport`), find the surrounding pair of sections, smoothstep-mix their states, then **damp toward the target** (`cur += (target − cur) × 0.08`). Schedule frames only until the state settles.
- **Tone response:** lerp the metal color from graphite `#2b3033` to aluminum `#c8cbcc` and rebalance the studio lights (strong rim on dark, soft fill on light) so the object reads on every surface without ever using a non-brand color.
- **The job test:** before implementing a visible state, finish the sentence "Here the S shows ___." Acceptable answers name a section rule, not a mood. If the sentence fails, hide the S.

  | Section subject | The object performs it as |
  |---|---|
  | Overview / brand | Complete metallic mark, still, in the upper-right clear zone — establishes the production geometry without crossing hero copy |
  | Typography | Flat and frontal (`ry:0, rx:0`) — the mark becomes a glyph specimen |
  | Color | Same stage and scale; mid-gray metal shifts to aluminum — the mark becomes a live material chip |
  | Photostyle | Hidden (`o:0`) — photography leads |
  | Data | Hidden (`o:0`) — the numbers carry the proof |
  | Components | Two production paths separated (`split:1`) — shows independently useful parts |
  | Motion | Paths interlock (`split:0`) as the section enters — scroll causes assembly, then the mark holds |
  | CTA / close | Complete mark returns at monument scale and holds — the system resolves to the brand |

  Placement mechanics: author every state against DOM no-fly rectangles, not the canvas alone. Keep at least 24px between the projected object and hero copy or reading panels. Give an assembly pair at least one viewport per state (`min-height:100svh`) so the parts can be read before they interlock. Hide (`o:0`) over photography, data, and any section where the mark adds no information. The footer must mask the scene at its boundary while the CTA state fades out.

### Current-section readout

Use one quiet, fixed label at the bottom-left: the current `data-scene-label`, set in 13px Light caps with +0.04em tracking. Ink flips between white and black with the active section's `tone`. Keep it `aria-hidden="true"` because the visible section heading already exposes the same information.

Do not add a progress hairline or `04 / 10` position index to a website. The browser scrollbar already communicates progress, and pagination makes the page feel like a slide deck. Actual presentation decks own their pagination outside the shared scene component.

### Deep links

Support `#s=N` (deck convention): on load, jump-scroll to section N. Sections remain normal DOM — the scene layer is presentation only.

### Fallbacks

No WebGL / context lost → remove the layer, show the hero's static outline-S supergraphic; the current-section readout (plain DOM) keeps working. Reduced motion → object pins immediately to each section's authored pose. Mobile → scale ×0.42 and opacity ×0.8. Small teaching specimens move to the right clear zone and lift 36%; monument states lift only 18% so they clear the navigation, then bias another 16% toward their declared edge. Skip entirely below 360px.

## 7. Performance budget (hard limits)

- JS payload for a 3D hero: ≤ 200KB gzipped including three.js; textures ≤ 1.5MB total (KTX2/basis or ≤2048px); geometry ≤ 150k triangles.
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`; antialias on; shadows off or single soft map ≤ 1024px.
- Render on demand: schedule frames on scroll, resize, or explicit interaction and continue only until damping settles; stop immediately under `document.hidden`. A perpetual rAF loop is prohibited for a scene that is otherwise still.
- Lazy-init below-the-fold scenes on approach (IntersectionObserver, `rootMargin: '50%'`). The hero scene may init eagerly but must not block LCP: paint the poster/headline first, canvas fades in when ready.
- Always ship a static poster fallback for no WebGL, WebGL context loss, and crawlers. Reduced motion may use the poster or one static WebGL frame. `<canvas>` carries `aria-hidden="true"`; meaning lives in the DOM.

## 8. 2D graphics & texture

- **Supergraphic:** the cropped S (tint or 1px outline) per foundations.md §2 — the default way to give a section graphic presence without 3D.
- **Hex grid:** a fine 1px hexagonal lattice (60° geometry, `--sv-hairline` at 30–50% alpha) may texture dark sections behind data or diagrams. Cell size ≥ 48px; never behind body text.
- **Diagrams:** 1px strokes, square terminals, Aeonik Light labels (13px), and a restrained semantic palette only where it improves interpretation. Diagram style = engineering drawing, not infographic.
- **Charts:** use a restrained, documented semantic palette on hairline grids; reserve green for the primary action, not routine data series. No 3D charts, no donut confetti.
- File hygiene: SVG for UI graphics (optimized, no embedded rasters), AVIF/WebP for photography, `loading="lazy"` below the fold, explicit width/height to prevent CLS.
