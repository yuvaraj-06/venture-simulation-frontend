import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("web firm wordmark is lowercase while Share OS keeps uppercase OS", () => {
  const component = read("nextjs/components/Wordmark.tsx");
  const demo = read("demo/index.html");
  const contract = read("AGENT.md");

  assert.match(component, /product = 'ventures'/);
  assert.match(component, /product\.toLowerCase\(\) === 'ventures' \? 'ventures' : product/);
  assert.match(component, /<Wordmark product="OS" \/>\s+→ share OS/);
  assert.match(demo, /sv-wordmark__product">ventures<span/);
  assert.doesNotMatch(demo, /sv-wordmark__product">Ventures<span/);
  assert.match(contract, /share ventures/);
  assert.match(contract, /share OS/);
});

test("official fixed logo assets remain unchanged by the web casing rule", () => {
  const changelog = read("CHANGELOG.md");
  assert.match(changelog, /Official fixed logo assets remain exactly as supplied/);
});
