import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent } from "react";
import "./App.css";

type Format = "image/jpeg" | "image/png" | "image/webp";
type Shape =
  | "original"
  | "circle"
  | "ellipse"
  | "heart"
  | "star"
  | "hexagon"
  | "triangle"
  | "badge"
  | "sticker"
  | "polygon";
type ExpandMode = "none" | "blur" | "mirror" | "gradient" | "solid";
type Preset = {
  id: string;
  group: string;
  name: string;
  en: string;
  width: number;
  height: number;
};
const presets: Preset[] = [
  {
    id: "ig",
    group: "Instagram",
    name: "帖子",
    en: "Post square",
    width: 1080,
    height: 1080,
  },
  {
    id: "story",
    group: "Instagram",
    name: "快拍 / Reels",
    en: "Story / Reel",
    width: 1080,
    height: 1920,
  },
  {
    id: "tiktok",
    group: "TikTok",
    name: "视频封面",
    en: "Video cover",
    width: 1080,
    height: 1920,
  },
  {
    id: "youtube",
    group: "YouTube",
    name: "视频缩略图",
    en: "Thumbnail",
    width: 1280,
    height: 720,
  },
  {
    id: "amazon",
    group: "Amazon",
    name: "商品主图",
    en: "Product image",
    width: 2000,
    height: 2000,
  },
  {
    id: "etsy",
    group: "Etsy",
    name: "商品图片",
    en: "Listing image",
    width: 2000,
    height: 1600,
  },
  {
    id: "shopify",
    group: "Shopify",
    name: "商品图",
    en: "Product image",
    width: 2048,
    height: 2048,
  },
  {
    id: "og",
    group: "Website",
    name: "分享卡片",
    en: "Open Graph card",
    width: 1200,
    height: 630,
  },
];
const shapes: Shape[] = [
  "original",
  "circle",
  "ellipse",
  "heart",
  "star",
  "hexagon",
  "triangle",
  "badge",
  "sticker",
  "polygon",
];
const shapeSymbol: Record<Shape, string> = {
  original: "□",
  circle: "●",
  ellipse: "⬭",
  heart: "♥",
  star: "★",
  hexagon: "⬢",
  triangle: "▲",
  badge: "✹",
  sticker: "▣",
  polygon: "⬠",
};
const privacyStickers = [
  "mosaic",
  "🕶️",
  "🦊",
  "🐼",
  "🐱",
  "🐶",
  "🐰",
  "🧸",
  "🌼",
  "⭐",
  "❤️",
  "😎",
  "😊",
];

