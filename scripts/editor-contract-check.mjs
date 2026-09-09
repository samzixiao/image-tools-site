import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

for (const contract of [
  'shape: Exclude<Shape, "polygon">',
  'shape: "original" as const',
  'disabled={!url && !selectedCollageTemplate}',
  'value="Playfair Display"',
  'function removePrivacyCover(id: number)',
  'const fallback = privacyCovers[index - 1] ?? privacyCovers[index + 1];',
  'aria-label="Delete privacy cover"',
  'aria-label="Delete dimension arrow"',
  'aria-label="Delete text layer"',
]) {
  assert.ok(source.includes(contract), `Missing editor contract: ${contract}`);
}

console.log("Editor collage and overlay contracts passed.");
