import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

for (const contract of [
  'shape: Exclude<Shape, "polygon">',
  'shape: "original" as const',
  'className="collage-slot-input"',
  'aria-label={`Upload image to collage tile ${index + 1}`}',
  'onPointerDown={(event) => event.stopPropagation()}',
  'disabled={!url && !selectedCollageTemplate}',
  'fontStyle: layer.fontFamily === "Playfair Display" ? "italic" : "normal"',
  'Double-click text in the preview to edit it',
  'Feedback & ideas ↗',
  'function removePrivacyCover(id: number)',
  'const fallback = privacyCovers[index - 1] ?? privacyCovers[index + 1];',
  'aria-label="Delete privacy cover"',
  'aria-label="Delete dimension arrow"',
  'aria-label="Delete text layer"',
]) {
  assert.ok(source.includes(contract), `Missing editor contract: ${contract}`);
}

assert.ok(html.includes("family=Playfair+Display"), "Missing the loaded right-size font");

console.log("Editor collage and overlay contracts passed.");