function App() {
  const [url, setUrl] = useState(""),
    [originalUrl, setOriginalUrl] = useState(""),
    [fileName, setFileName] = useState(""),
    [natural, setNatural] = useState({ width: 0, height: 0 });
  const [preset, setPreset] = useState(presets[0]),
    [custom, setCustom] = useState({ width: 1080, height: 1080 });
  const [format, setFormat] = useState<Format>("image/jpeg"),
    [quality, setQuality] = useState(90),
    [mode, setMode] = useState<"crop" | "fit">("crop");
  const [shape, setShape] = useState<Shape>("original"),
    [zoom, setZoom] = useState(1),
    [rotation, setRotation] = useState(0),
    [flipX, setFlipX] = useState(false),
    [flipY, setFlipY] = useState(false);
  const [measure, setMeasure] = useState(false),
    [unit, setUnit] = useState<"cm" | "in">("cm"),
    [dims, setDims] = useState({ width: "60", height: "40", depth: "20" }),
    [label, setLabel] = useState("");
  const [adjust, setAdjust] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0,
  });
  const [background, setBackground] = useState("#ffffff"),
    [transparentBackground, setTransparentBackground] = useState(false),
    [borderColor, setBorderColor] = useState("#e66d5b"),
    [borderWidth, setBorderWidth] = useState(0);
  const [text, setText] = useState(""),
    [textColor, setTextColor] = useState("#ffffff"),
    [textSize, setTextSize] = useState(42),
    [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">(
      "bottom",
    );
  const [overlayUrl, setOverlayUrl] = useState(""),
    [overlayOpacity, setOverlayOpacity] = useState(80),
    [overlayPosition, setOverlayPosition] = useState<
      "top-left" | "top-right" | "bottom-left" | "bottom-right"
    >("bottom-right"),
    [backgroundTolerance, setBackgroundTolerance] = useState(35);
  const [expandMode, setExpandMode] = useState<ExpandMode>("none"),
    [expandStrength, setExpandStrength] = useState(35),
    [privacySticker, setPrivacySticker] = useState(""),
    [stickerSize, setStickerSize] = useState(30),
    [stickerPosition, setStickerPosition] = useState({ x: 0.5, y: 0.5 }),
    [placingSticker, setPlacingSticker] = useState(false);
  const [fitPosition, setFitPosition] = useState({ x: 0.5, y: 0.5 });
  const [customFrame, setCustomFrame] = useState({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8,
  });
  const [frameDrag, setFrameDrag] = useState<{
    x: number;
    y: number;
    frame: typeof customFrame;
    corner: "nw" | "ne" | "se" | "sw";
  } | null>(null);
  const [polygonPoints, setPolygonPoints] = useState([
    { x: 0.2, y: 0.2 },
    { x: 0.8, y: 0.2 },
    { x: 0.8, y: 0.8 },
    { x: 0.2, y: 0.8 },
  ]);
  const [addingPolygonPoint, setAddingPolygonPoint] = useState(false),
    [polygonDrag, setPolygonDrag] = useState<number | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 1, height: 1 }),
    [drag, setDrag] = useState<{
      x: number;
      y: number;
      crop: typeof crop;
      fitPosition: typeof fitPosition;
      mode: "crop" | "fit";
    } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null),
    overlayInput = useRef<HTMLInputElement>(null);
  const output =
      preset.id === "custom"
        ? custom
        : { width: preset.width, height: preset.height },
    aspect = output.width / output.height,
    cropFrame =
      preset.id === "custom"
        ? customFrame
        : aspect >= 1
          ? {
              x: 0.09,
              y: (1 - 0.82 / aspect) / 2,
              width: 0.82,
              height: 0.82 / aspect,
            }
          : {
              x: (1 - 0.82 * aspect) / 2,
              y: 0.09,
              width: 0.82 * aspect,
              height: 0.82,
            };

  useEffect(() => {
    if (!url) return;
    const image = new Image();
    image.onload = () => {
      setNatural({ width: image.naturalWidth, height: image.naturalHeight });
      const ratio = image.naturalWidth / image.naturalHeight;
      if (ratio > aspect) {
        const width = aspect / ratio;
        setCrop({ x: (1 - width) / 2, y: 0, width, height: 1 });
      } else {
        const height = ratio / aspect;
        setCrop({ x: 0, y: (1 - height) / 2, width: 1, height });
      }
    };
    image.src = url;
  }, [url, aspect]);
  function loadFile(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    const nextUrl = URL.createObjectURL(file);
    setFileName(file.name);
    setUrl(nextUrl);
    setOriginalUrl(nextUrl);
  }
  function loadOverlay(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    setOverlayUrl(URL.createObjectURL(file));
  }
  function choosePreset(next: Preset) {
    setPreset(next);
    if (next.id !== "custom")
      setCustom({ width: next.width, height: next.height });
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!url) return;
    if (placingSticker && privacySticker) {
      const box = event.currentTarget.getBoundingClientRect();
      setStickerPosition({
        x: Math.min(
          0.95,
          Math.max(0.05, (event.clientX - box.left) / box.width),
        ),
        y: Math.min(
          0.95,
          Math.max(0.05, (event.clientY - box.top) / box.height),
        ),
      });
      setPlacingSticker(false);
      return;
    }
    if (addingPolygonPoint && shape === "polygon") {
      const box = event.currentTarget.getBoundingClientRect();
      setPolygonPoints((current) =>
        current.length >= 30
          ? current
          : [
              ...current,
              {
                x: Math.min(0.98, Math.max(0.02, (event.clientX - box.left) / box.width)),
                y: Math.min(0.98, Math.max(0.02, (event.clientY - box.top) / box.height)),
              },
            ],
      );
      setAddingPolygonPoint(false);
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      x: event.clientX,
      y: event.clientY,
      crop,
      fitPosition,
      mode,
    });
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    if (polygonDrag !== null) {
      setPolygonPoints((current) =>
        current.map((point, index) =>
          index === polygonDrag
            ? {
                x: Math.min(0.98, Math.max(0.02, (event.clientX - box.left) / box.width)),
                y: Math.min(0.98, Math.max(0.02, (event.clientY - box.top) / box.height)),
              }
            : point,
        ),
      );
      return;
    }
    if (frameDrag) {
      const dx = (event.clientX - frameDrag.x) / box.width,
        dy = (event.clientY - frameDrag.y) / box.height,
        min = 0.12,
        right = frameDrag.frame.x + frameDrag.frame.width,
        bottom = frameDrag.frame.y + frameDrag.frame.height;
      let next = { ...frameDrag.frame };
      if (frameDrag.corner === "se") {
        next.width = Math.min(1 - next.x, Math.max(min, next.width + dx));
        next.height = Math.min(1 - next.y, Math.max(min, next.height + dy));
      } else if (frameDrag.corner === "sw") {
        next.x = Math.min(right - min, Math.max(0, next.x + dx));
        next.width = right - next.x;
        next.height = Math.min(1 - next.y, Math.max(min, next.height + dy));
      } else if (frameDrag.corner === "ne") {
        next.y = Math.min(bottom - min, Math.max(0, next.y + dy));
        next.height = bottom - next.y;
        next.width = Math.min(1 - next.x, Math.max(min, next.width + dx));
      } else {
        next.x = Math.min(right - min, Math.max(0, next.x + dx));
        next.y = Math.min(bottom - min, Math.max(0, next.y + dy));
        next.width = right - next.x;
        next.height = bottom - next.y;
      }
      setCustomFrame(next);
      setCustom((current) => ({
        ...current,
        height: Math.max(1, Math.round((current.width * next.height) / next.width)),
      }));
      return;
    }
    if (!drag) return;
    const dx = (event.clientX - drag.x) / box.width,
      dy = (event.clientY - drag.y) / box.height;
    if (drag.mode === "fit") {
      setFitPosition({
        x: Math.min(1, Math.max(0, drag.fitPosition.x + dx)),
        y: Math.min(1, Math.max(0, drag.fitPosition.y + dy)),
      });
      return;
    }
    setCrop((current) => ({
      ...current,
      x: Math.min(Math.max(0, drag.crop.x + dx), 1 - current.width),
      y: Math.min(Math.max(0, drag.crop.y + dy), 1 - current.height),
    }));
  }
  function cropZoom(delta: number) {
    if (!url) return;
    const sourceRatio = natural.width / natural.height,
      width = Math.min(1, Math.max(aspect / sourceRatio, crop.width + delta)),
      height = Math.min(1, (width / aspect) * sourceRatio);
    setCrop({
      width,
      height,
      x: Math.min(crop.x, 1 - width),
      y: Math.min(crop.y, 1 - height),
    });
  }
  function beginFrameResize(
    event: PointerEvent<HTMLButtonElement>,
    corner: "nw" | "ne" | "se" | "sw",
  ) {
    event.stopPropagation();
    setFrameDrag({
      x: event.clientX,
      y: event.clientY,
      frame: customFrame,
      corner,
    });
  }
  const filterValue = `brightness(${adjust.brightness}%) contrast(${adjust.contrast}%) saturate(${adjust.saturation}%) hue-rotate(${adjust.hue}deg) blur(${adjust.blur}px) grayscale(${adjust.grayscale}%) sepia(${adjust.sepia}%) invert(${adjust.invert}%)`;
  function resetEdits() {
    setZoom(1);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setFitPosition({ x: 0.5, y: 0.5 });
    setShape("original");
    setAdjust({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
    });
    setBackground("#ffffff");
    setTransparentBackground(false);
    setBorderWidth(0);
    setText("");
    setMeasure(false);
    setOverlayUrl("");
    setExpandMode("none");
    setPrivacySticker("");
    setPlacingSticker(false);
    setCustomFrame({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
    setPolygonPoints([
      { x: 0.2, y: 0.2 },
      { x: 0.8, y: 0.2 },
      { x: 0.8, y: 0.8 },
      { x: 0.2, y: 0.8 },
    ]);
    setAddingPolygonPoint(false);
  }
  function removeSolidBackground() {
    if (!url) return;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height),
        width = canvas.width,
        height = canvas.height,
        sample = [pixels.data[0], pixels.data[1], pixels.data[2]],
        visited = new Uint8Array(width * height),
        queue = new Int32Array(width * height);
      let head = 0,
        tail = 0;
      const push = (point: number) => {
        if (!visited[point]) {
          visited[point] = 1;
          queue[tail++] = point;
        }
      };
      for (let x = 0; x < width; x++) {
        push(x);
        push((height - 1) * width + x);
      }
      for (let y = 0; y < height; y++) {
        push(y * width);
        push(y * width + width - 1);
      }
      while (head < tail) {
        const point = queue[head++],
          index = point * 4,
          distance = Math.sqrt(
            (pixels.data[index] - sample[0]) ** 2 +
              (pixels.data[index + 1] - sample[1]) ** 2 +
              (pixels.data[index + 2] - sample[2]) ** 2,
          );
        if (distance > backgroundTolerance * 4.42) continue;
        pixels.data[index + 3] = 0;
        const x = point % width,
          y = Math.floor(point / width);
        if (x > 0) push(point - 1);
        if (x < width - 1) push(point + 1);
        if (y > 0) push(point - width);
        if (y < height - 1) push(point + width);
      }
      ctx.putImageData(pixels, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        setUrl(URL.createObjectURL(blob));
        setFormat("image/png");
      }, "image/png");
    };
    image.src = url;
  }

  function path(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.beginPath();
    if (shape === "polygon") {
      polygonPoints.forEach((point, index) => {
        const x = point.x * width,
          y = point.y * height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      return;
    }
    if (shape === "circle") {
      ctx.ellipse(
        width / 2,
        height / 2,
        width / 2,
        height / 2,
        0,
        0,
        Math.PI * 2,
      );
      return;
    }
    if (shape === "ellipse") {
      ctx.ellipse(
        width / 2,
        height / 2,
        width * 0.48,
        height * 0.34,
        0,
        0,
        Math.PI * 2,
      );
      return;
    }
    if (shape === "heart") {
      ctx.moveTo(width / 2, height * 0.92);
      ctx.bezierCurveTo(
        -width * 0.1,
        height * 0.55,
        width * 0.08,
        height * 0.08,
        width * 0.3,
        height * 0.2,
      );
      ctx.bezierCurveTo(
        width * 0.43,
        height * 0.02,
        width / 2,
        height * 0.18,
        width / 2,
        height * 0.3,
      );
      ctx.bezierCurveTo(
        width / 2,
        height * 0.18,
        width * 0.57,
        height * 0.02,
        width * 0.7,
        height * 0.2,
      );
      ctx.bezierCurveTo(
        width * 0.92,
        height * 0.08,
        width * 1.1,
        height * 0.55,
        width / 2,
        height * 0.92,
      );
      return;
    }
    if (shape === "triangle") {
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      return;
    }
    if (shape === "sticker") {
      ctx.roundRect(0, 0, width, height, Math.min(width, height) * 0.08);
      return;
    }
    const points = shape === "hexagon" ? 6 : shape === "badge" ? 16 : 10;
    for (let i = 0; i < points; i++) {
      const radius = shape === "hexagon" ? 0.48 : i % 2 ? 0.32 : 0.48,
        angle = -Math.PI / 2 + (Math.PI * 2 * i) / points,
        x = width / 2 + Math.cos(angle) * width * radius,
        y = height / 2 + Math.sin(angle) * height * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  function drawMosaic(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    if (privacySticker !== "mosaic") return;
    const size = Math.max(36, (width * stickerSize) / 100),
      centerX = stickerPosition.x * width,
      centerY = stickerPosition.y * height,
      left = Math.max(0, Math.round(centerX - size / 2)),
      top = Math.max(0, Math.round(centerY - size / 2)),
      right = Math.min(width, Math.round(centerX + size / 2)),
      bottom = Math.min(height, Math.round(centerY + size / 2)),
      image = ctx.getImageData(0, 0, width, height),
      block = Math.max(10, Math.round(size / 11));
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(left, top, right - left, bottom - top, size * 0.08);
    ctx.clip();
    for (let y = top; y < bottom; y += block)
      for (let x = left; x < right; x += block) {
        const index = (y * width + x) * 4;
        ctx.fillStyle = `rgba(${image.data[index]},${image.data[index + 1]},${image.data[index + 2]},${image.data[index + 3] / 255})`;
        ctx.fillRect(x, y, block, block);
      }
    ctx.restore();
  }
  function drawAnnotations(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    if (!measure) return;
    const pad = Math.max(32, width / 18),
      w = Number(dims.width) || 0,
      h = Number(dims.height) || 0,
      toDual = (value: number) =>
        unit === "cm"
          ? `${value} cm / ${(value / 2.54).toFixed(1)} in`
          : `${value} in / ${(value * 2.54).toFixed(1)} cm`;
    ctx.save();
    ctx.strokeStyle = "#e66d5b";
    ctx.fillStyle = "#e66d5b";
    ctx.lineWidth = Math.max(3, width / 500);
    ctx.font = `bold ${Math.max(18, width / 42)}px Arial`;
    ctx.beginPath();
    ctx.moveTo(pad, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.stroke();
    ctx.fillText(toDual(w), pad, height - pad - 12);
    ctx.save();
    ctx.translate(pad - 12, height - pad);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(toDual(h), 0, 0);
    ctx.restore();
    if (label) ctx.fillText(label, pad, pad + 22);
    ctx.restore();
  }
  function drawText(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    if (!text.trim()) return;
    ctx.save();
    const size = Math.max(16, (width * textSize) / 1080);
    ctx.font = `700 ${size}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = textColor;
    ctx.shadowColor = "#00000099";
    ctx.shadowBlur = size * 0.15;
    const y =
      textPosition === "top"
        ? size * 1.2
        : textPosition === "center"
          ? height / 2
          : height - size * 1.2;
    ctx.fillText(text, width / 2, y, width * 0.9);
    ctx.restore();
  }
  function drawExpansion(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    width: number,
    height: number,
  ) {
    if (expandMode === "none" || expandMode === "solid") return;
    if (expandMode === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, background);
      gradient.addColorStop(1, "#1e293b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      return;
    }
    const scale =
        Math.max(width / image.naturalWidth, height / image.naturalHeight) *
        1.12,
      drawWidth = image.naturalWidth * scale,
      drawHeight = image.naturalHeight * scale;
    ctx.save();
    ctx.translate(width / 2, height / 2);
    if (expandMode === "mirror") ctx.scale(-1, 1);
    ctx.filter = `blur(${Math.max(3, expandStrength / 2)}px) brightness(82%) saturate(110%)`;
    ctx.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );
    ctx.restore();
  }
  function drawPrivacySticker(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    if (!privacySticker || privacySticker === "mosaic") return;
    ctx.save();
    const size = Math.max(28, (width * stickerSize) / 100);
    ctx.font = `${size}px "Segoe UI Emoji", Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      privacySticker,
      stickerPosition.x * width,
      stickerPosition.y * height,
    );
    ctx.restore();
  }
  function loadImage(source: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
  }
  async function download() {
    if (!url) return;
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = output.width;
    canvas.height = output.height;
    const ctx = canvas.getContext("2d")!;
    if (!transparentBackground || format !== "image/png") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const sx = mode === "fit" ? 0 : natural.width * crop.x,
      sy = mode === "fit" ? 0 : natural.height * crop.y,
      sw = mode === "fit" ? natural.width : natural.width * crop.width,
      sh = mode === "fit" ? natural.height : natural.height * crop.height,
      scale = Math.min(canvas.width / sw, canvas.height / sh),
      drawWidth = sw * scale,
      drawHeight = sh * scale;
    ctx.save();
    if (shape !== "original") path(ctx, canvas.width, canvas.height);
    else
      ctx.rect(
        (canvas.width - drawWidth) / 2,
        (canvas.height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
    ctx.clip();
    drawExpansion(ctx, image, canvas.width, canvas.height);
    const destinationX =
        mode === "fit"
          ? (canvas.width - drawWidth) * fitPosition.x
          : (canvas.width - drawWidth) / 2,
      destinationY =
        mode === "fit"
          ? (canvas.height - drawHeight) * fitPosition.y
          : (canvas.height - drawHeight) / 2;
    ctx.translate(destinationX + drawWidth / 2, destinationY + drawHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.filter = filterValue;
    ctx.drawImage(
      image,
      sx,
      sy,
      sw,
      sh,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );
    ctx.restore();
    drawMosaic(ctx, canvas.width, canvas.height);
    if (borderWidth > 0) {
      ctx.save();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = Math.max(1, (canvas.width * borderWidth) / 1080);
      if (shape !== "original") path(ctx, canvas.width, canvas.height);
      else
        ctx.rect(
          ctx.lineWidth / 2,
          ctx.lineWidth / 2,
          canvas.width - ctx.lineWidth,
          canvas.height - ctx.lineWidth,
        );
      ctx.stroke();
      ctx.restore();
    }
    drawText(ctx, canvas.width, canvas.height);
    drawAnnotations(ctx, canvas.width, canvas.height);
    drawPrivacySticker(ctx, canvas.width, canvas.height);
    if (overlayUrl) {
      const overlay = await loadImage(overlayUrl);
      const targetWidth = canvas.width * 0.22,
        targetHeight =
          (targetWidth * overlay.naturalHeight) / overlay.naturalWidth,
        pad = canvas.width * 0.035,
        x = overlayPosition.endsWith("right")
          ? canvas.width - targetWidth - pad
          : pad,
        y = overlayPosition.startsWith("bottom")
          ? canvas.height - targetHeight - pad
          : pad;
      ctx.save();
      ctx.globalAlpha = overlayOpacity / 100;
      ctx.drawImage(overlay, x, y, targetWidth, targetHeight);
      ctx.restore();
    }
    const extension = format.split("/")[1].replace("jpeg", "jpg"),
      link = document.createElement("a");
    link.download = `${fileName.replace(/\.[^.]+$/, "") || "image"}-${output.width}x${output.height}.${extension}`;
    link.href = canvas.toDataURL(format, quality / 100);
    link.click();
  }

  const previewStyle = {
    objectFit: "cover" as const,
    objectPosition: `${crop.x * 100}% ${crop.y * 100}%`,
    transform: `translate(${(crop.x - 0.5) * -34}cqw, ${(crop.y - 0.5) * -34}cqw) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
    filter: filterValue,
  };
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top">
          <span>✦</span> SizeCraft
        </a>
        <nav>
          <a href="#tool">Editor</a>
          <a href="#ecommerce">E-commerce tools</a>
          <a href="#how">How it works</a>
        </nav>
        <i>● 100% browser-based</i>
      </header>
      <main id="top">
        <section className="hero">
          <p className="eyebrow">FAST · PRIVATE · FREE</p>
          <h1>
            Make every image the <em>right size.</em>
          </h1>
          <p>
            Resize, shape-crop, annotate, and transform images for shops, social
            media, websites, and everyday work.
          </p>
        </section>
        <section className="workspace" id="tool">
          <aside className="controls">
            <Step
              n="01"
              title="Upload your image"
              sub="JPG, PNG, WebP · up to 50 MB"
            />
            <button
              className="upload"
              onClick={() => fileInput.current?.click()}
            >
              <b>↑</b>Drop an image here
              <br />
              <small>or click to browse</small>
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                loadFile(event.target.files?.[0])
              }
            />
            {fileName && (
              <p className="file">
                ✓ {fileName}{" "}
                <span>
                  {natural.width} × {natural.height}px
                </span>
              </p>
            )}
            <Step
              n="02"
              title="Choose a size"
              sub="Pick a platform or enter your own"
            />
            <div className="presets">
              {presets.map((item) => (
                <button
                  className={preset.id === item.id ? "preset active" : "preset"}
                  key={item.id}
                  onClick={() => choosePreset(item)}
                >
                  <b>{item.group}</b>
                  <span>{item.name}</span>
                  <small>
                    {item.width} × {item.height}
                  </small>
                </button>
              ))}
              <button
                className={preset.id === "custom" ? "preset active" : "preset"}
                onClick={() =>
                  choosePreset({
                    id: "custom",
                    group: "Custom",
                    name: "自定义尺寸",
                    en: "Custom size",
                    width: custom.width,
                    height: custom.height,
                  })
                }
              >
                <b>Custom</b>
                <span>自定义尺寸</span>
                <small>Enter your size</small>
              </button>
            </div>
            {preset.id === "custom" && (
              <div className="custom">
                <label>
                  Width
                  <input
                    type="number"
                    value={custom.width}
                    onChange={(event) =>
                      setCustom({
                        ...custom,
                        width: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <b>×</b>
                <label>
                  Height
                  <input
                    type="number"
                    value={custom.height}
                    onChange={(event) =>
                      setCustom({
                        ...custom,
                        height: Number(event.target.value),
                      })
                    }
                  />
                </label>
              </div>
            )}
            <Step
              n="03"
              title="Shape crop"
              sub="Choose a profile, badge, sticker, or DIY polygon"
            />
            <div className="shape-grid">
              {shapes.map((item) => (
                <button
                  className={shape === item ? "shape active" : "shape"}
                  key={item}
                  onClick={() => setShape(item)}
                >
                  <span className={`shape-icon ${item}`}>
                    {shapeSymbol[item]}
                  </span>
                  <small>{item[0].toUpperCase() + item.slice(1)}</small>
                </button>
              ))}
            </div>
            {shape === "polygon" && (
              <div className="polygon-panel">
                <b>DIY polygon · {polygonPoints.length}/30 points</b>
                <div>
                  <button
                    className={addingPolygonPoint ? "active" : ""}
                    onClick={() => setAddingPolygonPoint(true)}
                    disabled={polygonPoints.length >= 30}
                  >
                    {addingPolygonPoint ? "Click the preview…" : "＋ Add point"}
                  </button>
                  <button
                    onClick={() =>
                      setPolygonPoints([
                        { x: 0.2, y: 0.2 },
                        { x: 0.8, y: 0.2 },
                        { x: 0.8, y: 0.8 },
                        { x: 0.2, y: 0.8 },
                      ])
                    }
                  >
                    Reset 4 points
                  </button>
                </div>
                <small>Drag any orange point in the preview to reshape it.</small>
              </div>
            )}
            <Step
              n="04"
              title="Transform & effects"
              sub="Make the image fit and add useful details"
            />
            <Step
              n="05"
              title="Smart canvas extend"
              sub="Keep the person; fill the empty background"
            />
            <div className="expand-panel">
              <select
                value={expandMode}
                onChange={(event) => {
                  setExpandMode(event.target.value as ExpandMode);
                  if (event.target.value !== "none") setMode("fit");
                }}
              >
                <option value="none">No extension</option>
                <option value="blur">Blurred photo extension</option>
                <option value="mirror">Mirrored photo extension</option>
                <option value="gradient">Gradient extension</option>
                <option value="solid">Solid-color extension</option>
              </select>
              {(expandMode === "blur" || expandMode === "mirror") && (
                <label>
                  Softness{" "}
                  <input
                    type="range"
                    min="8"
                    max="90"
                    value={expandStrength}
                    onChange={(event) =>
                      setExpandStrength(Number(event.target.value))
                    }
                  />{" "}
                  <b>{expandStrength}</b>
                </label>
              )}
              <small>
                Fits the original photo on top of an extended background. It
                does not invent missing scenery.
              </small>
            </div>
            <Step
              n="06"
              title="Privacy cover"
              sub="Place mosaic or a cute sticker exactly where needed"
            />
            <div className="sticker-panel">
              <div>
                {privacyStickers.map((item) => (
                  <button
                    key={item}
                    className={privacySticker === item ? "active" : ""}
                    onClick={() => setPrivacySticker(item)}
                    title={item === "mosaic" ? "Mosaic" : "Privacy sticker"}
                  >
                    {item === "mosaic" ? "▦" : item}
                  </button>
                ))}
              </div>
              <label>
                Size{" "}
                <input
                  type="range"
                  min="12"
                  max="70"
                  value={stickerSize}
                  onChange={(event) =>
                    setStickerSize(Number(event.target.value))
                  }
                />
              </label>
              <button
                className={placingSticker ? "place active" : "place"}
                disabled={!privacySticker || !url}
                onClick={() => setPlacingSticker(true)}
              >
                {placingSticker ? "Click the image…" : "Place on image"}
              </button>
              <button
                onClick={() => {
                  setPrivacySticker("");
                  setPlacingSticker(false);
                }}
                disabled={!privacySticker}
              >
                Clear sticker
              </button>
              <small>
                Choose Mosaic or a sticker, choose its size, then click the
                exact spot you want to cover in the preview.
              </small>
            </div>
            <Step
              n="07"
              title="Light, color & filters"
              sub="Non-destructive browser adjustments"
            />
            <div className="adjustments">
              <RangeControl
                label="Brightness"
                min={0}
                max={200}
                value={adjust.brightness}
                onChange={(value) =>
                  setAdjust({ ...adjust, brightness: value })
                }
              />
              <RangeControl
                label="Contrast"
                min={0}
                max={200}
                value={adjust.contrast}
                onChange={(value) => setAdjust({ ...adjust, contrast: value })}
              />
              <RangeControl
                label="Saturation"
                min={0}
                max={200}
                value={adjust.saturation}
                onChange={(value) =>
                  setAdjust({ ...adjust, saturation: value })
                }
              />
              <RangeControl
                label="Hue"
                min={-180}
                max={180}
                value={adjust.hue}
                onChange={(value) => setAdjust({ ...adjust, hue: value })}
              />
              <RangeControl
                label="Blur"
                min={0}
                max={16}
                value={adjust.blur}
                onChange={(value) => setAdjust({ ...adjust, blur: value })}
              />
            </div>
            <div className="filter-presets">
              <button
                className={adjust.grayscale ? "active" : ""}
                onClick={() =>
                  setAdjust({
                    ...adjust,
                    grayscale: adjust.grayscale ? 0 : 100,
                  })
                }
              >
                B&W
              </button>
              <button
                className={adjust.sepia ? "active" : ""}
                onClick={() =>
                  setAdjust({ ...adjust, sepia: adjust.sepia ? 0 : 100 })
                }
              >
                Sepia
              </button>
              <button
                className={adjust.invert ? "active" : ""}
                onClick={() =>
                  setAdjust({ ...adjust, invert: adjust.invert ? 0 : 100 })
                }
              >
                Invert
              </button>
              <button
                onClick={() =>
                  setAdjust({
                    brightness: 100,
                    contrast: 100,
                    saturation: 100,
                    hue: 0,
                    blur: 0,
                    grayscale: 0,
                    sepia: 0,
                    invert: 0,
                  })
                }
              >
                Clear filters
              </button>
            </div>
            <Step
              n="08"
              title="Text, watermark & canvas"
              sub="Add a caption, background, or border"
            />
            <div className="text-panel">
              <input
                placeholder="Caption or watermark"
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
              <div>
                <label>
                  Text{" "}
                  <input
                    type="color"
                    value={textColor}
                    onChange={(event) => setTextColor(event.target.value)}
                  />
                </label>
                <label>
                  Size{" "}
                  <input
                    type="number"
                    min="12"
                    max="160"
                    value={textSize}
                    onChange={(event) =>
                      setTextSize(Number(event.target.value))
                    }
                  />
                </label>
                <select
                  value={textPosition}
                  onChange={(event) =>
                    setTextPosition(
                      event.target.value as "top" | "center" | "bottom",
                    )
                  }
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
              <div>
                <label>
                  Background{" "}
                  <input
                    type="color"
                    value={background}
                    onChange={(event) => {
                      setBackground(event.target.value);
                      setTransparentBackground(false);
                    }}
                  />
                </label>
                <label>
                  Border{" "}
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(event) => setBorderColor(event.target.value)}
                  />
                </label>
                <label>
                  Width{" "}
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={borderWidth}
                    onChange={(event) =>
                      setBorderWidth(Number(event.target.value))
                    }
                  />
                </label>
              </div>
            </div>
            <div className="background-tools">
              <div className="tolerance-row">
                <span>Solid background tolerance</span>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={backgroundTolerance}
                  onChange={(event) =>
                    setBackgroundTolerance(Number(event.target.value))
                  }
                />
                <b>{backgroundTolerance}</b>
              </div>
              <label className="transparent-check">
                <input
                  type="checkbox"
                  checked={transparentBackground}
                  onChange={(event) => {
                    setTransparentBackground(event.target.checked);
                    if (event.target.checked) setFormat("image/png");
                  }}
                />{" "}
                Transparent PNG
              </label>
              <button onClick={removeSolidBackground} disabled={!url}>
                Remove solid background
              </button>
              <button
                onClick={() => originalUrl && setUrl(originalUrl)}
                disabled={!originalUrl}
              >
                Restore original
              </button>
              <button onClick={() => overlayInput.current?.click()}>
                Add logo/image layer
              </button>
              <input
                ref={overlayInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  loadOverlay(event.target.files?.[0])
                }
              />
              {overlayUrl && (
                <div className="overlay-options">
                  <label>
                    Opacity{" "}
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={overlayOpacity}
                      onChange={(event) =>
                        setOverlayOpacity(Number(event.target.value))
                      }
                    />
                  </label>
                  <select
                    value={overlayPosition}
                    onChange={(event) =>
                      setOverlayPosition(
                        event.target.value as typeof overlayPosition,
                      )
                    }
                  >
                    <option value="top-left">Top left</option>
                    <option value="top-right">Top right</option>
                    <option value="bottom-left">Bottom left</option>
                    <option value="bottom-right">Bottom right</option>
                  </select>
                  <button onClick={() => setOverlayUrl("")}>
                    Remove layer
                  </button>
                </div>
              )}
              <small>
                Pure-color removal samples the top-left background. Use PNG for
                transparency.
              </small>
            </div>
            <button className="reset-all" onClick={resetEdits}>
              Reset all edits
            </button>
            <Step
              n="09"
              title="Product details"
              sub="Optional bilingual size markers and text layer"
            />
            <label className="check">
              <input
                type="checkbox"
                checked={measure}
                onChange={(event) => setMeasure(event.target.checked)}
              />{" "}
              Add dimension arrows
            </label>
            {measure && (
              <div className="annotation">
                <div className="unit-tabs">
                  <button
                    className={unit === "cm" ? "active" : ""}
                    onClick={() => setUnit("cm")}
                  >
                    cm + inch
                  </button>
                  <button
                    className={unit === "in" ? "active" : ""}
                    onClick={() => setUnit("in")}
                  >
                    inch + cm
                  </button>
                </div>
                <div className="three-inputs">
                  <label>
                    W
                    <input
                      value={dims.width}
                      onChange={(event) =>
                        setDims({ ...dims, width: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    H
                    <input
                      value={dims.height}
                      onChange={(event) =>
                        setDims({ ...dims, height: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    D
                    <input
                      value={dims.depth}
                      onChange={(event) =>
                        setDims({ ...dims, depth: event.target.value })
                      }
                    />
                  </label>
                </div>
                <input
                  className="label-input"
                  placeholder="Product name or feature label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                />
                <small className="hint">
                  真实尺寸需要人工测量或已知参照物，照片本身不能自动推断准确厘米。
                </small>
              </div>
            )}
            <Step
              n="10"
              title="Fit & export"
              sub="Choose crop or keep the full image"
            />
            <div className="modes">
              <button
                className={mode === "crop" ? "active" : ""}
                onClick={() => setMode("crop")}
              >
                Crop to fill<small>Best for social posts</small>
              </button>
              <button
                className={mode === "fit" ? "active" : ""}
                onClick={() => setMode("fit")}
              >
                Fit with padding<small>Keep the full image</small>
              </button>
            </div>
          </aside>
          <section className="preview">
            <div className="preview-head">
              <div>
                <small>LIVE PREVIEW</small>
                <strong>
                  {preset.group} · {preset.en}
                </strong>
              </div>
              <b>
                {output.width} × {output.height} px
              </b>
            </div>
            <div
              className={drag ? "stage is-dragging" : "stage"}
              style={{
                aspectRatio: "1 / 1",
                maxWidth: "470px",
                backgroundColor: transparentBackground ? undefined : background,
                backgroundImage:
                  expandMode === "gradient"
                    ? `linear-gradient(135deg, ${background}, #1e293b)`
                    : undefined,
              }}
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={() => {
                setDrag(null);
                setFrameDrag(null);
                setPolygonDrag(null);
              }}
            >
              {url ? (
                <>
                  {(expandMode === "blur" || expandMode === "mirror") && (
                    <img
                      src={url}
                      alt="Extended background"
                      className={`expanded-background ${expandMode} ${shape}`}
                      style={{
                        filter: `blur(${Math.max(3, expandStrength / 2)}px) brightness(82%) saturate(110%)`,
                      }}
                    />
                  )}
                  <img
                    src={url}
                    alt="Preview"
                    className={`preview-image ${shape}`}
                    style={previewStyle}
                  />
                  {mode === "crop" && shape !== "polygon" && (
                    <div
                      className={
                        preset.id === "custom" ? "crop editable" : "crop"
                      }
                      style={{
                        left: `${cropFrame.x * 100}%`,
                        top: `${cropFrame.y * 100}%`,
                        width: `${cropFrame.width * 100}%`,
                        height: `${cropFrame.height * 100}%`,
                      }}
                    >
                      {preset.id === "custom" &&
                        (["nw", "ne", "se", "sw"] as const).map((corner) => (
                          <button
                            key={corner}
                            className={`crop-handle ${corner}`}
                            aria-label={`Resize crop ${corner}`}
                            onPointerDown={(event) =>
                              beginFrameResize(event, corner)
                            }
                          />
                        ))}
                    </div>
                  )}
                  {shape === "polygon" && (
                    <svg className="polygon-preview" viewBox="0 0 100 100">
                      <polygon
                        points={polygonPoints
                          .map((point) => `${point.x * 100},${point.y * 100}`)
                          .join(" ")}
                      />
                      {polygonPoints.map((point, index) => (
                        <circle
                          key={index}
                          cx={point.x * 100}
                          cy={point.y * 100}
                          r="1.8"
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            setPolygonDrag(index);
                          }}
                        />
                      ))}
                    </svg>
                  )}
                  <span className="drag-hint">
                    {addingPolygonPoint
                      ? "CLICK TO ADD A POLYGON POINT"
                      : "DRAG PHOTO TO POSITION"}
                  </span>
                  {measure && (
                    <div className="measure-preview">
                      <span>
                        {dims.width} cm /{" "}
                        {(Number(dims.width) / 2.54).toFixed(1)} in
                      </span>
                      <i></i>
                      <span>{label || "Product dimensions"}</span>
                    </div>
                  )}
                  {text && (
                    <div
                      className={`text-preview ${textPosition}`}
                      style={{
                        color: textColor,
                        fontSize: `${Math.max(14, textSize / 2)}px`,
                      }}
                    >
                      {text}
                    </div>
                  )}
                  {privacySticker && (
                    <span
                      className={
                        privacySticker === "mosaic"
                          ? "privacy-mask-preview mosaic-mask-preview"
                          : "privacy-sticker-preview"
                      }
                      style={{
                        left: `${stickerPosition.x * 100}%`,
                        top: `${stickerPosition.y * 100}%`,
                        fontSize: `${stickerSize}cqw`,
                        width:
                          privacySticker === "mosaic"
                            ? `${stickerSize}%`
                            : undefined,
                        height:
                          privacySticker === "mosaic"
                            ? `${stickerSize}%`
                            : undefined,
                      }}
                    >
                      {privacySticker === "mosaic" ? "▦" : privacySticker}
                    </span>
                  )}
                  {overlayUrl && (
                    <img
                      src={overlayUrl}
                      alt="Overlay layer"
                      className={`overlay-preview ${overlayPosition}`}
                      style={{ opacity: overlayOpacity / 100 }}
                    />
                  )}
                  {borderWidth > 0 && (
                    <div
                      className="border-preview"
                      style={{
                        borderColor,
                        borderWidth: `${Math.max(1, borderWidth / 4)}px`,
                      }}
                    />
                  )}
                  <div
                    className="canvas-zoom"
                    onPointerDown={(event) => event.stopPropagation()}
                    aria-label="Preview zoom"
                  >
                    <button
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      aria-label="Zoom out"
                    >
                      −
                    </button>
                    <input
                      type="range"
                      min=".5"
                      max="2"
                      step=".05"
                      value={zoom}
                      onChange={(event) => setZoom(Number(event.target.value))}
                      aria-label="Preview zoom level"
                    />
                    <button
                      onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                      aria-label="Zoom in"
                    >
                      ＋
                    </button>
                    <button className="zoom-reset" onClick={() => setZoom(1)}>
                      {Math.round(zoom * 100)}%
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty">
                  <b>▧</b>
                  <strong>Your preview appears here</strong>
                  <small>Upload an image to get started</small>
                </div>
              )}
            </div>
            <div className="preview-transform" aria-label="Preview controls">
              <div>
                <button
                  onClick={() => setRotation((rotation + 90) % 360)}
                  disabled={!url}
                >
                  ↻ Rotate
                </button>
                <button onClick={() => setFlipX(!flipX)} disabled={!url}>
                  ↔ Flip H
                </button>
                <button onClick={() => setFlipY(!flipY)} disabled={!url}>
                  ↕ Flip V
                </button>
              </div>
              <span>{rotation}°</span>
            </div>
            <div className="preview-foot">
              <span>
                {url
                  ? mode === "fit"
                    ? "Full image visible · no crop"
                    : `${Math.round(crop.width * natural.width)} × ${Math.round(crop.height * natural.height)} px crop area`
                  : "No image selected"}
              </span>
              {mode === "crop" && (
                <div>
                  <button onClick={() => cropZoom(-0.05)} disabled={!url}>
                    Crop −
                  </button>
                  <button onClick={() => cropZoom(0.05)} disabled={!url}>
                    Crop ＋
                  </button>
                </div>
              )}
            </div>
            <div className="export">
              <label>
                Format{" "}
                <select
                  value={format}
                  onChange={(event) => setFormat(event.target.value as Format)}
                >
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </label>
              {format !== "image/png" && (
                <label>
                  Quality{" "}
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={quality}
                    onChange={(event) => setQuality(Number(event.target.value))}
                  />{" "}
                  {quality}%
                </label>
              )}
              <button className="download" onClick={download} disabled={!url}>
                Download image <b>↓</b>
              </button>
            </div>
          </section>
        </section>
        <section className="tool-cards" id="ecommerce">
          <p className="eyebrow">BUILT FOR EVERYDAY WORK</p>
          <h2>One image tool, many practical jobs.</h2>
          <div>
            <article>
              <b>↔</b>
              <h3>Product dimension maker</h3>
              <p>
                Add width, height, depth, cm and inch labels to furniture,
                clothing, crafts, and marketplace listings.
              </p>
            </article>
            <article>
              <b>✦</b>
              <h3>Shape crop & stickers</h3>
              <p>
                Create profile pictures, product badges, heart cutouts, star
                stickers, and rounded thumbnails.
              </p>
            </article>
            <article>
              <b>▦</b>
              <h3>Marketplace presets</h3>
              <p>
                Prepare product images for Amazon, Etsy, Shopify, social posts,
                and website sharing cards.
              </p>
            </article>
          </div>
        </section>
        <section className="how" id="how">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>Simple tools, useful results.</h2>
          <div>
            <Feature
              icon="01"
              title="Upload"
              text="Your image stays in the browser."
            />
            <Feature
              icon="02"
              title="Edit"
              text="Transform, shape, annotate, and pixelate."
            />
            <Feature
              icon="03"
              title="Download"
              text="Export a ready-to-use image."
            />
          </div>
        </section>
      </main>
      <footer>
        <span>© 2026 SizeCraft</span>
        <span>Free image tools for everyday work.</span>
      </footer>
    </div>
  );
}
function Step({ n, title, sub }: { n: string; title: string; sub: string }) {
  return (
    <div className="step">
      <span>{n}</span>
      <div>
        <strong>{title}</strong>
        <small>{sub}</small>
      </div>
    </div>
  );
}
function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="feature">
      <b>{icon}</b>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
    </div>
  );
}
function RangeControl({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <b>{value}</b>
    </label>
  );
}
export default App;
