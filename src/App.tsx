import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, PointerEvent } from "react";
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
type PrivacyCover = {
  id: number;
  kind: string;
  size: number;
  position: { x: number; y: number };
};
type DimensionMarker = {
  id: number;
  value: string;
  unit: "cm" | "in";
  position: { x: number; y: number };
  length: number;
  rotation: number;
  color: string;
  thickness: number;
  endStyle: "arrows" | "ticks" | "none";
  labelPosition: { x: number; y: number };
  labelRotation: number;
  labelScale: number;
  labelFlipX: boolean;
  labelFlipY: boolean;
  labelVisible: boolean;
};
type TextLayer = {
  id: number;
  content: string;
  color: string;
  size: number;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  fontFamily: "Inter" | "Roboto" | "Poppins" | "Montserrat" | "Open Sans" | "Playfair Display";
  bold: boolean;
  boxWidth: number;
  boxHeight: number;
};
type ImageLayer = {
  id: number;
  url: string;
  name: string;
  position: { x: number; y: number };
  width: number;
  opacity: number;
};
type CollageImage = { id: number; slotIndex: number; url: string; name: string; scale: number; shapeScale: number; position: { x: number; y: number }; shape: Exclude<Shape, "polygon"> };
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

type CollageSlot = { x: number; y: number; w: number; h: number };

function collageShapeStyle(shape: CollageImage["shape"], slot: CollageSlot, scale: number): CSSProperties {
  if (shape === "original") return {};
  const squareWidth = Math.min(1, slot.h / slot.w) * scale;
  const squareHeight = Math.min(1, slot.w / slot.h) * scale;
  const x = (value: number) => 50 + (value - 50) * squareWidth;
  const y = (value: number) => 50 + (value - 50) * squareHeight;
  const polygon = (points: Array<[number, number]>) => `polygon(${points.map(([px, py]) => `${x(px)}% ${y(py)}%`).join(", ")})`;
  if (shape === "circle") return { clipPath: `ellipse(${50 * squareWidth}% ${50 * squareHeight}% at 50% 50%)` };
  if (shape === "ellipse") return { clipPath: `ellipse(${48 * squareWidth}% ${34 * squareHeight}% at 50% 50%)` };
  if (shape === "heart") {
    const heartMask = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='black' d='M50 92C0 62 0 22 22 12C36 5.5 47 15 50 26C53 15 64 5.5 78 12C100 22 100 62 50 92Z'/%3E%3C/svg%3E\")";
    return { WebkitMaskImage: heartMask, maskImage: heartMask, WebkitMaskSize: `${squareWidth * 100}% ${squareHeight * 100}%`, maskSize: `${squareWidth * 100}% ${squareHeight * 100}%`, WebkitMaskPosition: "center", maskPosition: "center", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" };
  }
  if (shape === "star") return { clipPath: polygon([[50, 2], [61, 35], [98, 35], [68, 56], [79, 92], [50, 70], [21, 92], [32, 56], [2, 35], [39, 35]]) };
  if (shape === "hexagon") return { clipPath: polygon([[50, 4], [90, 27], [90, 73], [50, 96], [10, 73], [10, 27]]) };
  if (shape === "triangle") return { clipPath: polygon([[50, 2], [98, 98], [2, 98]]) };
  if (shape === "badge") return { clipPath: polygon([[50, 4], [58, 15], [70, 8], [72, 21], [85, 18], [81, 31], [94, 36], [82, 44], [97, 50], [82, 56], [94, 64], [81, 69], [85, 82], [72, 79], [70, 92], [58, 85], [50, 96], [42, 85], [30, 92], [28, 79], [15, 82], [19, 69], [6, 64], [18, 56], [3, 50], [18, 44], [6, 36], [19, 31], [15, 18], [28, 21], [30, 8], [42, 15]]) };
  const insetX = Math.max(0, (1 - squareWidth) * 50);
  const insetY = Math.max(0, (1 - squareHeight) * 50);
  return { clipPath: `inset(${insetY}% ${insetX}% round 9%)` };
}
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
const defaultPolygonPoints = [
  { x: 0.5, y: 0.12 },
  { x: 0.72, y: 0.2 },
  { x: 0.88, y: 0.5 },
  { x: 0.72, y: 0.8 },
  { x: 0.5, y: 0.88 },
  { x: 0.28, y: 0.8 },
  { x: 0.12, y: 0.5 },
  { x: 0.28, y: 0.2 },
];
const collageTemplates = [
  { id: "two", label: "2 · Split", slots: [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }] },
  { id: "three", label: "3 · Feature", slots: [{ x: 0, y: 0, w: 0.6, h: 1 }, { x: 0.6, y: 0, w: 0.4, h: 0.5 }, { x: 0.6, y: 0.5, w: 0.4, h: 0.5 }] },
  { id: "four", label: "4 · Grid", slots: [{ x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 }, { x: 0, y: 0.5, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }] },
  { id: "five", label: "5 · Photo booth", slots: [{ x: 0.07, y: 0.05, w: 0.4, h: 0.27 }, { x: 0.53, y: 0.05, w: 0.4, h: 0.27 }, { x: 0.07, y: 0.365, w: 0.4, h: 0.27 }, { x: 0.53, y: 0.365, w: 0.4, h: 0.27 }, { x: 0.3, y: 0.68, w: 0.4, h: 0.27 }] },
  { id: "six", label: "6 · Tiles", slots: [{ x: 0, y: 0, w: 1 / 3, h: 0.5 }, { x: 1 / 3, y: 0, w: 1 / 3, h: 0.5 }, { x: 2 / 3, y: 0, w: 1 / 3, h: 0.5 }, { x: 0, y: 0.5, w: 1 / 3, h: 0.5 }, { x: 1 / 3, y: 0.5, w: 1 / 3, h: 0.5 }, { x: 2 / 3, y: 0.5, w: 1 / 3, h: 0.5 }] },
  { id: "seven", label: "7 · Photo booth", slots: [{ x: 0.05, y: 0.04, w: 0.27, h: 0.27 }, { x: 0.365, y: 0.04, w: 0.27, h: 0.27 }, { x: 0.68, y: 0.04, w: 0.27, h: 0.27 }, { x: 0.05, y: 0.365, w: 0.27, h: 0.27 }, { x: 0.365, y: 0.365, w: 0.27, h: 0.27 }, { x: 0.68, y: 0.365, w: 0.27, h: 0.27 }, { x: 0.365, y: 0.69, w: 0.27, h: 0.27 }] },
  { id: "eight", label: "8 · Photo booth", slots: [{ x: 0.04, y: 0.1, w: 0.215, h: 0.36 }, { x: 0.275, y: 0.1, w: 0.215, h: 0.36 }, { x: 0.51, y: 0.1, w: 0.215, h: 0.36 }, { x: 0.745, y: 0.1, w: 0.215, h: 0.36 }, { x: 0.04, y: 0.54, w: 0.215, h: 0.36 }, { x: 0.275, y: 0.54, w: 0.215, h: 0.36 }, { x: 0.51, y: 0.54, w: 0.215, h: 0.36 }, { x: 0.745, y: 0.54, w: 0.215, h: 0.36 }] },
  { id: "nine", label: "9 · Grid", slots: Array.from({ length: 9 }, (_, index) => ({ x: (index % 3) / 3, y: Math.floor(index / 3) / 3, w: 1 / 3, h: 1 / 3 })) },
] as const;

