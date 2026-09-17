import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const root = new URL("..", import.meta.url).pathname;
const files = [];
function walk(dir) { for (const name of readdirSync(dir)) { const path = join(dir, name); const st = statSync(path); if (st.isDirectory() && ![".git", "node_modules"].includes(name)) walk(path); else if (st.isFile() && /\.(md|html|tsx|ts|css)$/.test(name)) files.push(path); } }
walk(root);
const stale = files.filter((path) => readFileSync(path, "utf8").includes("assets/fonts/aeonikpro-"));
if (stale.length) throw new Error(`Stale deleted-font references: ${stale.join(", ")}`);
const layout = readFileSync(join(root, "nextjs/app/layout.example.tsx"), "utf8");
if (layout.includes("from 'next/font/local'") || layout.includes("path: './fonts/")) throw new Error("Portable Next.js layout references unavailable local font assets");
const photographySources = ["AGENT.md", "foundations.md", "README.md"].map((file) => readFileSync(join(root, file), "utf8")).join("\n");
if (!photographySources.includes("high-resolution colour photography")) throw new Error("Colour photography canon missing");
const imageHashes = {
  "assets/images/photostyle/human.png": "e2bf69f6bf784f4c01a5377c5358267fbec93db4cafea678ecacd386a782ad40",
  "assets/images/photostyle/aspirational.png": "e4665a83560ed90ae956a36fa78f2e6e2273a261cde104c455497386273df219",
  "assets/images/photostyle/forward-looking.png": "15c4114ff3f2693531699e7b964004139e5a2a6850b054cd1409de3d9a0adab7",
  "assets/images/photostyle/quality.png": "69d65ea2b415f26f63d240a87e0363d05dd5f005f711f3d26b7ba3214d891278",
  "assets/images/share-innovation-band.png": "6f89cbcba061e389571d83cdb0d5cb648731136dddce26f96fd3f4c6bdc83edf",
};
for (const [file, expected] of Object.entries(imageHashes)) {
  const actual = createHash("sha256").update(readFileSync(join(root, file))).digest("hex");
  if (actual !== expected) throw new Error(`Image provenance hash mismatch: ${file}`);
}
console.log(`font and photography contract: pass (${files.length} source files scanned)`);
