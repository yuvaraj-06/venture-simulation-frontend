#!/usr/bin/env python3
"""Zero out border radii to satisfy Share Ventures canon (AGENT.md 1.5:
"Radius 0 on everything. Buttons, inputs, cards, images, video. Sharp corners
are a brand signature.")

Deterministic and idempotent. Numeric radii (px values, plain numbers, and
shorthand like '0 0 12px 12px') collapse to 0. Fully-circular radii ('50%')
are PRESERVED: those are avatar monogram discs and status dots, which are
circular graphics rather than the cards/buttons/inputs the rule governs.
"""
import re
import sys
from pathlib import Path

TSX = [
    "components/SimulationDashboard.tsx",
    "components/IntelligenceDashboard.tsx",
    "components/SimulationCard.tsx",
    "components/Brand.tsx",
    "components/LockedSection.tsx",
]
ROOT = Path("/home/ubuntu/venture-simulation-frontend")


def fix_tsx(text: str) -> tuple[str, int]:
    n = 0

    def repl(m: re.Match) -> str:
        nonlocal n
        val = m.group("val").strip()
        if "%" in val:  # circular graphics stay circular
            return m.group(0)
        if re.fullmatch(r"0+", val.strip("'\"")):
            return m.group(0)  # already 0, keep idempotent
        n += 1
        return "borderRadius: 0"

    # borderRadius: 8   |   borderRadius: '0 0 12px 12px'   |  borderRadius: "50%"
    text = re.sub(
        r"borderRadius:\s*(?P<val>'[^']*'|\"[^\"]*\"|[0-9.]+)",
        repl,
        text,
    )
    return text, n


def fix_css(text: str) -> tuple[str, int]:
    n = 0

    def repl(m: re.Match) -> str:
        nonlocal n
        val = m.group("val").strip()
        if "%" in val:
            return m.group(0)
        if re.fullmatch(r"0(px)?", val):
            return m.group(0)
        n += 1
        return f"{m.group('prop')}: 0"

    text = re.sub(
        r"(?P<prop>border-radius):\s*(?P<val>[^;}]+)",
        repl,
        text,
    )
    return text, n


total = 0
for rel in TSX:
    p = ROOT / rel
    src = p.read_text()
    out, n = fix_tsx(src)
    if n:
        p.write_text(out)
    print(f"{rel:42s} {n:4d} radii zeroed")
    total += n

css = ROOT / "app/globals.css"
src = css.read_text()
out, n = fix_css(src)
if n:
    css.write_text(out)
print(f"{'app/globals.css':42s} {n:4d} radii zeroed")
total += n
print(f"\nTOTAL: {total}")