function App() {
  const [url, setUrl] = useState(""),
    [originalUrl, setOriginalUrl] = useState(""),
    [fileName, setFileName] = useState(""),
    [natural, setNatural] = useState({ width: 0, height: 0 });
  const [preset, setPreset] = useState(presets[0]),
    [custom, setCustom] = useState({ width: 1080, height: 1080 }),
    [sizeSelected, setSizeSelected] = useState(false);
  const [format, setFormat] = useState<Format>("image/jpeg"),
    [quality, setQuality] = useState(90),
    [mode, setMode] = useState<"crop" | "fit">("crop");
  const [shape, setShape] = useState<Shape>("original"),
    [shapeScale, setShapeScale] = useState(1),
    [zoom, setZoom] = useState(1),
    [rotation, setRotation] = useState(0),
    [flipX, setFlipX] = useState(false),
    [flipY, setFlipY] = useState(false);
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
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]),
    [selectedTextId, setSelectedTextId] = useState<number | null>(null);
  const [textDrag, setTextDrag] = useState<{
    id: number;
    x: number;
    y: number;
    position: TextLayer["position"];
  } | null>(null);
  const [textResizeDrag, setTextResizeDrag] = useState<{
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [editingTextId, setEditingTextId] = useState<number | null>(null);
  const [imageLayers, setImageLayers] = useState<ImageLayer[]>([]),
    [selectedImageLayerId, setSelectedImageLayerId] = useState<number | null>(null),
    [collageImages, setCollageImages] = useState<CollageImage[]>([]),
    [selectedCollageImageId, setSelectedCollageImageId] = useState<number | null>(null),
    [collageTemplateId, setCollageTemplateId] = useState<string | null>(null),
    [, setCollageUploadStart] = useState<number | null>(null),
    [backgroundTolerance, setBackgroundTolerance] = useState(35);
  const collageUploadStartRef = useRef<number | null>(null);
  const [layerDrag, setLayerDrag] = useState<{
    id: number;
    x: number;
    y: number;
    position: ImageLayer["position"];
  } | null>(null);
  const [layerResizeDrag, setLayerResizeDrag] = useState<{
    id: number;
    x: number;
    width: number;
  } | null>(null);
  const [collageResizeDrag, setCollageResizeDrag] = useState<{
    id: number;
    x: number;
    scale: number;
  } | null>(null);
  const [collageDrag, setCollageDrag] = useState<{
    id: number;
    x: number;
    y: number;
    position: CollageImage["position"];
  } | null>(null);
  const [dimensionMarkers, setDimensionMarkers] = useState<DimensionMarker[]>([]),
    [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [markerDrag, setMarkerDrag] = useState<{
    id: number;
    x: number;
    y: number;
    position: DimensionMarker["position"];
  } | null>(null);
  const [markerResizeDrag, setMarkerResizeDrag] = useState<{
    id: number;
    x: number;
    y: number;
    length: number;
    rotation: number;
  } | null>(null);
  const [markerLabelDrag, setMarkerLabelDrag] = useState<{
    id: number;
    x: number;
    y: number;
    position: DimensionMarker["labelPosition"];
  } | null>(null);
  const [expandMode, setExpandMode] = useState<ExpandMode>("none"),
    [expandStrength, setExpandStrength] = useState(35),
    [privacySticker, setPrivacySticker] = useState(""),
    [stickerSize, setStickerSize] = useState(16),
    [placingSticker, setPlacingSticker] = useState(false);
  const [privacyCovers, setPrivacyCovers] = useState<PrivacyCover[]>([]),
    [selectedCoverId, setSelectedCoverId] = useState<number | null>(null);
  const [stickerDrag, setStickerDrag] = useState<{
    x: number;
    y: number;
    id: number;
    position: PrivacyCover["position"];
  } | null>(null);
  const [stickerResizeDrag, setStickerResizeDrag] = useState<{
    x: number;
    id: number;
    size: number;
  } | null>(null);
  const [fitPosition, setFitPosition] = useState({ x: 0.5, y: 0.5 }),
    [imageOffset, setImageOffset] = useState({ x: 0, y: 0 }),
    [presetFrameOffset, setPresetFrameOffset] = useState({ x: 0, y: 0 }),
    [presetFrameScale, setPresetFrameScale] = useState(1);
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
    action: "move" | "resize";
    corner?: "nw" | "ne" | "se" | "sw";
  } | null>(null);
  const [polygonPoints, setPolygonPoints] = useState(defaultPolygonPoints);
  const [addingPolygonPoint, setAddingPolygonPoint] = useState(false),
    [polygonDrag, setPolygonDrag] = useState<number | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 1, height: 1 }),
    [drag, setDrag] = useState<{
      x: number;
      y: number;
      crop: typeof crop;
      fitPosition: typeof fitPosition;
      imageOffset: typeof imageOffset;
      mode: "crop" | "fit";
    } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null),
    layerInput = useRef<HTMLInputElement>(null),
    privacyInput = useRef<HTMLInputElement>(null);
  const previewSelectionPress = useRef<{
    kind: "layer" | "collage" | "cover";
    id: number;
    wasSelected: boolean;
    moved: boolean;
  } | null>(null);
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
  const visibleCropFrame =
    preset.id === "custom"
      ? customFrame
      : {
          ...cropFrame,
          width: cropFrame.width * presetFrameScale,
          height: cropFrame.height * presetFrameScale,
          x: Math.min(
            1 - cropFrame.width * presetFrameScale,
            Math.max(0, cropFrame.x + presetFrameOffset.x),
          ),
          y: Math.min(
            1 - cropFrame.height * presetFrameScale,
            Math.max(0, cropFrame.y + presetFrameOffset.y),
          ),
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
    setImageOffset({ x: 0, y: 0 });
    setPresetFrameOffset({ x: 0, y: 0 });
    setPresetFrameScale(1);
  }
  function addImageLayers(files: FileList | File[]) {
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!images.length) return;
    const firstId = Date.now();
    setImageLayers((current) => [
      ...current,
      ...images.map((file, index) => ({
        id: firstId + index,
        url: URL.createObjectURL(file),
        name: file.name,
        position: { x: Math.min(0.82, 0.5 + index * 0.045), y: Math.min(0.82, 0.5 + index * 0.045) },
        width: 28,
        opacity: 100,
      })),
    ]);
    setSelectedImageLayerId(firstId);
  }
  function addCollageImages(files: FileList | File[]) {
    const images = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, 9);
    const template = collageTemplates.find((item) => item.id === collageTemplateId);
    if (!images.length || !template) return;
    const firstId = Date.now();
    const start = collageUploadStartRef.current ?? 0;
    const hasTargetSlot = collageUploadStartRef.current !== null;
    setCollageImages((current) => {
      const next = hasTargetSlot ? [...current] : [];
      images.slice(0, template.slots.length - start).forEach((file, index) => {
        const slotIndex = start + index;
        const item = { id: firstId + index, slotIndex, url: URL.createObjectURL(file), name: file.name, scale: 1, shapeScale: 1, position: { x: 0.5, y: 0.5 }, shape: "original" as const };
        const existingIndex = next.findIndex((entry) => entry.slotIndex === slotIndex);
        if (existingIndex >= 0) next[existingIndex] = item;
        else next.push(item);
      });
      return next.sort((left, right) => left.slotIndex - right.slotIndex);
    });
    setSelectedCollageImageId(firstId);
    collageUploadStartRef.current = null;
    setCollageUploadStart(null);
  }
  function prepareCollageUpload(index: number) {
    collageUploadStartRef.current = index;
    setCollageUploadStart(index);
  }
  function choosePreset(next: Preset) {
    setPreset(next);
    setSizeSelected(true);
    setPresetFrameOffset({ x: 0, y: 0 });
    setPresetFrameScale(1);
    if (next.id !== "custom")
      setCustom({ width: next.width, height: next.height });
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!url && !collageTemplateId) return;
    if (placingSticker && privacySticker) {
      const box = event.currentTarget.getBoundingClientRect();
      const id = Date.now();
      setPrivacyCovers((current) => [
        ...current,
        {
          id,
          kind: privacySticker,
          size: stickerSize,
          position: {
            x: Math.min(0.95, Math.max(0.05, (event.clientX - box.left) / box.width)),
            y: Math.min(0.95, Math.max(0.05, (event.clientY - box.top) / box.height)),
          },
        },
      ]);
      setSelectedCoverId(id);
      setPlacingSticker(false);
      return;
    }
    if (!url && !collageTemplateId) return;
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
    if (shape === "polygon") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      x: event.clientX,
      y: event.clientY,
      crop,
      fitPosition,
      imageOffset,
      mode,
    });
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    if (markerResizeDrag) {
      const radians = (markerResizeDrag.rotation * Math.PI) / 180;
      const projection =
        ((event.clientX - markerResizeDrag.x) / box.width) * 100 * Math.cos(radians) +
        ((event.clientY - markerResizeDrag.y) / box.height) * 100 * Math.sin(radians);
      const length = Math.min(88, Math.max(12, markerResizeDrag.length + projection * 2));
      setDimensionMarkers((current) => current.map((marker) => marker.id === markerResizeDrag.id ? { ...marker, length } : marker));
      return;
    }
    if (markerDrag) {
      const position = {
        x: Math.min(0.9, Math.max(0.1, markerDrag.position.x + (event.clientX - markerDrag.x) / box.width)),
        y: Math.min(0.9, Math.max(0.1, markerDrag.position.y + (event.clientY - markerDrag.y) / box.height)),
      };
      setDimensionMarkers((current) => current.map((marker) => marker.id === markerDrag.id ? { ...marker, position } : marker));
      return;
    }
    if (markerLabelDrag) {
      const labelPosition = {
        x: Math.min(0.96, Math.max(0.04, markerLabelDrag.position.x + (event.clientX - markerLabelDrag.x) / box.width)),
        y: Math.min(0.96, Math.max(0.04, markerLabelDrag.position.y + (event.clientY - markerLabelDrag.y) / box.height)),
      };
      setDimensionMarkers((current) => current.map((marker) => marker.id === markerLabelDrag.id ? { ...marker, labelPosition } : marker));
      return;
    }
    if (textDrag) {
      const position = {
        x: Math.min(0.94, Math.max(0.06, textDrag.position.x + (event.clientX - textDrag.x) / box.width)),
        y: Math.min(0.94, Math.max(0.06, textDrag.position.y + (event.clientY - textDrag.y) / box.height)),
      };
      setTextLayers((current) => current.map((layer) => layer.id === textDrag.id ? { ...layer, position } : layer));
      return;
    }
    if (textResizeDrag) {
      const boxWidth = Math.min(92, Math.max(12, textResizeDrag.width + ((event.clientX - textResizeDrag.x) / box.width) * 100));
      const boxHeight = Math.min(80, Math.max(6, textResizeDrag.height + ((event.clientY - textResizeDrag.y) / box.height) * 100));
      setTextLayers((current) => current.map((layer) => layer.id === textResizeDrag.id ? { ...layer, boxWidth, boxHeight } : layer));
      return;
    }
    if (layerDrag) {
      markPreviewSelectionMoved("layer", layerDrag.id);
      const position = {
        x: Math.min(0.9, Math.max(0.1, layerDrag.position.x + (event.clientX - layerDrag.x) / box.width)),
        y: Math.min(0.9, Math.max(0.1, layerDrag.position.y + (event.clientY - layerDrag.y) / box.height)),
      };
      setImageLayers((current) => current.map((layer) => layer.id === layerDrag.id ? { ...layer, position } : layer));
      return;
    }
    if (layerResizeDrag) {
      const width = Math.min(90, Math.max(8, layerResizeDrag.width + ((event.clientX - layerResizeDrag.x) / box.width) * 100));
      setImageLayers((current) => current.map((layer) => layer.id === layerResizeDrag.id ? { ...layer, width } : layer));
      return;
    }
    if (collageResizeDrag) {
      const scale = Math.min(2.5, Math.max(1, collageResizeDrag.scale + ((event.clientX - collageResizeDrag.x) / box.width) * 2));
      setCollageImages((current) => current.map((item) => item.id === collageResizeDrag.id ? { ...item, scale } : item));
      return;
    }
    if (collageDrag) {
      if ((event.buttons & 1) === 0) {
        setCollageDrag(null);
        return;
      }
      markPreviewSelectionMoved("collage", collageDrag.id);
      const position = {
        x: Math.min(1, Math.max(0, collageDrag.position.x + (event.clientX - collageDrag.x) / box.width)),
        y: Math.min(1, Math.max(0, collageDrag.position.y + (event.clientY - collageDrag.y) / box.height)),
      };
      setCollageImages((current) => current.map((item) => item.id === collageDrag.id ? { ...item, position } : item));
      return;
    }
    if (stickerResizeDrag) {
      const size = Math.min(70, Math.max(4, stickerResizeDrag.size + ((event.clientX - stickerResizeDrag.x) / box.width) * 100));
      setStickerSize(size);
      setPrivacyCovers((current) =>
        current.map((cover) =>
          cover.id === stickerResizeDrag.id ? { ...cover, size } : cover,
        ),
      );
      return;
    }
    if (stickerDrag) {
      markPreviewSelectionMoved("cover", stickerDrag.id);
      const position = {
        x: Math.min(0.95, Math.max(0.05, stickerDrag.position.x + (event.clientX - stickerDrag.x) / box.width)),
        y: Math.min(0.95, Math.max(0.05, stickerDrag.position.y + (event.clientY - stickerDrag.y) / box.height)),
      };
      setPrivacyCovers((current) =>
        current.map((cover) =>
          cover.id === stickerDrag.id ? { ...cover, position } : cover,
        ),
      );
      return;
    }
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
      if (frameDrag.action === "move") {
        next.x = Math.min(1 - next.width, Math.max(0, next.x + dx));
        next.y = Math.min(1 - next.height, Math.max(0, next.y + dy));
        setCrop((current) => ({
          ...current,
          x: Math.min(Math.max(0, current.x + dx), 1 - current.width),
          y: Math.min(Math.max(0, current.y + dy), 1 - current.height),
        }));
        if (preset.id === "custom") setCustomFrame(next);
        else
          setPresetFrameOffset({
            x: next.x - cropFrame.x,
            y: next.y - cropFrame.y,
          });
        return;
      }
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
      if (preset.id !== "custom") {
        const ratio = frameDrag.frame.width / frameDrag.frame.height,
          deltaX = frameDrag.corner === "nw" || frameDrag.corner === "sw" ? -dx : dx,
          nextWidth = Math.min(
            Math.min(0.96, 0.96 * ratio),
            Math.max(0.12, frameDrag.frame.width + deltaX),
          ),
          nextHeight = nextWidth / ratio;
        next.width = nextWidth;
        next.height = nextHeight;
        if (frameDrag.corner === "nw" || frameDrag.corner === "sw")
          next.x = frameDrag.frame.x + frameDrag.frame.width - nextWidth;
        if (frameDrag.corner === "nw" || frameDrag.corner === "ne")
          next.y = frameDrag.frame.y + frameDrag.frame.height - nextHeight;
        next.x = Math.min(1 - next.width, Math.max(0, next.x));
        next.y = Math.min(1 - next.height, Math.max(0, next.y));
        setPresetFrameScale(nextWidth / cropFrame.width);
        setPresetFrameOffset({ x: next.x - cropFrame.x, y: next.y - cropFrame.y });
        return;
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
    setImageOffset({
      x: Math.min(0.6, Math.max(-0.6, drag.imageOffset.x + dx)),
      y: Math.min(0.6, Math.max(-0.6, drag.imageOffset.y + dy)),
    });
    setCrop((current) => ({
      ...current,
      x: Math.min(Math.max(0, drag.crop.x - dx), 1 - current.width),
      y: Math.min(Math.max(0, drag.crop.y - dy), 1 - current.height),
    }));
  }
  function cropZoom(delta: number) {
    if (!url) return;
    const sourceRatio = natural.width / natural.height,
      width = Math.min(1, Math.max(aspect / sourceRatio, crop.width - delta)),
      height = Math.min(1, (width / aspect) * sourceRatio);
    setCrop({
      width,
      height,
      x: Math.min(crop.x, 1 - width),
      y: Math.min(crop.y, 1 - height),
    });
    if (preset.id === "custom") {
      setCustomFrame((frame) => {
        const scale = Math.min(0.96 / Math.max(frame.width, frame.height), Math.max(0.12 / Math.min(frame.width, frame.height), 1 - delta));
        const nextWidth = frame.width * scale, nextHeight = frame.height * scale;
        return { width: nextWidth, height: nextHeight, x: (1 - nextWidth) / 2, y: (1 - nextHeight) / 2 };
      });
    } else setPresetFrameScale((value) => Math.min(1.17, Math.max(0.35, value * (1 - delta))));
  }
  function beginFrameResize(
    event: PointerEvent<HTMLButtonElement>,
    corner: "nw" | "ne" | "se" | "sw",
  ) {
    event.stopPropagation();
    setFrameDrag({
      x: event.clientX,
      y: event.clientY,
      frame: visibleCropFrame,
      action: "resize",
      corner,
    });
  }
  function beginFrameMove(event: PointerEvent<HTMLSpanElement>) {
    event.stopPropagation();
    setFrameDrag({
      x: event.clientX,
      y: event.clientY,
      frame: visibleCropFrame,
      action: "move",
    });
  }
  function beginStickerDrag(event: PointerEvent<HTMLSpanElement>, cover: PrivacyCover) {
    event.stopPropagation();
    previewSelectionPress.current = {
      kind: "cover",
      id: cover.id,
      wasSelected: selectedCoverId === cover.id,
      moved: false,
    };
    setStickerDrag({
      x: event.clientX,
      y: event.clientY,
      id: cover.id,
      position: cover.position,
    });
  }
  function beginStickerResize(
    event: PointerEvent<HTMLButtonElement>,
    cover: PrivacyCover,
  ) {
    event.stopPropagation();
    setStickerResizeDrag({ x: event.clientX, id: cover.id, size: cover.size });
  }
  function beginLayerDrag(event: PointerEvent<HTMLDivElement>, layer: ImageLayer) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    previewSelectionPress.current = {
      kind: "layer",
      id: layer.id,
      wasSelected: selectedImageLayerId === layer.id,
      moved: false,
    };
    setLayerDrag({ id: layer.id, x: event.clientX, y: event.clientY, position: layer.position });
  }
  function beginLayerResize(event: PointerEvent<HTMLButtonElement>, layer: ImageLayer) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedImageLayerId(layer.id);
    setLayerResizeDrag({ id: layer.id, x: event.clientX, width: layer.width });
  }
  function beginCollageResize(event: PointerEvent<HTMLButtonElement>, item: CollageImage) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedCollageImageId(item.id);
    setCollageResizeDrag({ id: item.id, x: event.clientX, scale: item.scale });
  }
  function beginCollageDrag(event: PointerEvent<HTMLDivElement>, item: CollageImage) {
    if (placingSticker && privacySticker) return;
    event.preventDefault();
    event.stopPropagation();
    previewSelectionPress.current = {
      kind: "collage",
      id: item.id,
      wasSelected: selectedCollageImageId === item.id,
      moved: false,
    };
    if (item.scale <= 1) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setCollageDrag({ id: item.id, x: event.clientX, y: event.clientY, position: item.position });
  }
  function endCollageInteraction() {
    setCollageDrag(null);
    setCollageResizeDrag(null);
  }
  function markPreviewSelectionMoved(kind: "layer" | "collage" | "cover", id: number) {
    if (previewSelectionPress.current?.kind === kind && previewSelectionPress.current.id === id)
      previewSelectionPress.current.moved = true;
  }
  function completePreviewSelection(kind: "layer" | "collage" | "cover", id: number) {
    const press = previewSelectionPress.current;
    previewSelectionPress.current = null;
    if (press?.kind === kind && press.id === id && press.moved) {
      if (kind === "layer") {
        setSelectedImageLayerId(id);
        setSelectedCollageImageId(null);
      } else if (kind === "collage") {
        setSelectedCollageImageId(id);
        setSelectedImageLayerId(null);
      } else {
        const cover = privacyCovers.find((item) => item.id === id);
        if (cover) setStickerSize(cover.size);
        setSelectedCoverId(id);
      }
      return;
    }
    if (kind === "layer") {
      setSelectedImageLayerId(press?.wasSelected ? null : id);
      setSelectedCollageImageId(null);
    } else if (kind === "collage") {
      setSelectedCollageImageId(press?.wasSelected ? null : id);
      setSelectedImageLayerId(null);
    } else {
      const cover = privacyCovers.find((item) => item.id === id);
      if (cover && !press?.wasSelected) setStickerSize(cover.size);
      setSelectedCoverId(press?.wasSelected ? null : id);
    }
  }
  function beginMarkerDrag(event: PointerEvent<HTMLDivElement>, marker: DimensionMarker) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedMarkerId(marker.id);
    setMarkerDrag({ id: marker.id, x: event.clientX, y: event.clientY, position: marker.position });
  }
  function beginMarkerResize(event: PointerEvent<HTMLButtonElement>, marker: DimensionMarker) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedMarkerId(marker.id);
    setMarkerResizeDrag({ id: marker.id, x: event.clientX, y: event.clientY, length: marker.length, rotation: marker.rotation });
  }
  function beginMarkerLabelDrag(event: PointerEvent<HTMLDivElement>, marker: DimensionMarker) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedMarkerId(marker.id);
    setMarkerLabelDrag({ id: marker.id, x: event.clientX, y: event.clientY, position: marker.labelPosition });
  }
  function beginTextDrag(event: PointerEvent<HTMLDivElement>, layer: TextLayer) {
    if (editingTextId === layer.id) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedTextId(layer.id);
    setSelectedCollageImageId(null);
    setSelectedImageLayerId(null);
    setSelectedCoverId(null);
    setSelectedMarkerId(null);
    setTextDrag({ id: layer.id, x: event.clientX, y: event.clientY, position: layer.position });
  }
  function beginTextResize(event: PointerEvent<HTMLButtonElement>, layer: TextLayer) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedTextId(layer.id);
    setTextResizeDrag({ id: layer.id, x: event.clientX, y: event.clientY, width: layer.boxWidth, height: layer.boxHeight });
  }
  const filterValue = `brightness(${adjust.brightness}%) contrast(${adjust.contrast}%) saturate(${adjust.saturation}%) hue-rotate(${adjust.hue}deg) blur(${adjust.blur}px) grayscale(${adjust.grayscale}%) sepia(${adjust.sepia}%) invert(${adjust.invert}%)`;
  function resetEdits() {
    if (originalUrl) setUrl(originalUrl);
    setZoom(1);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setFitPosition({ x: 0.5, y: 0.5 });
    setImageOffset({ x: 0, y: 0 });
    setPresetFrameOffset({ x: 0, y: 0 });
    setPresetFrameScale(1);
    setShape("original");
    setShapeScale(1);
    setSizeSelected(false);
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
    setTextLayers([]);
    setSelectedTextId(null);
    setImageLayers([]);
    setSelectedImageLayerId(null);
    setCollageImages([]);
    setSelectedCollageImageId(null);
    setCollageTemplateId(null);
    collageUploadStartRef.current = null;
    setCollageUploadStart(null);
    setExpandMode("none");
    setPrivacySticker("");
    setPrivacyCovers([]);
    setSelectedCoverId(null);
    setPlacingSticker(false);
    setCustomFrame({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
    setPolygonPoints(defaultPolygonPoints);
    setAddingPolygonPoint(false);
    setDimensionMarkers([]);
    setSelectedMarkerId(null);
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

  function path(ctx: CanvasRenderingContext2D, width: number, height: number, nextShape: Shape = shape) {
    ctx.beginPath();
    if (nextShape === "polygon") {
      polygonPoints.forEach((point, index) => {
        const x = point.x * width,
          y = point.y * height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      return;
    }
    if (nextShape === "circle") {
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
    if (nextShape === "ellipse") {
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
    if (nextShape === "heart") {
      ctx.moveTo(width / 2, height * 0.92);
      ctx.bezierCurveTo(0, height * 0.62, 0, height * 0.22, width * 0.22, height * 0.12);
      ctx.bezierCurveTo(width * 0.36, height * 0.055, width * 0.47, height * 0.15, width / 2, height * 0.26);
      ctx.bezierCurveTo(width * 0.53, height * 0.15, width * 0.64, height * 0.055, width * 0.78, height * 0.12);
      ctx.bezierCurveTo(width, height * 0.22, width, height * 0.62, width / 2, height * 0.92);
      ctx.closePath();
      return;
    }
    if (nextShape === "triangle") {
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      return;
    }
    if (nextShape === "sticker") {
      ctx.roundRect(0, 0, width, height, Math.min(width, height) * 0.08);
      return;
    }
    const points = nextShape === "hexagon" ? 6 : nextShape === "badge" ? 16 : 10;
    for (let i = 0; i < points; i++) {
      const radius =
          nextShape === "hexagon"
            ? 0.48
            : nextShape === "badge"
              ? i % 2
                ? 0.39
                : 0.48
              : i % 2
                ? 0.32
                : 0.48,
        angle = -Math.PI / 2 + (Math.PI * 2 * i) / points,
        x = width / 2 + Math.cos(angle) * width * radius,
        y = height / 2 + Math.sin(angle) * height * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  function scaledPath(ctx: CanvasRenderingContext2D, width: number, height: number, nextShape: Shape, nextScale: number) {
    if (nextScale === 1) {
      path(ctx, width, height, nextShape);
      return;
    }
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(nextScale, nextScale);
    ctx.translate(-width / 2, -height / 2);
    path(ctx, width, height, nextShape);
    ctx.restore();
  }
  function drawMosaic(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cover: PrivacyCover,
  ) {
    const size = Math.max(8, (width * cover.size) / 100),
      centerX = cover.position.x * width,
      centerY = cover.position.y * height,
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
  function dimensionLabel(marker: DimensionMarker) {
    const value = Number(marker.value) || 0;
    return marker.unit === "cm"
      ? `${value.toFixed(2)} cm / ${(value / 2.54).toFixed(2)} in`
      : `${value.toFixed(2)} in / ${(value * 2.54).toFixed(2)} cm`;
  }
  function arrowHead(marker: DimensionMarker) {
    return Math.min(15, Math.max(3, marker.thickness * 4));
  }
  function drawDimensionMarker(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    marker: DimensionMarker,
  ) {
    const length = (width * marker.length) / 100,
      lineWidth = Math.max((Math.min(width, height) * marker.thickness) / 360, 1),
      arrow = Math.max(lineWidth * 4, (Math.min(width, height) * arrowHead(marker)) / 100),
      fontSize = Math.max(16, width / 44);
    ctx.save();
    ctx.translate(marker.position.x * width, marker.position.y * height);
    ctx.rotate((marker.rotation * Math.PI) / 180);
    ctx.strokeStyle = marker.color;
    ctx.fillStyle = marker.color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(-length / 2, 0);
    ctx.lineTo(length / 2, 0);
    ctx.stroke();
    if (marker.endStyle === "arrows") {
      ctx.beginPath();
      ctx.moveTo(-length / 2, 0);
      ctx.lineTo(-length / 2 + arrow, -arrow * 0.7);
      ctx.lineTo(-length / 2 + arrow, arrow * 0.7);
      ctx.closePath();
      ctx.moveTo(length / 2, 0);
      ctx.lineTo(length / 2 - arrow, -arrow * 0.7);
      ctx.lineTo(length / 2 - arrow, arrow * 0.7);
      ctx.closePath();
      ctx.fill();
    }
    if (marker.endStyle === "ticks") {
      ctx.strokeStyle = marker.color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(-length / 2, -arrow * 0.8);
      ctx.lineTo(-length / 2, arrow * 0.8);
      ctx.moveTo(length / 2, -arrow * 0.8);
      ctx.lineTo(length / 2, arrow * 0.8);
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.translate(marker.labelPosition.x * width, marker.labelPosition.y * height);
    ctx.rotate((marker.labelRotation * Math.PI) / 180);
    ctx.scale(
      marker.labelScale * (marker.labelFlipX ? -1 : 1),
      marker.labelScale * (marker.labelFlipY ? -1 : 1),
    );
    ctx.font = `400 ${fontSize}px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = marker.color;
    ctx.fillText(dimensionLabel(marker), 0, 0);
    ctx.restore();
  }
  function drawTextLayer(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    layer: TextLayer,
  ) {
    if (!layer.content.trim()) return;
    ctx.save();
    const size = Math.max(16, (width * layer.size) / 1080);
    ctx.translate(layer.position.x * width, layer.position.y * height);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.scale(layer.scale, layer.scale);
    ctx.font = `${layer.fontFamily === "Playfair Display" ? "italic " : ""}${layer.bold ? 700 : 400} ${size}px "${layer.fontFamily}", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = layer.color;
    const maxWidth = (width * layer.boxWidth) / 100,
      lineHeight = size * 1.25,
      maxLines = Math.max(1, Math.floor(((height * layer.boxHeight) / 100) / lineHeight)),
      lines: string[] = [];
    let line = "";
    for (const character of Array.from(layer.content)) {
      const candidate = line + character;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = character;
      } else line = candidate;
    }
    if (line) lines.push(line);
    const visibleLines = lines.slice(0, maxLines),
      startY = -((visibleLines.length - 1) * lineHeight) / 2;
    visibleLines.forEach((item, index) =>
      ctx.fillText(item, 0, startY + index * lineHeight, maxWidth),
    );
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
  async function drawPrivacySticker(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cover: PrivacyCover,
  ) {
    ctx.save();
    const size = Math.max(8, (width * cover.size) / 100);
    if (cover.kind.startsWith("blob:")) {
      const sticker = await loadImage(cover.kind);
      ctx.drawImage(
        sticker,
        cover.position.x * width - size / 2,
        cover.position.y * height - size / 2,
        size,
        size,
      );
      ctx.restore();
      return;
    }
    ctx.font = `${size}px "Segoe UI Emoji", Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      cover.kind,
      cover.position.x * width,
      cover.position.y * height,
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
  function drawCoverImage(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    scale = 1,
    position = { x: 0.5, y: 0.5 },
    imageShape: CollageImage["shape"] = "original",
    imageShapeScale = 1,
  ) {
    const shapeSize = imageShape === "original" ? 0 : Math.min(width, height) * imageShapeScale;
    const targetX = imageShape === "original" ? x : x + (width - shapeSize) / 2;
    const targetY = imageShape === "original" ? y : y + (height - shapeSize) / 2;
    const targetWidth = imageShape === "original" ? width : shapeSize;
    const targetHeight = imageShape === "original" ? height : shapeSize;
    const ratio = Math.min(width / image.naturalWidth, height / image.naturalHeight) * scale;
    const drawWidth = image.naturalWidth * ratio;
    const drawHeight = image.naturalHeight * ratio;
    ctx.save();
    ctx.translate(targetX, targetY);
    if (imageShape === "original") {
      ctx.beginPath();
      ctx.rect(0, 0, targetWidth, targetHeight);
    } else {
      path(ctx, targetWidth, targetHeight, imageShape);
    }
    ctx.clip();
    ctx.drawImage(image, (width - drawWidth) * position.x - (targetX - x), (height - drawHeight) * position.y - (targetY - y), drawWidth, drawHeight);
    ctx.restore();
  }
  async function download() {
    if (!url && collageImages.length === 0) return;
    const image = url ? await loadImage(url) : null;
    const canvas = document.createElement("canvas");
    canvas.width = output.width;
    canvas.height = output.height;
    const ctx = canvas.getContext("2d")!;
    if (!transparentBackground || format !== "image/png") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (shape !== "original") {
      ctx.save();
      scaledPath(ctx, canvas.width, canvas.height, shape, shapeScale);
      ctx.clip();
    }
    if (image) {
      const sx = mode === "fit" ? 0 : natural.width * crop.x,
        sy = mode === "fit" ? 0 : natural.height * crop.y,
        sw = mode === "fit" ? natural.width : natural.width * crop.width,
        sh = mode === "fit" ? natural.height : natural.height * crop.height,
        scale = Math.min(canvas.width / sw, canvas.height / sh),
        drawWidth = sw * scale,
        drawHeight = sh * scale,
        destinationX = mode === "fit" ? (canvas.width - drawWidth) * fitPosition.x : (canvas.width - drawWidth) / 2,
        destinationY = mode === "fit" ? (canvas.height - drawHeight) * fitPosition.y : (canvas.height - drawHeight) / 2;
      ctx.save();
      if (shape === "original") {
        ctx.rect(destinationX, destinationY, drawWidth, drawHeight);
        ctx.clip();
      }
      drawExpansion(ctx, image, canvas.width, canvas.height);
      ctx.translate(destinationX + drawWidth / 2, destinationY + drawHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      ctx.filter = filterValue;
      ctx.drawImage(image, sx, sy, sw, sh, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    }
    const collageTemplate = collageTemplates.find((template) => template.id === collageTemplateId);
    for (const item of collageImages) {
      const slot = collageTemplate?.slots[item.slotIndex];
      if (!slot) continue;
      const collageImage = await loadImage(item.url);
      const x = slot.x * canvas.width, y = slot.y * canvas.height, width = slot.w * canvas.width, height = slot.h * canvas.height;
      const isPhotoBooth = ["five", "seven", "eight"].includes(collageTemplate?.id ?? "");
      if (isPhotoBooth) {
        const border = Math.max(3, Math.min(width, height) * 0.045);
        const captionSpace = Math.max(8, height * 0.11);
        ctx.save();
        ctx.shadowColor = "rgba(31, 41, 48, 0.12)";
        ctx.shadowBlur = Math.max(3, border * 1.5);
        ctx.shadowOffsetY = Math.max(2, border * 0.7);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, width, height);
        ctx.restore();
        drawCoverImage(ctx, collageImage, x + border, y + border, width - border * 2, height - border - captionSpace, item.scale, item.position, item.shape, item.shapeScale);
      } else {
        drawCoverImage(ctx, collageImage, x, y, width, height, item.scale, item.position, item.shape, item.shapeScale);
      }
    }
    for (const layer of imageLayers) {
      const overlay = await loadImage(layer.url);
      const targetWidth = canvas.width * (layer.width / 100);
      const targetHeight = (targetWidth * overlay.naturalHeight) / overlay.naturalWidth;
      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;
      ctx.drawImage(overlay, layer.position.x * canvas.width - targetWidth / 2, layer.position.y * canvas.height - targetHeight / 2, targetWidth, targetHeight);
      ctx.restore();
    }
    privacyCovers
      .filter((cover) => cover.kind === "mosaic")
      .forEach((cover) => drawMosaic(ctx, canvas.width, canvas.height, cover));
    if (borderWidth > 0) {
      ctx.save();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = Math.max(1, (canvas.width * borderWidth) / 1080);
      if (shape !== "original") scaledPath(ctx, canvas.width, canvas.height, shape, shapeScale);
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
    if (document.fonts) await document.fonts.load('italic 400 48px "Playfair Display"');
    textLayers.forEach((layer) => drawTextLayer(ctx, canvas.width, canvas.height, layer));
    dimensionMarkers.forEach((marker) =>
      drawDimensionMarker(ctx, canvas.width, canvas.height, marker),
    );
    for (const cover of privacyCovers.filter(
      (item) => item.kind !== "mosaic",
    ))
      await drawPrivacySticker(ctx, canvas.width, canvas.height, cover);
    if (shape !== "original") ctx.restore();
    const extension = format.split("/")[1].replace("jpeg", "jpg"),
      link = document.createElement("a");
    link.download = `${fileName.replace(/\.[^.]+$/, "") || "image"}-${output.width}x${output.height}.${extension}`;
    link.href = canvas.toDataURL(format, quality / 100);
    link.click();
  }

  const previewStyle = {
    objectFit: "contain" as const,
    objectPosition: "center" as const,
    transform: `translate(${imageOffset.x * 100}cqw, ${imageOffset.y * 100}cqw) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
    filter: filterValue,
  };
  const selectedMarker = dimensionMarkers.find(
    (marker) => marker.id === selectedMarkerId,
  );
  const selectedImageLayer = imageLayers.find((layer) => layer.id === selectedImageLayerId);
  const selectedCollageImage = collageImages.find((item) => item.id === selectedCollageImageId);
  const selectedCollageTemplate = collageTemplateId ? collageTemplates.find((template) => template.id === collageTemplateId) : undefined;
  const activePreviewZoom = selectedCollageImage?.scale ?? zoom;
  const activePreviewZoomMinimum = selectedCollageImage ? 1 : 0.5;
  const activePreviewZoomMaximum = selectedCollageImage ? 2.5 : 2;
  function setActivePreviewZoom(next: number) {
    const value = Math.min(activePreviewZoomMaximum, Math.max(activePreviewZoomMinimum, next));
    if (selectedCollageImage) {
      setCollageImages((current) => current.map((item) => item.id === selectedCollageImage.id ? { ...item, scale: value } : item));
      return;
    }
    setZoom(value);
  }
  function resetActivePreviewZoom() {
    if (selectedCollageImage) {
      setCollageImages((current) => current.map((item) => item.id === selectedCollageImage.id ? { ...item, scale: 1, position: { x: 0.5, y: 0.5 } } : item));
      return;
    }
    setZoom(1);
  }
  const activeShapeScale = selectedCollageImage?.shapeScale ?? shapeScale;
  const canAdjustActiveShape = selectedCollageImage ? selectedCollageImage.shape !== "original" : shape !== "original";
  function setActiveShapeScale(next: number) {
    const value = Math.min(1.5, Math.max(0.35, next));
    if (selectedCollageImage) {
      setCollageImages((current) => current.map((item) => item.id === selectedCollageImage.id ? { ...item, shapeScale: value } : item));
      return;
    }
    setShapeScale(value);
  }
  function removeBaseImage() {
    setUrl("");
    setOriginalUrl("");
    setFileName("");
    setNatural({ width: 0, height: 0 });
    setSizeSelected(false);
  }
  function reorderImageLayer(id: number, target: "top" | "bottom" | "up" | "down") {
    setImageLayers((current) => {
      const index = current.findIndex((layer) => layer.id === id);
      if (index < 0) return current;
      const next = [...current];
      const [layer] = next.splice(index, 1);
      const destination = target === "top" ? next.length : target === "bottom" ? 0 : target === "up" ? Math.min(next.length, index + 1) : Math.max(0, index - 1);
      next.splice(destination, 0, layer);
      return next;
    });
  }
  function removeImageLayer(id: number) {
    const index = imageLayers.findIndex((layer) => layer.id === id);
    const fallback = imageLayers[index - 1] ?? imageLayers[index + 1];
    setImageLayers((current) => current.filter((layer) => layer.id !== id));
    setSelectedImageLayerId(fallback?.id ?? null);
  }
  function removeCollageImage(id: number) {
    const ordered = [...collageImages].sort((left, right) => left.slotIndex - right.slotIndex);
    const index = ordered.findIndex((item) => item.id === id);
    const fallback = ordered[index - 1] ?? ordered[index + 1];
    setCollageImages((current) => current.filter((item) => item.id !== id));
    setSelectedCollageImageId(fallback?.id ?? null);
  }
  function toggleImageLayer(id: number) {
    setSelectedImageLayerId((current) => current === id ? null : id);
    setSelectedCollageImageId(null);
  }
  function toggleCollageImage(id: number) {
    setSelectedCollageImageId((current) => current === id ? null : id);
    setSelectedImageLayerId(null);
  }
  function togglePrivacyCover(cover: PrivacyCover) {
    setSelectedCoverId((current) => current === cover.id ? null : cover.id);
    if (selectedCoverId !== cover.id) setStickerSize(cover.size);
  }
  function removePrivacyCover(id: number) {
    const index = privacyCovers.findIndex((cover) => cover.id === id);
    const fallback = privacyCovers[index - 1] ?? privacyCovers[index + 1];
    setPrivacyCovers((current) => current.filter((cover) => cover.id !== id));
    setSelectedCoverId(fallback?.id ?? null);
    if (fallback) setStickerSize(fallback.size);
    setPlacingSticker(false);
  }
  function removeDimensionMarker(id: number) {
    const index = dimensionMarkers.findIndex((marker) => marker.id === id);
    const fallback = dimensionMarkers[index - 1] ?? dimensionMarkers[index + 1];
    setDimensionMarkers((current) => current.filter((marker) => marker.id !== id));
    setSelectedMarkerId(fallback?.id ?? null);
  }
  function updateSelectedMarker(patch: Partial<DimensionMarker>) {
    if (selectedMarkerId === null) return;
    setDimensionMarkers((current) =>
      current.map((marker) =>
        marker.id === selectedMarkerId ? { ...marker, ...patch } : marker,
      ),
    );
  }
  function removeTextLayer(id: number) {
    setTextDrag(null);
    setTextResizeDrag(null);
    setTextLayers((current) => current.filter((layer) => layer.id !== id));
    setSelectedTextId((current) => current === id ? null : current);
    setEditingTextId((current) => current === id ? null : current);
  }
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
          <a className="feedback-link" href="https://github.com/samzixiao/image-tools-site/issues/new?title=%5BFeedback%5D%20&body=What%20were%20you%20trying%20to%20do%3F%0A%0AWhat%20happened%3F%0A%0AFeature%20idea%20%28optional%29%3A" target="_blank" rel="noreferrer">Feedback & ideas ↗</a>
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
              sub="One main image · JPG, PNG, WebP · up to 50 MB"
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
              multiple={false}
              hidden
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                loadFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            {fileName && (
              <p className="file">
                ✓ {fileName}{" "}
                <span>
                  {natural.width} × {natural.height}px
                </span>
              </p>
            )}
            <button className="clear-main-image" disabled={!url} onClick={removeBaseImage}>× Remove main image</button>
            <Step
              n="02"
              title="Choose a size"
              sub="Pick a platform or enter your own"
            />
            <div className="presets">
              {presets.map((item) => (
                <button
                  className={sizeSelected && preset.id === item.id ? "preset active" : "preset"}
                  key={item.id}
                  onClick={() => {
                    if (sizeSelected && preset.id === item.id) setSizeSelected(false);
                    else choosePreset(item);
                  }}
                >
                  <b>{item.group}</b>
                  <span>{item.name}</span>
                  <small>
                    {item.width} × {item.height}
                  </small>
                </button>
              ))}
              <button
                className={sizeSelected && preset.id === "custom" ? "preset active" : "preset"}
                onClick={() =>
                  sizeSelected && preset.id === "custom"
                    ? setSizeSelected(false)
                    : choosePreset({
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
                  className={shape === item && item !== "original" ? "shape active" : "shape"}
                  key={item}
                  onClick={() => setShape(shape === item ? "original" : item)}
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
                      {
                        setPolygonPoints(defaultPolygonPoints);
                        setAddingPolygonPoint(false);
                      }
                    }
                  >
                    Restore original shape
                  </button>
                </div>
                <small>Drag any orange point in the preview to reshape it.</small>
              </div>
            )}
            <Step
              n="04"
              title="Layers & collage"
              sub="Stack multiple image layers or build a 2–9 image collage"
            />
            <div className="layers-panel">
              <div className="layer-section">
                <b>Image layers</b>
                <button disabled={!url && !selectedCollageTemplate} onClick={() => layerInput.current?.click()}>＋ Add image layers</button>
                <input ref={layerInput} type="file" accept="image/*" multiple hidden onChange={(event: ChangeEvent<HTMLInputElement>) => { addImageLayers(event.target.files ?? []); event.target.value = ""; }} />
                {(url || imageLayers.length > 0 || collageImages.length > 0) && (
                  <div className="layer-list">
                    {url && <button className={selectedImageLayerId === null && selectedCollageImageId === null ? "active" : ""} onClick={() => { setSelectedImageLayerId(null); setSelectedCollageImageId(null); }}>Base image · {fileName || "Image"}</button>}
                    {imageLayers.map((layer, index) => (
                      <button key={layer.id} className={layer.id === selectedImageLayerId ? "active" : ""} onClick={() => toggleImageLayer(layer.id)}>Layer {index + 1} · {layer.name}</button>
                    ))}
                    {collageImages.map((item, index) => <button key={`collage-${item.id}`} className={item.id === selectedCollageImageId ? "active" : ""} onClick={() => toggleCollageImage(item.id)}>Collage {index + 1} · {item.name}</button>)}
                  </div>
                )}
                {selectedImageLayer && (
                  <div className="layer-controls">
                    <label>Size <input type="range" min="8" max="90" value={selectedImageLayer.width} onChange={(event) => setImageLayers((current) => current.map((layer) => layer.id === selectedImageLayer.id ? { ...layer, width: Number(event.target.value) } : layer))} /></label>
                    <label>Opacity <input type="range" min="10" max="100" value={selectedImageLayer.opacity} onChange={(event) => setImageLayers((current) => current.map((layer) => layer.id === selectedImageLayer.id ? { ...layer, opacity: Number(event.target.value) } : layer))} /></label>
                    <span className="layer-order">Order: <button onClick={() => reorderImageLayer(selectedImageLayer.id, "bottom")}>Bottom</button><button onClick={() => reorderImageLayer(selectedImageLayer.id, "down")}>↓</button><button onClick={() => reorderImageLayer(selectedImageLayer.id, "up")}>↑</button><button onClick={() => reorderImageLayer(selectedImageLayer.id, "top")}>Top</button></span>
                    <button onClick={() => removeImageLayer(selectedImageLayer.id)}>Delete layer</button>
                  </div>
                )}
                <small>Add as many images as needed. Drag a layer directly in the preview to reposition it.</small>
              </div>
              <div className="layer-section collage-section">
                <b>Collage board</b>
                <div className="collage-templates">
                  {collageTemplates.map((template) => <button key={template.id} className={template.id === collageTemplateId ? "active" : ""} onClick={() => { const isCancel = template.id === collageTemplateId; setCollageTemplateId(isCancel ? null : template.id); collageUploadStartRef.current = null; setCollageUploadStart(null); setSelectedCollageImageId(null); if (!isCancel) setCollageImages((current) => current.filter((item) => item.slotIndex < template.slots.length)); }}>{template.label}</button>)}
                </div>
                {collageImages.length > 0 && (
                  <div className="layer-list">
                    {collageImages.map((item) => <button key={item.id} className={item.id === selectedCollageImageId ? "active" : ""} onClick={() => toggleCollageImage(item.id)}>Tile {item.slotIndex + 1} · {item.name}</button>)}
                  </div>
                )}
                {selectedCollageImage && (
                  <div className="layer-controls">
                    <label>Tile shape
                      <select value={selectedCollageImage.shape} onChange={(event) => setCollageImages((current) => current.map((item) => item.id === selectedCollageImage.id ? { ...item, shape: event.target.value as CollageImage["shape"] } : item))}>
                        {shapes.filter((item): item is CollageImage["shape"] => item !== "polygon").map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
                      </select>
                    </label>
                    <button onClick={() => removeCollageImage(selectedCollageImage.id)}>Remove tile</button>
                  </div>
                )}
                <small>{selectedCollageTemplate ? `${selectedCollageTemplate.slots.length} slots · click an empty tile in the preview to add images one by one. Select a tile, then use the preview controls below to zoom and drag it into position.` : "Choose a collage template to start. Click it again to cancel."}</small>
              </div>
            </div>
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
                    onClick={() => {
                      setPrivacySticker(item);
                      if (url || selectedCollageTemplate) setPlacingSticker(true);
                    }}
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
                  min="4"
                  max="70"
                  value={stickerSize}
                  onChange={(event) => {
                    const size = Number(event.target.value);
                    setStickerSize(size);
                    if (selectedCoverId !== null)
                      setPrivacyCovers((current) =>
                        current.map((cover) =>
                          cover.id === selectedCoverId
                            ? { ...cover, size }
                            : cover,
                        ),
                      );
                  }}
                />
              </label>
              <button onClick={() => privacyInput.current?.click()} disabled={!url && !selectedCollageTemplate}>
                Add custom sticker
              </button>
              <input
                ref={privacyInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setPrivacySticker(URL.createObjectURL(file));
                  setPlacingSticker(true);
                  event.target.value = "";
                }}
              />
              <button
                className={placingSticker ? "place active" : "place"}
                disabled={!privacySticker || (!url && !selectedCollageTemplate)}
                onClick={() => setPlacingSticker(true)}
              >
                {placingSticker ? "Click the image…" : "Place on image"}
              </button>
              <button
                onClick={() => {
                  if (selectedCoverId !== null) removePrivacyCover(selectedCoverId);
                }}
                disabled={selectedCoverId === null}
              >
                Delete selected
              </button>
              {privacyCovers.length > 0 && (
                <div className="cover-list">
                  {privacyCovers.map((cover, index) => (
                    <button
                      key={cover.id}
                      className={selectedCoverId === cover.id ? "active" : ""}
                      onClick={() => {
                        togglePrivacyCover(cover);
                      }}
                    >
                      {cover.kind === "mosaic" ? "▦" : cover.kind} #{index + 1}
                    </button>
                  ))}
                </div>
              )}
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
            <div className="caption-module">
              <button
                className="caption-add"
                disabled={!url && !selectedCollageTemplate}
                onClick={() => {
                  const id = Date.now();
                  setTextLayers((current) => [...current, { id, content: "Your text", color: "#111111", size: 42, position: { x: 0.5, y: 0.82 }, rotation: 0, scale: 1, fontFamily: "Inter", bold: false, boxWidth: 56, boxHeight: 16 }]);
                  setSelectedTextId(id);
                }}
              >
                ＋ Add text layer
              </button>
              <small className="caption-direct-edit">Double-click text in the preview to edit it. Drag to move, use ↘ to resize, and × to delete.</small>
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
              sub="Add movable bilingual dimension markers and a text layer"
            />
            <div className="measure-module">
              <button
                className="measure-add"
                disabled={!url && !selectedCollageTemplate}
                onClick={() => {
                  const id = Date.now();
                  setDimensionMarkers((current) => [
                    ...current,
                    {
                      id,
                      value: "60",
                      unit: "cm",
                      position: { x: 0.5, y: 0.76 },
                      length: 38,
                      rotation: 0,
                      color: "#111111",
                      thickness: 1,
                      endStyle: "arrows",
                      labelPosition: { x: 0.5, y: 0.69 },
                      labelRotation: 0,
                      labelScale: 1,
                      labelFlipX: false,
                      labelFlipY: false,
                      labelVisible: true,
                    },
                  ]);
                  setSelectedMarkerId(id);
                }}
              >
                ＋ Add dimension arrow
              </button>
              {selectedMarker && (
                <div className="measure-editor">
                  <label>
                    Measurement
                    <div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={selectedMarker.value}
                        onChange={(event) =>
                          updateSelectedMarker({ value: event.target.value })
                        }
                      />
                      <select
                        value={selectedMarker.unit}
                        onChange={(event) =>
                          updateSelectedMarker({
                            unit: event.target.value as "cm" | "in",
                          })
                        }
                      >
                        <option value="cm">cm</option>
                        <option value="in">inch</option>
                      </select>
                    </div>
                    <small>{dimensionLabel(selectedMarker)}</small>
                  </label>
                  <label>
                    Arrow length <b>{Math.round(selectedMarker.length)}%</b>
                    <input
                      type="range"
                      min="12"
                      max="88"
                      value={selectedMarker.length}
                      onChange={(event) =>
                        updateSelectedMarker({
                          length: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Rotate <b>{Math.round(selectedMarker.rotation)}°</b>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={selectedMarker.rotation}
                      onChange={(event) =>
                        updateSelectedMarker({
                          rotation: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Arrow color <input type="color" value={selectedMarker.color} onChange={(event) => updateSelectedMarker({ color: event.target.value })} />
                  </label>
                  <label>
                    Stroke <b>{selectedMarker.thickness}px</b>
                    <input type="range" min="1" max="10" value={selectedMarker.thickness} onChange={(event) => updateSelectedMarker({ thickness: Number(event.target.value) })} />
                  </label>
                  <label>
                    Ends
                    <select value={selectedMarker.endStyle} onChange={(event) => updateSelectedMarker({ endStyle: event.target.value as DimensionMarker["endStyle"] })}>
                      <option value="arrows">Double arrows</option>
                      <option value="ticks">Short vertical ticks</option>
                      <option value="none">Plain line</option>
                    </select>
                  </label>
                  <div className="measure-label-controls">
                    <b>Dimension text</b>
                    <label>
                      <input type="checkbox" checked={selectedMarker.labelVisible} onChange={(event) => updateSelectedMarker({ labelVisible: event.target.checked })} /> Show text
                    </label>
                    <label>
                      Text rotate <b>{Math.round(selectedMarker.labelRotation)}°</b>
                      <input type="range" min="-180" max="180" value={selectedMarker.labelRotation} onChange={(event) => updateSelectedMarker({ labelRotation: Number(event.target.value) })} />
                    </label>
                    <label>
                      Text size <b>{selectedMarker.labelScale.toFixed(1)}×</b>
                      <input type="range" min="0.4" max="3" step="0.1" value={selectedMarker.labelScale} onChange={(event) => updateSelectedMarker({ labelScale: Number(event.target.value) })} />
                    </label>
                    <div className="measure-label-actions">
                      <button className={selectedMarker.labelFlipX ? "active" : ""} onClick={() => updateSelectedMarker({ labelFlipX: !selectedMarker.labelFlipX })}>Flip text H</button>
                      <button className={selectedMarker.labelFlipY ? "active" : ""} onClick={() => updateSelectedMarker({ labelFlipY: !selectedMarker.labelFlipY })}>Flip text V</button>
                    </div>
                    <small>Drag the dimension text itself in the preview to move it separately. Its × only removes the text, not the arrow.</small>
                  </div>
                  <button
                    className="measure-remove"
                    onClick={() => {
                      removeDimensionMarker(selectedMarker.id);
                    }}
                  >
                    Delete selected arrow
                  </button>
                </div>
              )}
              {dimensionMarkers.length > 0 && (
                <div className="measure-list">
                  {dimensionMarkers.map((marker, index) => (
                    <button
                      key={marker.id}
                      className={marker.id === selectedMarkerId ? "active" : ""}
                      onClick={() => setSelectedMarkerId(marker.id)}
                    >
                      Arrow {index + 1} · {dimensionLabel(marker)}
                    </button>
                  ))}
                </div>
              )}
              <small className="hint">
                Add multiple arrows, then drag each arrow directly in the preview.
                Enter either cm or inch; the other unit is shown automatically.
              </small>
            </div>
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
                  {sizeSelected ? `${preset.group} · ${preset.en}` : "Original image · no size selected"}
                </strong>
              </div>
              <b>
                {sizeSelected ? `${output.width} × ${output.height} px` : "Original"}
              </b>
            </div>
            <div
              className={`${drag || frameDrag || polygonDrag !== null || markerDrag || markerLabelDrag || markerResizeDrag || textDrag || textResizeDrag || layerDrag || layerResizeDrag || collageResizeDrag || collageDrag ? "stage is-dragging" : "stage"} ${shape !== "original" ? `canvas-shape ${shape}` : ""}`}
              style={{
                aspectRatio: "1 / 1",
                maxWidth: "470px",
                transform: shape !== "original" && !selectedCollageImage ? `scale(${shapeScale})` : undefined,
                transformOrigin: "center center",
                clipPath: shape === "polygon" ? `polygon(${polygonPoints.map((point) => `${point.x * 100}% ${point.y * 100}%`).join(", ")})` : undefined,
                backgroundColor: transparentBackground ? undefined : background,
                backgroundImage:
                  expandMode === "gradient"
                    ? `linear-gradient(135deg, ${background}, #1e293b)`
                    : undefined,
              }}
              onPointerDownCapture={(event) => {
                if (editingTextId === null) return;
                const target = event.target;
                if (target instanceof Element && target.closest(`[data-text-layer-id="${editingTextId}"]`)) return;
                setEditingTextId(null);
              }}
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={() => {
                setDrag(null);
                setFrameDrag(null);
                setPolygonDrag(null);
                setStickerDrag(null);
                setStickerResizeDrag(null);
                setLayerDrag(null);
                setLayerResizeDrag(null);
                setCollageResizeDrag(null);
                setCollageDrag(null);
                setMarkerDrag(null);
                setMarkerResizeDrag(null);
                setMarkerLabelDrag(null);
                setTextDrag(null);
                setTextResizeDrag(null);
              }}
            >
              {url || selectedCollageTemplate ? (
                <>
                  {url && (expandMode === "blur" || expandMode === "mirror") && (
                    <img
                      src={url}
                      alt="Extended background"
                      className={`expanded-background ${expandMode} ${shape}`}
                      style={{
                        filter: `blur(${Math.max(3, expandStrength / 2)}px) brightness(82%) saturate(110%)`,
                      }}
                    />
                  )}
                  {url && <img
                    src={url}
                    alt="Preview"
                    className={`preview-image ${shape}`}
                    style={{
                      ...previewStyle,
                      clipPath: shape === "polygon" ? `polygon(${polygonPoints.map((point) => `${point.x * 100}% ${point.y * 100}%`).join(", ")})` : undefined,
                    }}
                  />}
                  {selectedCollageTemplate?.slots.map((slot, index) => {
                    const item = collageImages.find((entry) => entry.slotIndex === index);
                    const booth = ["five", "seven", "eight"].includes(selectedCollageTemplate.id) ? " photo-booth" : "";
                    return item ? <div key={item.id} className={`${item.id === selectedCollageImageId ? "collage-tile selected" : "collage-tile"}${booth}${item.scale > 1 ? " movable" : ""}`} onPointerDown={(event) => beginCollageDrag(event, item)} onPointerUp={endCollageInteraction} onPointerCancel={endCollageInteraction} onClick={(event) => { event.stopPropagation(); completePreviewSelection("collage", item.id); }} style={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%`, width: `${slot.w * 100}%`, height: `${slot.h * 100}%` }}><div className={`collage-shape-frame ${item.shape}`} style={collageShapeStyle(item.shape, slot, item.shapeScale)}><img src={item.url} alt={`Collage tile ${index + 1}`} style={{ transform: `translate(${(0.5 - item.position.x) * (item.scale - 1) * 200}%, ${(0.5 - item.position.y) * (item.scale - 1) * 200}%) scale(${item.scale})` }} /></div>{item.id === selectedCollageImageId && <button className="collage-resize-handle" aria-label="Zoom collage tile" onPointerDown={(event) => beginCollageResize(event, item)}>↘</button>}</div> : <label key={`empty-${index}`} className={`collage-tile empty${booth}`} onPointerDown={(event) => event.stopPropagation()} style={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%`, width: `${slot.w * 100}%`, height: `${slot.h * 100}%` }}><input className="collage-slot-input" type="file" accept="image/*" aria-label={`Upload image to collage tile ${index + 1}`} onPointerDown={(event) => { event.stopPropagation(); prepareCollageUpload(index); }} onClick={(event) => event.stopPropagation()} onChange={(event: ChangeEvent<HTMLInputElement>) => { addCollageImages(event.target.files ?? []); event.target.value = ""; }} /><span>＋</span></label>;
                  })}
                  {imageLayers.map((layer) => (
                    <div
                      key={layer.id}
                      className={layer.id === selectedImageLayerId ? "image-layer-frame selected editable" : "image-layer-frame editable"}
                      onPointerDown={(event) => beginLayerDrag(event, layer)}
                      onClick={(event) => { event.stopPropagation(); completePreviewSelection("layer", layer.id); }}
                      style={{ opacity: layer.opacity / 100, width: `${layer.width}%`, left: `${layer.position.x * 100}%`, top: `${layer.position.y * 100}%` }}
                    >
                      <img src={layer.url} alt={layer.name} />
                      {layer.id === selectedImageLayerId && <button className="image-layer-resize-handle" aria-label="Resize image layer" onPointerDown={(event) => beginLayerResize(event, layer)}>↘</button>}
                    </div>
                  ))}
                  {url && sizeSelected && mode === "crop" && shape !== "polygon" && (
                    <div
                      className="crop editable"
                      style={{
                        left: `${visibleCropFrame.x * 100}%`,
                        top: `${visibleCropFrame.y * 100}%`,
                        width: `${visibleCropFrame.width * 100}%`,
                        height: `${visibleCropFrame.height * 100}%`,
                      }}
                    >
                      <span
                        className="crop-move-handle"
                        onPointerDown={beginFrameMove}
                      >
                        MOVE FRAME
                      </span>
                      {(["nw", "ne", "se", "sw"] as const).map((corner) => (
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
                  {(url || selectedCollageTemplate) && shape === "polygon" && (
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
                  {addingPolygonPoint && <span className="drag-hint">CLICK TO ADD A POLYGON POINT</span>}
                  {dimensionMarkers.map((marker) => (
                    <div key={marker.id} className="dimension-group">
                      <div
                        className={marker.id === selectedMarkerId ? "measure-line selected editable" : "measure-line editable"}
                        onPointerDown={(event) => beginMarkerDrag(event, marker)}
                        onClick={(event) => { event.stopPropagation(); setSelectedMarkerId(marker.id); }}
                        style={{
                          left: `${marker.position.x * 100}%`,
                          top: `${marker.position.y * 100}%`,
                          width: `${marker.length}%`,
                          transform: `translate(-50%, -50%) rotate(${marker.rotation}deg)`,
                        }}
                      >
                        <svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
                          <line x1="0" y1="10" x2="100" y2="10" stroke={marker.color} strokeWidth={marker.thickness} vectorEffect="non-scaling-stroke" />
                          {marker.endStyle === "arrows" && (() => {
                            const head = arrowHead(marker), y = Math.min(9, head * 0.7);
                            return <>
                              <polygon points={`0,10 ${head},${10 - y} ${head},${10 + y}`} fill={marker.color} />
                              <polygon points={`100,10 ${100 - head},${10 - y} ${100 - head},${10 + y}`} fill={marker.color} />
                            </>;
                          })()}
                          {marker.endStyle === "ticks" && (
                            <>
                              <line x1="0" y1="2" x2="0" y2="18" stroke={marker.color} strokeWidth={marker.thickness} vectorEffect="non-scaling-stroke" />
                              <line x1="100" y1="2" x2="100" y2="18" stroke={marker.color} strokeWidth={marker.thickness} vectorEffect="non-scaling-stroke" />
                            </>
                          )}
                        </svg>
                        {marker.id === selectedMarkerId && (
                          <>
                            <button className="measure-resize-handle" aria-label="Resize arrow" onPointerDown={(event) => beginMarkerResize(event, marker)}>↔</button>
                            <button className="measure-delete-handle" aria-label="Delete dimension arrow" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); removeDimensionMarker(marker.id); }}>×</button>
                          </>
                        )}
                      </div>
                      {marker.labelVisible && <div
                        className={marker.id === selectedMarkerId ? "measure-label selected editable" : "measure-label editable"}
                        onPointerDown={(event) => beginMarkerLabelDrag(event, marker)}
                        onClick={(event) => { event.stopPropagation(); setSelectedMarkerId(marker.id); }}
                        style={{
                          left: `${marker.labelPosition.x * 100}%`,
                          top: `${marker.labelPosition.y * 100}%`,
                          color: marker.color,
                          transform: `translate(-50%, -50%) rotate(${marker.labelRotation}deg) scale(${marker.labelScale * (marker.labelFlipX ? -1 : 1)}, ${marker.labelScale * (marker.labelFlipY ? -1 : 1)})`,
                        }}
                      >
                        {dimensionLabel(marker)}
                        {marker.id === selectedMarkerId && <button className="measure-label-delete-handle" aria-label="Delete dimension text" onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); updateSelectedMarker({ labelVisible: false }); }} onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}>×</button>}
                      </div>
                      }
                    </div>
                  ))}
                  {textLayers.map((layer) => (
                    <div
                      key={layer.id}
                      data-text-layer-id={layer.id}
                      className={layer.id === selectedTextId ? "caption-overlay selected editable" : "caption-overlay editable"}
                      onPointerDown={(event) => beginTextDrag(event, layer)}
                      onClick={(event) => { event.stopPropagation(); setSelectedTextId(layer.id); }}
                      onDoubleClick={(event) => {
                        event.stopPropagation();
                        setSelectedTextId(layer.id);
                        setEditingTextId(layer.id);
                      }}
                      style={{
                        color: layer.color,
                        fontSize: `${Math.max(14, layer.size / 2)}px`,
                        left: `${layer.position.x * 100}%`,
                        top: `${layer.position.y * 100}%`,
                        width: `${layer.boxWidth}%`,
                        height: `${layer.boxHeight}%`,
                        transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                        fontFamily: `"${layer.fontFamily}", Arial, sans-serif`,
                        fontWeight: layer.bold ? 700 : 400,
                        fontStyle: layer.fontFamily === "Playfair Display" ? "italic" : "normal",
                        textShadow: "none",
                      }}
                    >
                      {editingTextId === layer.id ? (
                        <textarea
                          className="caption-inline-editor"
                          autoFocus
                          value={layer.content}
                          aria-label="Edit text layer"
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) =>
                            setTextLayers((current) =>
                              current.map((item) =>
                                item.id === layer.id ? { ...item, content: event.target.value } : item,
                              ),
                            )
                          }
                          onBlur={() => setEditingTextId(null)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              event.currentTarget.blur();
                            }
                          }}
                        />
                      ) : layer.content}
                      {layer.id === selectedTextId && editingTextId !== layer.id && (
                        <>
                          <button className="caption-resize-handle" aria-label="Resize text box" onPointerDown={(event) => beginTextResize(event, layer)}>↘</button>
                          <button
                            className="caption-delete-handle"
                            aria-label="Delete text layer"
                            onPointerDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              removeTextLayer(layer.id);
                            }}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                          >×</button>
                        </>
                      )}
                    </div>
                  ))}
                  {privacyCovers.map((cover) => (
                    <span
                      key={cover.id}
                      className={
                        cover.kind === "mosaic"
                          ? "privacy-mask-preview mosaic-mask-preview editable"
                          : "privacy-sticker-preview editable"
                      }
                      onPointerDown={(event) => beginStickerDrag(event, cover)}
                      onClick={(event) => {
                        event.stopPropagation();
                        completePreviewSelection("cover", cover.id);
                      }}
                      style={{
                        left: `${cover.position.x * 100}%`,
                        top: `${cover.position.y * 100}%`,
                        fontSize: `${cover.size}cqw`,
                        width: cover.kind === "mosaic" ? `${cover.size}%` : undefined,
                        height: cover.kind === "mosaic" ? `${cover.size}%` : undefined,
                        outline:
                          selectedCoverId === cover.id
                            ? "2px solid #e86f5c"
                            : undefined,
                      }}
                    >
                      {cover.kind === "mosaic" ? (
                        "▦"
                      ) : cover.kind.startsWith("blob:") ? (
                        <img src={cover.kind} alt="Custom privacy sticker" />
                      ) : (
                        cover.kind
                      )}
                      {selectedCoverId === cover.id && (
                        <>
                          <button
                            className="sticker-resize-handle"
                            aria-label="Resize privacy cover"
                            onPointerDown={(event) => beginStickerResize(event, cover)}
                          >
                            ↘
                          </button>
                          <button className="sticker-delete-handle" aria-label="Delete privacy cover" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); removePrivacyCover(cover.id); }}>×</button>
                        </>
                      )}
                    </span>
                  ))}
                  {borderWidth > 0 && (
                    <div
                      className="border-preview"
                      style={{
                        borderColor,
                        borderWidth: `${Math.max(1, borderWidth / 4)}px`,
                      }}
                    />
                  )}
                </>
              ) : (
                <label className="empty stage-upload" onPointerDown={(event) => event.stopPropagation()}>
                  <input className="stage-upload-input" type="file" accept="image/*" aria-label="Upload main image in preview" onPointerDown={(event) => event.stopPropagation()} onChange={(event: ChangeEvent<HTMLInputElement>) => { loadFile(event.target.files?.[0]); event.target.value = ""; }} />
                  <b>▧</b>
                  <strong>Click here to upload your main image</strong>
                  <small>Or use the upload button in the left panel</small>
                </label>
              )}
            </div>
            <div className="preview-canvas-tools" aria-label="Canvas controls">
              <button onClick={() => setActivePreviewZoom(activePreviewZoom - 0.1)} disabled={!url && !selectedCollageImage}>−</button>
              <input
                type="range"
                min={activePreviewZoomMinimum}
                max={activePreviewZoomMaximum}
                step=".05"
                value={activePreviewZoom}
                onChange={(event) => setActivePreviewZoom(Number(event.target.value))}
                disabled={!url && !selectedCollageImage}
                aria-label={selectedCollageImage ? "Selected collage tile zoom level" : "Preview zoom level"}
              />
              <button onClick={() => setActivePreviewZoom(activePreviewZoom + 0.1)} disabled={!url && !selectedCollageImage}>＋</button>
              <button onClick={resetActivePreviewZoom} disabled={!url && !selectedCollageImage}>{selectedCollageImage ? `Tile ${selectedCollageImage.slotIndex + 1} · ` : ""}{Math.round(activePreviewZoom * 100)}%</button>
              <span></span>
              <button
                onClick={resetEdits}
                disabled={!url}
              >
                Reset view
              </button>
              <button
                onClick={() => setImageOffset({ x: 0, y: 0 })}
                disabled={!url}
              >
                Center image
              </button>
            </div>
            {(shape !== "original" || (selectedCollageImage !== undefined && selectedCollageImage.shape !== "original")) && (
              <div className="preview-shape-tools" aria-label="Shape scale controls">
                <b>{selectedCollageImage ? `Tile ${selectedCollageImage.slotIndex + 1} shape` : "Shape"} scale</b>
                <button onClick={() => setActiveShapeScale(activeShapeScale - 0.05)} disabled={!canAdjustActiveShape}>−</button>
                <input type="range" min="0.35" max="1.5" step="0.05" value={activeShapeScale} onChange={(event) => setActiveShapeScale(Number(event.target.value))} disabled={!canAdjustActiveShape} aria-label="Shape scale" />
                <button onClick={() => setActiveShapeScale(activeShapeScale + 0.05)} disabled={!canAdjustActiveShape}>＋</button>
                <button onClick={() => setActiveShapeScale(1)} disabled={!canAdjustActiveShape}>{Math.round(activeShapeScale * 100)}%</button>
              </div>
            )}
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
              <button className="download" onClick={download} disabled={!url && collageImages.length === 0}>
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
