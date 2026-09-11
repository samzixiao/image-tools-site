import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/App.css", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const seoPages = [
  ["instagram-post-size", "Instagram Post Size: 1080 × 1080 px", "ig"],
  ["instagram-story-size", "Instagram Story Size: 1080 × 1920 px", "story"],
  ["youtube-thumbnail-size", "YouTube Thumbnail Size: 1280 × 720 px", "youtube"],
  ["amazon-product-image-size", "Amazon Product Image Size: 2000 × 2000 px", "amazon"],
  ["etsy-image-size", "Etsy Image Size: 2000 × 1600 px", "etsy"],
];
const guidePages = [
  ["crop-image-to-exact-size", "How to Crop an Image to an Exact Size"],
  ["resize-image-without-losing-quality", "How to Resize an Image Without Losing Quality"],
  ["add-cm-inch-dimensions-to-images", "How to Add cm and Inch Dimensions to an Image"],
  ["prepare-marketplace-product-images", "How to Prepare Product Images for Marketplaces"],
  ["create-social-media-image-set", "How to Create a Consistent Social Media Image Set"],
  ["use-shape-crop-for-profile-images", "How to Use Shape Crop for Profile Images and Highlights"],
  ["cover-private-information-in-images", "How to Cover Private Information in an Image"],
  ["build-a-photo-collage", "How to Build a 2 to 9 Image Photo Collage"],
  ["add-text-overlays-to-images", "How to Add Text Overlays to Images Without Clutter"],
  ["prepare-image-before-uploading", "How to Prepare an Image Before Uploading It"],
];
const categoryPages = [
  ["ecommerce-image-tools", "E-commerce Image Tools for Product Listings"],
  ["social-media-image-tools", "Social Media Image Tools and Size Workflows"],
  ["privacy-image-tools", "Privacy Image Tools: Cover Sensitive Details"],
];

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
  'const [batchPresetIds, setBatchPresetIds]',
  'async function downloadBatch()',
  'className="platform-batch"',
  'aria-label="Batch platform export"',
  'aria-pressed={selected}',
  'One image → multiple platform sizes',
  'className="category-links"',
  'href="/ecommerce-image-tools/"',
  'href="/social-media-image-tools/"',
  'href="/privacy-image-tools/"',
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
assert.ok(styles.includes(".platform-batch") && styles.includes(".category-links"), "Workflow expansion styles are missing");
assert.ok(/\.caption-overlay\s*\{[\s\S]*?z-index:\s*40;/.test(styles), "Text layers must stay above filled collage tiles");
assert.ok(/\.collage-tile\.empty\s*\{[\s\S]*?pointer-events:\s*auto;/.test(styles), "The whole empty collage tile must accept uploads");
assert.ok(/\.collage-tile\.empty\s*\{[\s\S]*?z-index:\s*3;/.test(styles), "Empty collage tiles must stay below editable overlays");
assert.ok(/\.collage-slot-input\s*\{[\s\S]*?inset:\s*-2px;[\s\S]*?width:\s*calc\(100% \+ 4px\);[\s\S]*?height:\s*calc\(100% \+ 4px\);/.test(styles), "The collage upload input must cover the whole tile including its border");

assert.ok(html.includes("family=Playfair+Display"), "Missing the loaded right-size font");
assert.ok(html.includes('name="google-site-verification"'), "Missing Google Search Console ownership verification tag");
assert.ok(source.includes('href="/instagram-post-size/">Size guides</a>'), "Homepage must link to the SEO size guides");
assert.ok(source.includes("new URLSearchParams(window.location.search)"), "SEO landing page preset links must be handled by the editor");
assert.ok(source.includes("const requestedPreset = presets.find"), "Requested preset must initialize the editor");

for (const [route, heading, presetId] of seoPages) {
  const pageUrl = new URL(`../public/${route}/index.html`, import.meta.url);
  await access(pageUrl);
  const page = await readFile(pageUrl, "utf8");
  assert.ok(page.includes(`<h1>${heading}</h1>`), `Missing SEO heading for ${route}`);
  assert.ok(page.includes(`/?preset=${presetId}#tool`), `Missing editor CTA for ${route}`);
  assert.ok(page.includes(`<link rel="canonical" href="https://image-tools-site-sigma.vercel.app/${route}/"`), `Missing canonical for ${route}`);
}

for (const [route, heading] of guidePages) {
  const pageUrl = new URL(`../public/guides/${route}/index.html`, import.meta.url);
  await access(pageUrl);
  const page = await readFile(pageUrl, "utf8");
  assert.ok(page.includes(`<h1>${heading}</h1>`), `Missing guide heading for ${route}`);
  assert.ok(page.includes('<article class="card article">'), `Missing article body for ${route}`);
  const articleText = page.replace(/^[\s\S]*?<article class="card article">/, "").replace(/<\/article>[\s\S]*$/, "").replace(/<[^>]+>/g, " ");
  const words = articleText.split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 700, `Guide ${route} is too short: ${words} words`);
  assert.ok(page.includes("#tool"), `Missing editor CTA for guide ${route}`);
  assert.ok(page.includes(`<link rel="canonical" href="https://image-tools-site-sigma.vercel.app/guides/${route}/"`), `Missing canonical for guide ${route}`);
}

for (const [route, heading] of categoryPages) {
  const pageUrl = new URL(`../public/${route}/index.html`, import.meta.url);
  await access(pageUrl);
  const page = await readFile(pageUrl, "utf8");
  assert.ok(page.includes(`<h1>${heading}</h1>`), `Missing category heading for ${route}`);
  assert.ok(page.includes('<link rel="stylesheet" href="/seo.css" />'), `Missing SEO stylesheet for ${route}`);
  assert.ok(page.includes("/#tool") || page.includes("#tool"), `Missing editor CTA for ${route}`);
  assert.ok(page.includes(`<link rel="canonical" href="https://image-tools-site-sigma.vercel.app/${route}/"`), `Missing canonical for ${route}`);
}

for (const page of ["about", "privacy", "terms", "feedback"]) {
  await access(new URL(`../public/${page}/index.html`, import.meta.url));
}
const guideHub = await readFile(new URL("../public/guides/index.html", import.meta.url), "utf8");
assert.ok(guideHub.includes("<h1>Learn the image workflow, not just the button</h1>"), "Missing guide hub heading");
assert.ok(guideHub.includes("/guides/add-text-overlays-to-images/"), "Guide hub must link to the text guide");

const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
for (const [route] of seoPages) {
  assert.ok(sitemap.includes(`https://image-tools-site-sigma.vercel.app/${route}/`), `Missing ${route} from sitemap`);
}
for (const [route] of guidePages) {
  assert.ok(sitemap.includes(`https://image-tools-site-sigma.vercel.app/guides/${route}/`), `Missing guide ${route} from sitemap`);
}
for (const [route] of categoryPages) {
  assert.ok(sitemap.includes(`https://image-tools-site-sigma.vercel.app/${route}/`), `Missing ${route} from sitemap`);
}
assert.ok(sitemap.includes("https://image-tools-site-sigma.vercel.app/about/"), "Missing about page from sitemap");
assert.ok(sitemap.includes("https://image-tools-site-sigma.vercel.app/privacy/"), "Missing privacy page from sitemap");
assert.ok(sitemap.includes("https://image-tools-site-sigma.vercel.app/terms/"), "Missing terms page from sitemap");
assert.ok(sitemap.includes("https://image-tools-site-sigma.vercel.app/feedback/"), "Missing feedback page from sitemap");
assert.ok(sitemap.includes("https://image-tools-site-sigma.vercel.app/guides/"), "Missing guide hub from sitemap");
assert.ok(await access(new URL("../public/seo.css", import.meta.url)) === undefined);

console.log("Editor collage and overlay contracts passed.");
