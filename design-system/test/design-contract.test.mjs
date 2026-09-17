import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("font and colour photography contract", () => {
  const run = spawnSync(process.execPath, ["scripts/verify-font-contract.mjs"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  assert.match(run.stdout, /font and photography contract: pass/);
});
