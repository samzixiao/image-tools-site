import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/App.css", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

for (const contract of [
  'shape: Exclude<Shape, "polygon">',
  'shape: "original" as const',
  'className="collage-slot-input"',
  'aria-label={`Upload image to collage tile ${index + 1}`}',
  'prepareCollageUpload(index);',
  'const activePreviewZoom = selectedCollageImage?.scale ?? zoom;',
  'const activeShapeScale = selectedCollageImage?.shapeScale ?? shapeScale;',
  '(selectedCollageImage !== undefined && selectedCollageImage.shape !== "original")',
  'className="preview-shape-tools"',
  'className={`collage-shape-frame ${item.shape}`}',
  'style={collageShapeStyle(item.shape, slot, item.shapeScale)}',
  'const value = Math.min(1.5, Math.max(0.35, next));',
  'aria-label="Delete dimension text"',
  'aria-label={selectedCollageImage ? "Selected collage tile zoom level" : "Preview zoom level"}',
  'aria-label="Upload main image in preview"',
  'disabled={!url && !selectedCollageTemplate}',
  'fontStyle: layer.fontFamily === "Playfair Display" ? "italic" : "normal"',
  'New text opens ready to type. Single-click selects it with resize and delete controls; double-click edits the words.',
  'Feedback & ideas ↗',
  'function removePrivacyCover(id: number)',
  'const fallback = privacyCovers[index - 1] ?? privacyCovers[index + 1];',
  'aria-label="Delete privacy cover"',
  'aria-label="Delete dimension arrow"',
  'aria-label="Delete text layer"',
  'onPointerDownCapture={(event) => {',
  'target.closest(`[data-text-layer-id="${editingTextId}"]`)',
  'data-text-layer-id={layer.id}',
  'className={`caption-overlay editable${layer.id === selectedTextId ? " selected" : ""}${editingTextId === layer.id ? " editing" : ""}`}',
  '{layer.id === selectedTextId && (',
  'setEditingTextId(id);',
  'if (event.detail >= 2) setEditingTextId(layer.id);',
  'aria-label="Text layers"',
  'aria-label="Text outline color"',
  'aria-label="Text outline width"',
  'function textOutlineShadow(color: string, width: number)',
  'const outlineRadius = Math.max(0, (width * layer.strokeWidth) / 1080);',
  'ctx.fillText(item, 0, y, maxWidth);',
  'setSelectedTextId(null);',
]) {
  assert.ok(source.includes(contract), `Missing editor contract: ${contract}`);
}

assert.ok(!source.includes("Box width"), "Legacy text box-width control must not return");
assert.ok(!source.includes("strokeText"), "Text outlines must not use inward canvas strokeText rendering");
assert.ok(!source.includes("WebkitTextStroke"), "Preview text outlines must not use WebkitTextStroke");
assert.ok(!source.includes('layer.id === selectedTextId && editingTextId !== layer.id'), "Text controls must not appear from selection alone");
assert.ok(styles.includes(".caption-overlay") && /\.caption-overlay\s*\{[\s\S]*?overflow:\s*visible;/.test(styles), "Text delete control must be visible outside the text box");
assert.ok(/\.caption-overlay\s*\{[\s\S]*?z-index:\s*40;/.test(styles), "Text layers must stay above filled collage tiles");
assert.ok(/\.collage-tile\.empty\s*\{[\s\S]*?pointer-events:\s*auto;/.test(styles), "The whole empty collage tile must accept uploads");
assert.ok(/\.collage-tile\.empty\s*\{[\s\S]*?z-index:\s*3;/.test(styles), "Empty collage tiles must stay below editable overlays");
assert.ok(/\.collage-slot-input\s*\{[\s\S]*?inset:\s*-2px;[\s\S]*?width:\s*calc\(100% \+ 4px\);[\s\S]*?height:\s*calc\(100% \+ 4px\);/.test(styles), "The collage upload input must cover the whole tile including its border");

assert.ok(html.includes("family=Playfair+Display"), "Missing the loaded right-size font");

console.log("Editor collage and overlay contracts passed.");
