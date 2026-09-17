#!/usr/bin/env python3
"""Raise #939799 text to #5E6366 to satisfy the Share Ventures accessibility
floor (AGENT.md 1.9: "WCAG AA contrast (body 4.5:1, large text 3:1 -
`#939799` is decorative-only)").

#939799 on white  = 2.84:1  FAIL
#5E6366 on white  = 5.94:1  PASS (both are canon tokens)

Only rewrites `color:` declarations. Leaves #939799 alone wherever it is used
for borders, backgrounds, fills, dots and rules, which is legitimate
decorative use. Idempotent.
"""
import re
from pathlib import Path

ROOT = Path("/home/ubuntu/venture-simulation-frontend")
TARGETS = [
    "components/SimulationDashboard.tsx",
    "components/IntelligenceDashboard.tsx",
    "components/SimulationCard.tsx",
    "components/LockedSection.tsx",
    "components/Brand.tsx",
]

total = 0
for rel in TARGETS:
    p = ROOT / rel
    src = p.read_text()
    # JSX style objects:  color: '#939799'   /  color: "#939799"
    out, n = re.subn(r"(\bcolor:\s*)'#939799'", r"\1'#5E6366'", src)
    out, n2 = re.subn(r"(\bcolor:\s*)\"#939799\"", r'\1"#5E6366"', out)
    n += n2
    if n:
        p.write_text(out)
    print(f"{rel:42s} {n:4d} low-contrast text colors raised")
    total += n

print(f"\nTOTAL: {total}")
