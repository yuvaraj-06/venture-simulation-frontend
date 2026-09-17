# Share Ventures Design System

Binding design contract for ALL Share Ventures web surfaces: **read `AGENT.md` before designing or building anything.**
- Use `skills/share-ventures-design-system/SKILL.md` to route each task to the smallest relevant set of references and implementation files.

- Default stack is **Next.js (App Router)** — use the drop-in kit in `nextjs/` (see its README); do not rebuild its components.
- `demo/index.html` is the living visual reference (vanilla build of the same system) — treat it as the source of visual truth, and update it whenever the system changes.
- Tokens: `tokens/tokens.css` is canonical; `tokens.json` and `tailwind.preset.js` mirror it — change all three together.
- When building a new site in another repo, vendor this whole `design-system/` directory into that repo so agents there can see it.
